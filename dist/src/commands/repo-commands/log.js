"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.desc = exports.command = void 0;
exports.command = "log <command>";
exports.desc = "Configuration settings for the Graphite log command.";
const builder = function (yargs) {
    return yargs
        .commandDir("log-settings", {
        extensions: ["js"],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=log.js.map