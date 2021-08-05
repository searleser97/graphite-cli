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
const create_branch_1 = require("../../actions/create_branch");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    name: {
        type: "string",
        positional: true,
        demandOption: false,
        optional: true,
        describe: "The name of the new branch",
    },
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
    "commit-message": {
        describe: `commit staged changes on the new branch with this message`,
        demandOption: false,
        type: "string",
        alias: "m",
    },
    verify: {
        describe: `Run commit hooks`,
        demandOption: false,
        default: true,
        type: "boolean",
    },
};
exports.command = "create [name]";
exports.description = "Creates a new branch stacked off of the current branch and commit staged changes. If no branch name is specified but a commit message is passed, create a branch name from the message.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        yield create_branch_1.createBranchAction({
            silent: argv.silent,
            branchName: argv.name,
            noVerify: !argv.verify,
            commitMessage: argv["commit-message"],
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=create.js.map