"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logNewline = exports.logDebug = exports.logSuccess = exports.logInfo = exports.logWarn = exports.logError = void 0;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config");
const global_arguments_1 = require("../global-arguments");
function logError(msg) {
    console.log(chalk_1.default.redBright(`ERROR: ${msg}`));
}
exports.logError = logError;
function logWarn(msg) {
    console.log(chalk_1.default.yellow(`WARNING: ${msg}`));
}
exports.logWarn = logWarn;
function logInfo(msg) {
    if (!global_arguments_1.globalArgs.quiet) {
        console.log(`${msg}`);
    }
}
exports.logInfo = logInfo;
function logSuccess(msg) {
    if (!global_arguments_1.globalArgs.quiet) {
        console.log(chalk_1.default.green(`${msg}`));
    }
}
exports.logSuccess = logSuccess;
function logDebug(msg) {
    if (config_1.execStateConfig.outputDebugLogs()) {
        console.log(msg);
    }
}
exports.logDebug = logDebug;
function logNewline() {
    if (!global_arguments_1.globalArgs.quiet) {
        console.log("");
    }
}
exports.logNewline = logNewline;
//# sourceMappingURL=splog.js.map