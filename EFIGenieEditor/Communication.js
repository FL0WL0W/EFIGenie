class EFIGenieLog { 
    variableMetadata = undefined
    logBytes = new ArrayBuffer()
    loggedVariableValues = []

    get saveValue() {
        var objectArray = base64ToArrayBuffer(lzjs.compressToBase64(stringifyObject(this.variableMetadata.GetVariableReferenceList())))
        return (new Uint32Array([objectArray.byteLength]).buffer).concatArray(objectArray).concatArray(LogBytes)
    }
    set saveValue(saveValue) {
        const referenceLength = new Uint32Array(saveValue.slice(0, 4))[0]
        this.variableMetadata = new VariableRegistry(JSON.parse(lzjs.decompressFromBase64(arrayBufferToBase64(saveValue.slice(4, referenceLength + 4)))))
        this.logBytes = saveValue.slice(referenceLength + 4)

        //TODO: parseBytes
    }
}


class Serial {
    #options
    #filters
    #serialPort
    
    get options() { return this.#options }
    set options(options) { 
        this.#options = options
        this.#serialPort = undefined
    }
    get filters() { return this.#filters }
    set filters(filters) { 
        this.#filters = filters
        this.#serialPort = undefined
    }
    constructor(options, filters) {
        this.options = options ?? { baudRate: 115200 }
        this.filters = filters
    }

    async #connect() {
        if(this.#serialPort != undefined && this.#serialPort.readable && this.#serialPort.writable)
            return

        if(!("serial" in navigator))
            throw `WebSerial not supported. please open in a supported browser`

        let ports = await navigator.serial.getPorts({ filter: this.filters })
        if(ports.length !== 1)
            this.#serialPort = await navigator.serial.requestPort({ filter: this.filters })
        else
            this.#serialPort = ports[0]

        await this.#serialPort.open(this.options)
    }

    async read(numberOfBytes = 1, timeout = 1000) {
        await this.#connect()

        async function readWithTimeout(stream, timeout) {
            let trys = 0
            while(stream.locked && trys++ < Math.max(1, timeout / Math.max(timeout / 10, 10)))
                await new Promise(r => setTimeout(r, Math.max(timeout / 10, 10)))
            if(stream.locked)
                return { value: undefined, done: false }

            const reader = stream.getReader();
            const timer = setTimeout(() => {
                reader.releaseLock()
            }, timeout)
            const result = await reader.read()
            clearTimeout(timer)
            reader.releaseLock()
            return result
        }

        let trys = 0
        let cummulativeValue = new ArrayBuffer()
        while(true) {
            const { value, done } = await readWithTimeout(this.#serialPort.readable, timeout)
            if (done)
                throw "Serial closed"
            if (!value && trys++ > 10)
                break
            else {
                trys = 0
                cummulativeValue = cummulativeValue.concatArray(value)
            }
            if (cummulativeValue.byteLength >= numberOfBytes)
                break
                
        }
        return cummulativeValue
    }
    async write(sendBytes, timeout = 1000) {
        await this.#connect()

        let trys = 0
        while(this.#serialPort.writable.locked && trys++ < Math.max(1, timeout / Math.max(timeout / 10, 10)))
            await new Promise(r => setTimeout(r, Math.max(timeout / 10, 10)))
        if(this.#serialPort.writable.locked)
            return

        const writer = this.#serialPort.writable.getWriter()
        await writer.write(sendBytes)
        writer.releaseLock()
    }
}

class EFIGenieSerial extends EFIGenieLog {
    #serial = new Serial(undefined, [ 
        { usbVendorId: 1155, usbProductId: 22336 } 
    ])
    
    variableMetadata = undefined
    variablesToPoll = []
    liveUpdateEvents = []
    previousVariableIds = []

    async pollVariableMetadata() {
        if(this.variableMetadata != undefined)
            return

        let metadataData = new ArrayBuffer()
        let length = 1
        for(let i = 0; i < Math.ceil(length); i++) {
            const data = new Uint8Array([109]).buffer.concatArray(new Uint32Array([i]).buffer) // get metadata
            await this.#serial.write(data)
            let retData = await this.#serial.read(64)
            if(retData.byteLength !== 64) throw "Incorrect number of bytes returned when requesting metadata"
            
            if(i === 0) {
                length = new Uint32Array(retData.slice(0, 4))[0] / 64
                retData = retData.slice(4)
            }
            metadataData = metadataData.concatArray(retData)
        }
            
        metadataData = metadataData.slice(0, length * 64)
        const metadataString = lzjs.decompressFromBase64(arrayBufferToBase64(metadataData))

        this.variableMetadata = new VariableRegistry(JSON.parse(metadataString))
    }

    async pollVariables() {
        await this.pollVariableMetadata()

        var variableIds = []
        const currentTickId = this.variableMetadata.GetVariableId({name: `CurrentTick`, type: `tick`})
        if(currentTickId)
            variableIds.push(currentTickId)
        for (var variableReference in this.variablesToPoll) {
            const variableId = this.variableMetadata.GetVariableId(this.variablesToPoll[variableReference])
            if(variableId != undefined && variableIds.indexOf(variableId) === -1)
                variableIds.push(variableId)
        }
        if(variableIds.length < 1)
            return

        if(variableIds.length != this.previousVariableIds?.length) {
            this.logBytes = new ArrayBuffer()
            this.loggedVariableValues = []
            this.previousVariableIds = variableIds
        } else {
            for(var i = 0; i < variableIds.length; i++){
                if(variableIds[i] !== this.previousVariableIds[i]){
                    this.logBytes = new ArrayBuffer()
                    this.loggedVariableValues = []
                    this.previousVariableIds = variableIds
                    break
                }
            }
        }

        function typeLength(type) {
            switch(type) {
                case 0: return 0
                case 1: return 1
                case 2: return 2
                case 3: return 4
                case 4: return 8
                case 5: return 1
                case 6: return 2
                case 7: return 4
                case 8: return 8
                case 9: return 4
                case 10: return 8
                case 11: return 1
            }
        }
        function parseVariable(arrayBuffer) {
            let type = new Uint8Array(arrayBuffer)[0]
            switch(type) {
                case 0: return
                case 1: return new Uint8Array(arrayBuffer.slice(1))[0]
                case 2: return new Uint16Array(arrayBuffer.slice(1))[0]
                case 3: return new Uint32Array(arrayBuffer.slice(1))[0]
                // case 4: return new Uint64Array(arrayBuffer.slice(1))[0]
                case 5: return new Int8Array(arrayBuffer.slice(1))[0]
                case 6: return new Int16Array(arrayBuffer.slice(1))[0]
                case 7: return new Int32Array(arrayBuffer.slice(1))[0]
                // case 8: return new Int64Array(arrayBuffer.slice(1))[0]
                case 9: return new Float32Array(arrayBuffer.slice(1))[0]
                case 10: return new Float64Array(arrayBuffer.slice(1))[0]
                case 11: return new Uint8Array(arrayBuffer.slice(1))[0] === 1
            }
        }

        let data = new ArrayBuffer()
        for(let i = 0; i < variableIds.length; i++) {
            data = data.concatArray(new Uint8Array([103]).buffer.concatArray(new Uint32Array([variableIds[i]]).buffer))
        }
        await this.#serial.write(data)
        let bytes = new ArrayBuffer()
        let variableValues = {}
        let bytesRead = 0
        for(let i = 0; i < variableIds.length; i++) {
            let tLen = 0
            while(bytes.byteLength - bytesRead < 1 || bytes.byteLength - bytesRead < (tLen = typeLength(new Uint8Array(bytes.slice(bytesRead, bytesRead + 1))[0])) + 1) {
                let value = await this.#serial.read()
                bytes = bytes.concatArray(value)
            }
            variableValues[variableIds[i]] = parseVariable(bytes.slice(bytesRead, bytesRead + tLen + 1))
            bytesRead += tLen + 1
        }
        this.logBytes = this.logBytes.concatArray(bytes)
        this.loggedVariableValues.push(variableValues)

        const thisClass = this
        Object.entries(this.liveUpdateEvents).filter(function(value, index, self) { return self.indexOf(value) === index }).forEach(e => {
            var [elementname, element] = e
            element?.(thisClass.variableMetadata, thisClass.loggedVariableValues[thisClass.loggedVariableValues.length - 1])
        })
    }

    async stopExecution() {
        await this.#serial.write(new Uint8Array([113]).buffer)
        const retData = await this.#serial.read()
        if(retData.byteLength !== 1) throw "Incorrect number of bytes returned when stopping executrion"
        if(new Uint8Array(retData)[0] !== 6) throw "Ack not returned when stopping executrion"
    }

    async startExecution() {
        await this.#serial.write(new Uint8Array([115]).buffer)
        const retData = await this.#serial.read()
        if(retData.byteLength !== 1) throw "Incorrect number of bytes returned when stopping executrion"
        if(new Uint8Array(retData)[0] !== 6) throw "Ack not returned when stopping executrion"
    }

    async writeToAddress(address, data, chunks = 52) {
        let left = data.byteLength
        let i = 0
        while(left > 0) {
            let sendSize = Math.min(chunks, left)
            await this.#serial.write(new Uint8Array([119]).buffer.concatArray(new Uint32Array([ address + i, sendSize]).buffer).concatArray(data.slice(i, i + sendSize)))
            const retData = await this.#serial.read()
            if(retData.byteLength !== 1) throw "Incorrect number of bytes returned when writing data"
            if(new Uint8Array(retData)[0] !== 6) throw "Ack not returned when writing data"
            left -= sendSize
            i += sendSize
        }
    }

    async getConfigAddress() {
        await this.#serial.write(new Uint8Array([99]).buffer)
        const retData = await this.#serial.read(4)
        if(retData.byteLength !== 4) throw "Incorrect number of bytes returned when requesting config address"
        return new Uint32Array(retData)[0]
    }

    async burnBin(bin) {
        let reconnect = this.connected
        this.disconnect()

        await this.stopExecution()
        const configAddress = await this.getConfigAddress()
        await this.writeToAddress(configAddress, bin)
        await this.startExecution()

        if(reconnect)
            this.connect()
    }

    connect() {
        if(this.polling)
            return
        this.polling = true
        this.connected = true
        const thisClass = this
        this.pollVariables().then(function() {
            thisClass.polling = false
            if(thisClass.connected)
                thisClass.connect()
        }).catch(function(e) {
            alert(e)
            thisClass.connected = false
        })
    }
    disconnect() {
        this.connected = false
    }
}

communication = new EFIGenieSerial()

function RealtimeUpdate() {
    communication.connect()
}