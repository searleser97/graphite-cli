"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalArgs = exports.processGlobalArgumentsMiddleware = exports.globalArgumentsOptions = void 0;
const globalArgumentsOptions = {
    quiet: { alias: "q", default: false, type: "boolean", demandOption: false },
    verify: { default: true, type: "boolean", demandOption: false },
};
exports.globalArgumentsOptions = globalArgumentsOptions;
function processGlobalArgumentsMiddleware(argv) {
    globalArgs.quiet = argv.quiet;
    globalArgs.noVerify = !argv.verify;
}
exports.processGlobalArgumentsMiddleware = processGlobalArgumentsMiddleware;
const globalArgs = { quiet: false, noVerify: false };
exports.globalArgs = globalArgs;
//# sourceMappingURL=index.js.map