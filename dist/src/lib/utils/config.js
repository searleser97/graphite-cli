"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserAuthToken = exports.userConfig = exports.makeId = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const CONFIG_NAME = ".graphite_repo_config";
const USER_CONFIG_PATH = path_1.default.join(os_1.default.homedir(), CONFIG_NAME);
function makeId(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.makeId = makeId;
// TODO: validate the shape of this (possibly using retype)
exports.userConfig = {};
if (fs_extra_1.default.existsSync(USER_CONFIG_PATH)) {
    const userConfigRaw = fs_extra_1.default.readFileSync(USER_CONFIG_PATH);
    try {
        exports.userConfig = JSON.parse(userConfigRaw.toString().trim());
    }
    catch (e) {
        console.log(chalk_1.default.yellow(`Warning: Malformed ${USER_CONFIG_PATH}`));
    }
}
function setUserAuthToken(authToken) {
    const newConfig = Object.assign(Object.assign({}, exports.userConfig), { authToken: authToken });
    setUserConfig(newConfig);
}
exports.setUserAuthToken = setUserAuthToken;
function setUserConfig(config) {
    fs_extra_1.default.writeFileSync(USER_CONFIG_PATH, JSON.stringify(config));
    exports.userConfig = config;
}
//# sourceMappingURL=config.js.map