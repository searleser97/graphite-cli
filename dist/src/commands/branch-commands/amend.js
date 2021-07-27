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
const amend_1 = require("../../actions/amend");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    message: {
        type: "string",
        alias: "m",
        describe: "The message for the new commit",
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
exports.description = "Given the current changes, adds it to the current branch (identical to git commit) and restacks anything upstream (see below).";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profiledHandler(exports.command, () => __awaiter(void 0, void 0, void 0, function* () {
        yield amend_1.amendAction(argv.silent, argv.message);
    }));
});
exports.handler = handler;
//# sourceMappingURL=amend.js.map