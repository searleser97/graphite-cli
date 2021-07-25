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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../lib/utils");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {
    "branch-name": {
        type: "string",
        alias: "b",
        describe: "The name of the target which builds your app for release",
    },
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
class DiffCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const parentBranch = branch_1.default.getCurrentBranch();
            if (parentBranch === null) {
                utils_1.logErrorAndExit(`Cannot find current branch. Please ensure you're running this command atop a checked-out branch.`);
            }
            ensureSomeStagedChanges();
            const branchName = newBranchName(argv);
            checkoutNewBranch(branchName, argv);
            /**
             * Here, we silence errors and ignore them. This
             * isn't great but our main concern is that we're able to create
             * and check out the new branch and these types of error point to
             * larger failure outside of our control.
             */
            utils_1.gpExecSync({
                command: `git commit -m "${argv.message || "Updates"}"`,
                options: {
                    stdio: "inherit",
                },
            }, () => {
                // Commit failed, usually due to precommit hooks. Rollback the branch.
                utils_1.checkoutBranch(parentBranch.name);
                utils_1.gpExecSync({
                    command: `git branch -d ${branchName}`,
                    options: { stdio: "ignore" },
                });
                utils_1.logErrorAndExit("Failed to commit changes, aborting diff");
            });
            const currentBranch = branch_1.default.getCurrentBranch();
            if (currentBranch === null) {
                utils_1.logErrorAndExit(`Created but failed to checkout ${branchName}. Please try again.`);
            }
            currentBranch.setParentBranchName(parentBranch.name);
        });
    }
}
exports.default = DiffCommand;
DiffCommand.args = args;
function ensureSomeStagedChanges() {
    if (!utils_1.detectStagedChanges()) {
        if (!args.silent) {
            utils_1.gpExecSync({ command: `git status`, options: { stdio: "inherit" } });
        }
        utils_1.logErrorAndExit(`Cannot "diff", no staged changes detected.`);
    }
}
function newBranchName(argv) {
    return argv["branch-name"] || `${utils_1.userConfig.branchPrefix || ""}${utils_1.makeId(6)}`;
}
function checkoutNewBranch(branchName, argv) {
    utils_1.gpExecSync({
        command: `git checkout -b "${branchName}"`,
        options: argv.silent ? { stdio: "ignore" } : {},
    }, (_) => {
        utils_1.logInternalErrorAndExit(`Failed to checkout new branch ${branchName}`);
    });
}
//# sourceMappingURL=index.js.map