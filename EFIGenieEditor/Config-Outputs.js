var BooleanOutputConfigs = [];

class ConfigOperation_DigitalPinWrite {
    static Name = "Digital Pin";
    static Inputs = ["bool"];
    static Template = getFileContents("ConfigGui/Operation_DigitalPinWrite.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    Pin = 0;
    Inverted = 0;
    HighZ = 0;

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            Pin: this.Pin,
            Inverted: this.Inverted,
            HighZ: this.HighZ
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Pin = obj.Pin;
            this.Inverted = obj.Inverted;
            this.HighZ = obj.HighZ;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Detach();

            thisClass.Pin = parseInt($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-inverted", function(){
            thisClass.Detach();

            thisClass.Inverted = this.checked? 1 : 0;

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-highz", function(){
            thisClass.Detach();

            thisClass.HighZ = this.checked? 1 : 0;

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]inverted[$]/g, (this.Inverted === 1? "checked": ""));
        template = template.replace(/[$]highz[$]/g, (this.HighZ === 1? "checked": ""));

        return template;
    }

    GetArrayBufferOperation() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalOutput]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Pin]).buffer); //pin
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([this.Inverted & (this.HighZ? 0x02 : 0x00)]).buffer); //inverted, high z
        
        return arrayBuffer;
    }
}
BooleanOutputConfigs.push(ConfigOperation_DigitalPinWrite);