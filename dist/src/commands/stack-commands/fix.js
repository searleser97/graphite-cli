"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.aliases = exports.builder = exports.description = exports.command = void 0;
const fix_1 = require("../../actions/fix");
const errors_1 = require("../../lib/errors");
const telemetry_1 = require("../../lib/telemetry");
exports.command = "fix";
exports.description = "Fix stack by recursively rebasing branches onto their parents, or by regenerate Graphite stack metadata by walking the Git commit tree and finding branch parents.";
const args = {
    rebase: {
        describe: `Fix stack by recursively rebasing branches onto their parents as defined by Graphite stack metadata.`,
        demandOption: false,
        default: false,
        type: "boolean",
    },
    regen: {
        describe: `Regenerate Graphite stack metadata by walking the Git commit tree and finding branch parents.`,
        demandOption: false,
        default: false,
        type: "boolean",
    },
};
exports.builder = args;
exports.aliases = ["f"];
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.rebase && argv.regen) {
            throw new errors_1.ExitFailedError('Please specify either "--rebase" or "--regen" flag, not both');
        }
        yield fix_1.fixAction({
            action: argv.rebase ? "rebase" : argv.regen ? "regen" : undefined,
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=fix.js.map