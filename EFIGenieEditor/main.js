import './style.css';
import './JavascriptUI/UI.css';

var b;
var configJsonName = `tune.json`
document.addEventListener(`change`, function () { throttle(function () { b.RegisterVariables(); }); });//this is a hack but oh well
const loadConfig = (config) => {
    b.saveValue = parseObject(config);
    let workspace = document.querySelector(`#workspace`);
    workspace.innerHtml = ``;
    workspace.append(b);
    UpdateOverlay();
    let btnLoad = document.querySelector(`#btnLoad`);
    btnLoad.value = ``;
};
document.addEventListener(`DOMContentLoaded`, function () {
    b = new ConfigTop();
    const lastConfig = window.localStorage.getItem(`config`);
    if (lastConfig) {
        loadConfig(lastConfig);
    } else {
        b.RegisterVariables();
    }
    let workspace = document.querySelector(`#workspace`);
    workspace.innerHtml = ``;
    workspace.append(b);
    UpdateOverlay();
    let btnSave = document.querySelector(`#btnSave`);
    btnSave.addEventListener(`click`, function () {
        var cfg = b.saveValue;
        window.localStorage.setItem(`config`, stringifyObject(cfg));
        downloadObject(cfg, configJsonName);
    });
    let btnSaveCompressed = document.querySelector(`#btnSaveCompressed`);
    btnSaveCompressed.addEventListener(`click`, function () {
        var cfg = b.saveValue;
        window.localStorage.setItem(`config`, stringifyObject(cfg));
        downloadCompressedObject(cfg, configJsonName);
    });
    let btnLoad = document.querySelector(`#btnLoad`);
    btnLoad.addEventListener(`click`, function (evt) {
        var test = new FileReader();

        test.onload = function (evt) {
            if (evt.target.readyState != 2) return;
            if (evt.target.error) {
                alert(`Error while reading file`);
                return;
            }

            const result = evt.target.result;
            window.localStorage.setItem(`config`, result);
            loadConfig(result);
        };

        test.readAsText(evt.target.files[0]);
        configJsonName = evt.target.files[0].name;
    });
    let btnSaveBin = document.querySelector(`#btnSaveBin`);
    btnSaveBin.addEventListener(`click`, function () {
        downloadBin(b.GetArrayBuffer(), configJsonName.substring(0, configJsonName.lastIndexOf(".")) + ".bin");
    });

    let selectTarget = document.querySelector(`#selectTarget`);
    selectTarget.addEventListener(`change`, function (evt) {
        b.Inputs.TargetDevice = this.value;
        pinOverlay.pinOut = PinOuts[b.Inputs.TargetDevice];
        UpdateOverlay();
    });
    var targets = ``;
    Object.entries(PinOuts).forEach(entry => {
        const [key, value] = entry;
        targets += `<option value="${key}"${key === b.Inputs.TargetDevice ? ` selected` : ``}>${value.Name}</option>`;
    });
    selectTarget.innerHTML = targets;
});
