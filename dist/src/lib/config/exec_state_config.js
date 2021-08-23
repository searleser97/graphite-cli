"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An in-memory object that configures global settings for the current
 * invocation of the Graphite CLI.
 */
class ExecStateConfig {
    constructor() {
        this._data = {};
    }
    setOutputDebugLogs(outputDebugLogs) {
        this._data.outputDebugLogs = outputDebugLogs;
    }
    outputDebugLogs() {
        var _a;
        return (_a = this._data.outputDebugLogs) !== null && _a !== void 0 ? _a : false;
    }
}
const execStateConfig = new ExecStateConfig();
exports.default = execStateConfig;
//# sourceMappingURL=exec_state_config.js.map