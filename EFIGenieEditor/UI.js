import UINumber from "./JavascriptUI/UINumber.js"
import UICheckBox from "./JavascriptUI/UICheckBox.js";
import UITemplate from "./JavascriptUI/UITemplate.js";
import UIButton from "./JavascriptUI/UIButton.js"

import UINumberWithMeasurement from "./UI/UINumberWithMeasurement.js"
import UIDisplayNumberWithMeasurement from "./UI/UIDisplayNumberWithMeasurement.js"

//adapt new ui modules
Object.defineProperty(HTMLElement.prototype, 'Class', {
    enumerable: true,
    set: function(pclass) {
        this.class = pclass;
    }
});
Object.defineProperty(HTMLElement.prototype, 'Value', {
    enumerable: true,
    get: function() {
        return this.value;
    },
    set: function(value) {
        this.value = value;
    }
});

export default { UI: {
    Template: UITemplate,
    Number: UINumber,
    CheckBox: UICheckBox,
    NumberWithMeasurement : UINumberWithMeasurement,
    DisplayNumberWithMeasurement: UIDisplayNumberWithMeasurement,
    Button: UIButton
}}