"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalArgs = exports.processGlobalArgumentsMiddleware = exports.globalArgumentsOptions = void 0;
const config_1 = require("../config");
const globalArgumentsOptions = {
    interactive: {
        alias: "i",
        default: true,
        type: "boolean",
        demandOption: false,
    },
    quiet: { alias: "q", default: false, type: "boolean", demandOption: false },
    verify: { default: true, type: "boolean", demandOption: false },
    debug: { default: false, type: "boolean", demandOption: false },
};
exports.globalArgumentsOptions = globalArgumentsOptions;
function processGlobalArgumentsMiddleware(argv) {
    globalArgs.quiet = argv.quiet;
    globalArgs.noVerify = !argv.verify;
    globalArgs.interactive = argv.interactive;
    config_1.execStateConfig.setOutputDebugLogs(argv.debug);
}
exports.processGlobalArgumentsMiddleware = processGlobalArgumentsMiddleware;
const globalArgs = { quiet: false, noVerify: false, interactive: true };
exports.globalArgs = globalArgs;
//# sourceMappingURL=index.js.map