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
exports.createBranchAction = void 0;
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
function createBranchAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const parentBranch = preconditions_1.currentBranchPrecondition();
        ensureSomeStagedChanges(opts.silent);
        const branchName = newBranchName(opts.branchName);
        checkoutNewBranch(branchName, opts.silent);
        /**
         * Here, we silence errors and ignore them. This
         * isn't great but our main concern is that we're able to create
         * and check out the new branch and these types of error point to
         * larger failure outside of our control.
         */
        utils_1.gpExecSync({
            command: `git commit -m "${opts.message || "Updates"}" ${opts.noVerify ? "--no-verify" : ""}`,
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
            throw new errors_1.ExitFailedError("Failed to commit changes, aborting");
        });
        const currentBranch = branch_1.default.getCurrentBranch();
        if (currentBranch === null) {
            throw new errors_1.ExitFailedError(`Created but failed to checkout ${branchName}. Please try again.`);
        }
        currentBranch.setParentBranchName(parentBranch.name);
    });
}
exports.createBranchAction = createBranchAction;
function ensureSomeStagedChanges(silent) {
    if (!utils_1.detectStagedChanges()) {
        if (!silent) {
            utils_1.gpExecSync({ command: `git status`, options: { stdio: "inherit" } });
        }
        throw new errors_1.PreconditionsFailedError(`Cannot "branch create", no staged changes detected.`);
    }
}
function newBranchName(branchName) {
    return branchName || `${config_1.UserConfig.config.branchPrefix || ""}${utils_1.makeId(6)}`;
}
function checkoutNewBranch(branchName, silent) {
    utils_1.gpExecSync({
        command: `git checkout -b "${branchName}"`,
        options: silent ? { stdio: "ignore" } : {},
    }, (_) => {
        throw new errors_1.ExitFailedError(`Failed to checkout new branch ${branchName}`);
    });
}
//# sourceMappingURL=create_branch.js.map