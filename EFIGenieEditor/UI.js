import UINumber from "./JavascriptUI/UINumber.js"
import UICheckBox from "./JavascriptUI/UICheckBox.js";
import UIText from "./JavascriptUI/UIText.js";
import UISelection from "./JavascriptUI/UISelection.js";
import UITemplate from "./JavascriptUI/UITemplate.js";
import UITable from "./JavascriptUI/UITable.js";
import UIGraph3D from "./JavascriptUI/UIGraph3D.js"
import UIGraph2D from "./JavascriptUI/UIGraph2D.js"
import UIDialog from "./JavascriptUI/UIDialog.js"
import UIButton from "./JavascriptUI/UIButton.js"

import UIMeasurement from "./UI/UIMeasurement.js"
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
    Text: UIText,
    Selection: UISelection,
    NumberWithMeasurement : UINumberWithMeasurement,
    Table: UITable,
    Graph3D: UIGraph3D,
    Graph2D: UIGraph2D,
    Dialog: UIDialog,
    DisplayNumberWithMeasurement: UIDisplayNumberWithMeasurement,
    Button: UIButton
}}