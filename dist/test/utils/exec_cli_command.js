"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCliCommandAndGetOutput = exports.execCliCommand = void 0;
const child_process_1 = require("child_process");
function execCliCommand(command, opts) {
    child_process_1.execSync(`NODE_ENV=development node ${__dirname}/../../dist/src/index.js ${command}`, {
        stdio: "ignore",
        cwd: opts.fromDir,
    });
}
exports.execCliCommand = execCliCommand;
function execCliCommandAndGetOutput(command, opts) {
    return child_process_1.execSync(`NODE_ENV=development node ${__dirname}/../../dist/src/index.js ${command}`, {
        cwd: opts.fromDir,
    })
        .toString()
        .trim();
}
exports.execCliCommandAndGetOutput = execCliCommandAndGetOutput;
//# sourceMappingURL=exec_cli_command.js.map