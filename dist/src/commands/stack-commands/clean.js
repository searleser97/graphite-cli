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
exports.handler = exports.builder = exports.description = exports.aliases = exports.command = void 0;
const clean_1 = require("../../actions/clean");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    force: {
        describe: `Don't prompt you to confirm when a branch will be deleted.`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "f",
    },
    pull: {
        describe: `Pull the trunk branch from remote before searching for stale branches.`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "p",
    },
};
exports.command = "clean";
exports.aliases = ["c"];
exports.description = "Delete any branches that have been merged or squashed into the trunk branch, and fix their upstack branches recursively.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        yield clean_1.cleanAction({
            pull: argv.pull,
            force: argv.force,
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=clean.js.map