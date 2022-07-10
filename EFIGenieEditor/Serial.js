var SerialPort = undefined

async function SerialConnect() {
    if(!("serial" in navigator)){
        alert(`WebSerial not supported. please open in a supported browser`)
        return
    }
    const filters = [ 
        { usbVendorId: 1155, usbProductId: 22336 } 
    ]
    let ports = await navigator.serial.getPorts()
    if(ports.length !== 1)
        SerialPort = await navigator.serial.requestPort({ filters })
    else
        SerialPort = ports[0]

    await SerialPort.open({ baudRate: 115200 })
    VariableMetadata = undefined
}

async function GetVariableMetaData() {
    if(SerialPort === undefined || !SerialPort.readable || !SerialPort.writable)
        await SerialConnect()

    const writer = SerialPort.writable.getWriter();
    const reader = SerialPort.readable.getReader();

    try {
        let metaDataData = new ArrayBuffer();
        let index = 0
        let length = 1
        while(index < Math.ceil(length)) {
            const data = new Uint8Array([109]).buffer.concatArray(new Uint32Array([index]).buffer); // get metadata
            await writer.write(data);
            let { value, done } = await reader.read();
            if (done) {
                writer.releaseLock();
                reader.releaseLock();
                return;
            }
            if (value) {
                if(index === 0) {
                    length = new Uint32Array(value.slice(0, 4).buffer)[0] / 64
                    value = value.slice(4)
                }
                metaDataData = metaDataData.concatArray(value.buffer);
            }
            index++
        }
        metaDataData = metaDataData.slice(0, length * 64)

        VariableMetadata = new VariableRegistry(JSON.parse(lzjs.decompressFromBase64(arrayBufferToBase64(metaDataData))))
    } catch {

    } finally {
        writer.releaseLock();
        reader.releaseLock();
    }
}

async function GetVariables() {
    if(SerialPort === undefined || !SerialPort.readable || !SerialPort.writable)
        await SerialConnect()

    if(VariableMetadata == undefined)
        await GetVariableMetaData()

    const variableIds = GetVariableIdList()
    if(variableIds.length < 1)
        return
    if(!compareVariableIds(variableIds, previousVariableIds)){
        LogBytes = new ArrayBuffer()
        LoggedVariableValues = []
        previousVariableIds = variableIds
    }

    const writer = SerialPort.writable.getWriter();
    const reader = SerialPort.readable.getReader();

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
            case 4: return new Uint64Array(arrayBuffer.slice(1))[0]
            case 5: return new Int8Array(arrayBuffer.slice(1))[0]
            case 6: return new Int16Array(arrayBuffer.slice(1))[0]
            case 7: return new Int32Array(arrayBuffer.slice(1))[0]
            case 8: return new Int64Array(arrayBuffer.slice(1))[0]
            case 9: return new Float32Array(arrayBuffer.slice(1))[0]
            case 10: return new Float64Array(arrayBuffer.slice(1))[0]
            case 11: return new Uint8Array(arrayBuffer.slice(1))[0] === 1
        }
    }

    try {
        let data = new ArrayBuffer()
        for(let i = 0; i < variableIds.length; i++) {
            data = data.concatArray(new Uint8Array([103]).buffer.concatArray(new Uint32Array([variableIds[i]]).buffer))
        }
        await writer.write(data);
        let retValue = new ArrayBuffer()
        let bytesRead = 0;
        for(let i = 0; i < variableIds.length; i++) {
            let tLen = 0
            while(retValue.byteLength - bytesRead < 1 || retValue.byteLength - bytesRead < (tLen = typeLength(new Uint8Array(retValue.slice(bytesRead, bytesRead + 1))[0])) + 1) {
                const { value, done } = await reader.read();
                if (done) {
                    writer.releaseLock();
                    reader.releaseLock();
                    return;
                }
                if (value) {
                    retValue = retValue.concatArray(value)
                }
            }
            CurrentVariableValues[variableIds[i]] = parseVariable(retValue.slice(bytesRead, bytesRead + tLen + 1))
            bytesRead += tLen + 1
        }
        LogBytes = LogBytes.concatArray(retValue)
        LoggedVariableValues.push(CurrentVariableValues)

        Object.entries(LiveUpdateEvents).filter(function(value, index, self) { return self.indexOf(value) === index; }).forEach(e => {
            var [elementname, element] = e
            element?.()
        })
    } catch {
    } finally {
        writer.releaseLock();
        reader.releaseLock();
    }
}

function RealtimeUpdate() {
    GetVariables().then(function() {
        RealtimeUpdate()
    })
}