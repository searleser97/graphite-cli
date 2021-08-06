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
exports.handler = exports.builder = exports.description = exports.command = void 0;
const commit_amend_1 = require("../../actions/commit_amend");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    all: {
        describe: `stage all changes before committing`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "a",
    },
    message: {
        type: "string",
        alias: "m",
        describe: "A new message for the commit",
        demandOption: false,
    },
    edit: {
        type: "boolean",
        describe: "Modify the existing commit message",
        demandOption: false,
        default: true,
    },
    verify: {
        describe: `Run commit hooks`,
        demandOption: false,
        default: true,
        type: "boolean",
    },
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
};
exports.command = "amend";
exports.description = "Amend the most recent commit and fix upstack branches.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        yield commit_amend_1.commitAmendAction({
            message: argv.message,
            noEdit: !argv.edit,
            silent: argv.silent,
            addAll: argv.all,
            noVerify: !argv.verify,
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=amend.js.map