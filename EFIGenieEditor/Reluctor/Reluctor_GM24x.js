import Reluctor_Template from "./Reluctor_Template.js";
export default class Reluctor_GM24x extends Reluctor_Template {
    static displayName = `Reluctor GM 24X`;

    constructor(prop) {
        super(prop);
        this.length.value = 100;
    }
}
ReluctorConfigs.push(Reluctor_GM24x);
customElements.define(`reluctor-gm24x`, Reluctor_GM24x, { extends: `span` });