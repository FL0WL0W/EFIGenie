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

async function readWithTimeout(stream, timeout) {
    const reader = stream.getReader();
    const timer = setTimeout(() => {
      reader.releaseLock();
    }, timeout);
    const result = await reader.read();
    clearTimeout(timer);
    reader.releaseLock();
    return result;
  }

class EFIGenieWebSerial extends EFIGenieLog {
    variablesToPoll = []
    liveUpdateEvents = []
    previousVariableIds = []
    baudRate = 115200
    filters = [ 
        { usbVendorId: 1155, usbProductId: 22336 } 
    ]

    async serialConnect() {
        if(this.serialPort != undefined && this.serialPort.readable && this.serialPort.writable)
            return

        this.variableMetadata = undefined

        if(!("serial" in navigator))
            throw `WebSerial not supported. please open in a supported browser`

        let ports = await navigator.serial.getPorts({ filter: this.filters })
        if(ports.length !== 1)
            this.serialPort = await navigator.serial.requestPort({ filter: this.filters })
        else
            this.serialPort = ports[0]

        await this.serialPort.open({ baudRate: this.baudRate })
    }

    async getVariableMetadata() {
        if(this.variableMetadata != undefined)
            return

        await this.serialConnect()

        try {
            if(this.serialPort == undefined || !this.serialPort.readable || !this.serialPort.writable)
                throw "Unable to connect to serial"

            var writer = this.serialPort?.writable?.locked? undefined : this.serialPort?.writable?.getWriter()
            var reader = this.serialPort?.readable?.locked? undefined : this.serialPort?.readable?.getReader()
    
            if(writer == undefined || reader == undefined)
                throw "Unable to connect to serial"

            reader.releaseLock()

            let metadataData = new ArrayBuffer()
            let index = 0
            let length = 1
            while(index < Math.ceil(length)) {
                const data = new Uint8Array([109]).buffer.concatArray(new Uint32Array([index]).buffer) // get metadata
                await writer.write(data)
                let { value, done } = await readWithTimeout(this.serialPort.readable, 1000)
                if (done) 
                    throw "Serial closed"
                if (value) {
                    if(index === 0) {
                        length = new Uint32Array(value.slice(0, 4).buffer)[0] / 64
                        value = value.slice(4)
                    }
                    metadataData = metadataData.concatArray(value.buffer)
                }
                index++
            }
            metadataData = metadataData.slice(0, length * 64)

            this.variableMetadata = new VariableRegistry(JSON.parse(lzjs.decompressFromBase64(arrayBufferToBase64(metadataData))))
        } catch(e) {
            writer?.releaseLock?.()
            reader?.releaseLock?.()
            throw e
        } finally {
            writer?.releaseLock?.()
            reader?.releaseLock?.()
        }
    }

    async pollVariables() {
        await this.serialConnect()
        await this.getVariableMetadata()

        if(this.variableMetadata == undefined)
            return

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

        try {
            if(this.serialPort == undefined || !this.serialPort.readable || !this.serialPort.writable)
                throw "Unable to connect to serial"

            var writer = this.serialPort?.writable?.locked? undefined : this.serialPort?.writable?.getWriter()
            var reader = this.serialPort?.readable?.locked? undefined : this.serialPort?.readable?.getReader()
    
            if(writer == undefined || reader == undefined)
                throw "Unable to connect to serial"

            reader.releaseLock()

            let data = new ArrayBuffer()
            for(let i = 0; i < variableIds.length; i++) {
                data = data.concatArray(new Uint8Array([103]).buffer.concatArray(new Uint32Array([variableIds[i]]).buffer))
            }
            await writer.write(data)
            let bytes = new ArrayBuffer()
            let variableValues = {}
            let bytesRead = 0
            for(let i = 0; i < variableIds.length; i++) {
                let tLen = 0
                while(bytes.byteLength - bytesRead < 1 || bytes.byteLength - bytesRead < (tLen = typeLength(new Uint8Array(bytes.slice(bytesRead, bytesRead + 1))[0])) + 1) {
                    const { value, done } = await readWithTimeout(this.serialPort.readable, 1000)
                    if (done) {
                        writer.releaseLock()
                        reader.releaseLock()
                        throw "Serial closed"
                    }
                    if (value) {
                        bytes = bytes.concatArray(value)
                    }
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
        } catch(e) {
            writer?.releaseLock?.()
            reader?.releaseLock?.()
            throw e
        } finally {
            writer?.releaseLock?.()
            reader?.releaseLock?.()
        }
    }

    async burnBin(bin) {
        let reconnect = this.connected
        this.disconnect()
        let trys = 0
        while((this.serialPort?.writable?.locked || this.serialPort?.readable?.locked) && trys++ < 10) await new Promise(r => setTimeout(r, 200));;
        await this.serialConnect()

        try {
            if(this.serialPort == undefined || !this.serialPort.readable || !this.serialPort.writable)
                throw "Unable to connect to serial"

            var writer = this.serialPort?.writable?.locked? undefined : this.serialPort?.writable?.getWriter()
            var reader = this.serialPort?.readable?.locked? undefined : this.serialPort?.readable?.getReader()
    
            if(writer == undefined || reader == undefined)
                throw "Unable to connect to serial"

            reader.releaseLock()

            await writer.write(new Uint8Array([113]).buffer)
            trys = 0
            let cummulativeValue = new ArrayBuffer()
            while(true) {
                const { value, done } = await readWithTimeout(this.serialPort.readable, 1000)
                if (done) {
                    writer.releaseLock()
                    reader.releaseLock()
                    throw "Serial closed"
                }
                if (trys++ > 10) {
                    writer.releaseLock()
                    reader.releaseLock()
                    throw "No Ack"
                }
                if(value)
                    cummulativeValue = cummulativeValue.concatArray(value)
                if (cummulativeValue.byteLength > 0 && new Uint8Array(cummulativeValue.slice(cummulativeValue.byteLength - 1))[0] == 6)
                    break
            }

            let configLoc = 0
            await writer.write(new Uint8Array([99]).buffer)
            trys = 0
            cummulativeValue = new ArrayBuffer()
            while(true) {
                const { value, done } = await readWithTimeout(this.serialPort.readable, 1000)
                if (done) {
                    writer.releaseLock()
                    reader.releaseLock()
                    throw "Serial closed"
                }
                if (trys++ > 10) {
                    writer.releaseLock()
                    reader.releaseLock()
                    throw "Config Location Not Returned"
                }
                if(value)
                    cummulativeValue = cummulativeValue.concatArray(value)
                if (cummulativeValue.byteLength > 3) {
                    configLoc = new Uint32Array(cummulativeValue.slice(cummulativeValue.byteLength - 4, value.byteLength))[0]
                    break
                }
            }

            let left = bin.byteLength
            let i = 0
            while(left > 0) {
                let sendSize = Math.min(52, left)
                const sendData = new Uint8Array([119]).buffer.concatArray(new Uint32Array([ configLoc + i, sendSize]).buffer).concatArray(bin.slice(i, i + sendSize))
                await writer.write(sendData)
                left -= sendSize
                i += sendSize
                trys = 0
                cummulativeValue = new ArrayBuffer()
                while(true) {
                    const { value, done } = await readWithTimeout(this.serialPort.readable, 1000)
                    if (done) {
                        writer.releaseLock()
                        reader.releaseLock()
                        throw "Serial closed"
                    }
                    if (trys++ > 10) {
                        writer.releaseLock()
                        reader.releaseLock()
                        throw "No Ack"
                    }
                    if(value)
                        cummulativeValue = cummulativeValue.concatArray(value)
                    if (cummulativeValue.byteLength > 0 && new Uint8Array(cummulativeValue.slice(cummulativeValue.byteLength - 1))[0] == 6)
                        break
                }
            }

            await writer.write(new Uint8Array([115]).buffer)
            trys = 0
            cummulativeValue = new ArrayBuffer()
            while(true) {
                const { value, done } = await readWithTimeout(this.serialPort.readable, 1000)
                if (done) {
                    writer.releaseLock()
                    reader.releaseLock()
                    throw "Serial closed"
                }
                if (trys++ > 10) {
                    writer.releaseLock()
                    reader.releaseLock()
                    throw "No Ack"
                }
                if(value)
                    cummulativeValue = cummulativeValue.concatArray(value)
                if (cummulativeValue.byteLength > 0 && new Uint8Array(cummulativeValue.slice(cummulativeValue.byteLength - 1))[0] == 6)
                    break
            }
        } catch(e) {
            writer?.releaseLock?.()
            reader?.releaseLock?.()
            if(reconnect)
                this.connect()
            throw e
        } finally {
            writer?.releaseLock?.()
            reader?.releaseLock?.()
            if(reconnect)
                this.connect()
        }
    }

    connect() {
        this.connected = true
        const thisClass = this
        this.pollVariables().then(function() {
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

communication = new EFIGenieWebSerial()

function RealtimeUpdate() {
    communication.connect()
}