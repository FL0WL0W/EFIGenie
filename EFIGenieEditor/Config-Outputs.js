var BooleanOutputConfigs = [];

class ConfigOperation_DigitalPinWrite {
    static Name = "Digital Pin";
    static Inputs = ["bool"];
    static Template = getFileContents("ConfigGui/Operation_DigitalPinWrite.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    Pin = 0xFFFF;
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
            UpdatePinout(thisClass.GUID, thisClass.Pin);

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
        template = template.replace(/[$]pin[$]/g, GeneratePinList(this.GUID, this.Pin, true, false, false));
        template = template.replace(/[$]inverted[$]/g, (this.Inverted === 1? "checked": ""));
        template = template.replace(/[$]highz[$]/g, (this.HighZ === 1? "checked": ""));

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalOutput }, //variable
            { type: "UINT16", value: this.Pin },
            { type: "UINT8", value: this.Inverted | (this.HighZ? 0x02 : 0x00) }
        ]};
    }
}
BooleanOutputConfigs.push(ConfigOperation_DigitalPinWrite);