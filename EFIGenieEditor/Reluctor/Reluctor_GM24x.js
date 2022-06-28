import Reluctor_Template from "./Reluctor_Template.js";
export default class Reluctor_GM24x extends Reluctor_Template {
    static displayName = `Reluctor GM 24X`;

    get value() {
        let value = super.value
        value.type = `Reluctor_GM24x`
        return value
    }
    set value(value) {
        super.value = value
    }

    constructor(prop) {
        super(prop);
        this.length.value = 100;
    }

    GetObjOperation(result) {
        let obj = this.value
        obj.result = result

        return obj
    }
}
ReluctorConfigs.push(Reluctor_GM24x);
customElements.define(`reluctor-gm24x`, Reluctor_GM24x, { extends: `span` });