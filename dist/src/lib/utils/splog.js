"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logNewline = exports.logSuccess = exports.logInfo = exports.logWarn = exports.logInternalErrorAndExit = exports.logErrorAndExit = exports.logError = void 0;
const chalk_1 = __importDefault(require("chalk"));
function logError(msg) {
    console.log(chalk_1.default.redBright(`ERROR: ${msg}`));
}
exports.logError = logError;
function logErrorAndExit(msg) {
    logError(msg);
    process.exit(1);
}
exports.logErrorAndExit = logErrorAndExit;
function logInternalErrorAndExit(msg) {
    console.log(chalk_1.default.yellow(`INTERNAL ERROR: ${msg}`));
    process.exit(1);
}
exports.logInternalErrorAndExit = logInternalErrorAndExit;
function logWarn(msg) {
    console.log(chalk_1.default.yellow(`WARNING: ${msg}`));
}
exports.logWarn = logWarn;
function logInfo(msg) {
    console.log(chalk_1.default.blueBright(`${msg}`));
}
exports.logInfo = logInfo;
function logSuccess(msg) {
    console.log(chalk_1.default.green(`${msg}`));
}
exports.logSuccess = logSuccess;
function logNewline() {
    console.log("");
}
exports.logNewline = logNewline;
//# sourceMappingURL=splog.js.map