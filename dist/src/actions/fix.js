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
exports.restackBranch = exports.fixAction = void 0;
const errors_1 = require("../lib/errors");
const log_1 = require("../lib/log");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
function fixAction(silent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.uncommittedChanges()) {
            throw new errors_1.PreconditionsFailedError("Cannot fix with uncommitted changes");
        }
        const originalBranch = preconditions_1.currentBranchPrecondition();
        const childrenRestackedByBranchName = {};
        for (const child of yield originalBranch.getChildrenFromMeta()) {
            const childRestack = yield restackBranch(child, silent);
            childrenRestackedByBranchName[child.name] = childRestack.numberRestacked;
        }
        utils_1.checkoutBranch(originalBranch.name);
        log_1.log(`Fixed:`, { silent });
        for (const branchName of Object.keys(childrenRestackedByBranchName)) {
            const childrenRestacked = childrenRestackedByBranchName[branchName] - 1; // subtracting 1 for branch
            log_1.log(` - ${branchName} ${childrenRestacked > 0
                ? `(${childrenRestacked} descendent${childrenRestacked === 1 ? "" : "s"})`
                : ""}`, { silent });
        }
    });
}
exports.fixAction = fixAction;
function restackBranch(currentBranch, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.rebaseInProgress()) {
            throw new errors_1.RebaseConflictError(`Interactive rebase in progress, cannot fix (${currentBranch.name}). Complete the rebase and re-run fix command.`);
        }
        const parentBranch = currentBranch.getParentFromMeta();
        if (!parentBranch) {
            throw new errors_1.ExitFailedError(`Cannot find parent in stack for (${currentBranch.name}), stopping fix`);
        }
        const mergeBase = currentBranch.getMetaMergeBase();
        if (!mergeBase) {
            throw new errors_1.ExitFailedError(`Cannot find a merge base in the stack for (${currentBranch.name}), stopping fix`);
        }
        currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
        utils_1.checkoutBranch(currentBranch.name);
        utils_1.gpExecSync({
            command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${currentBranch.name}`,
            options: { stdio: "ignore" },
        }, () => {
            if (utils_1.rebaseInProgress()) {
                throw new errors_1.RebaseConflictError("Please resolve the rebase conflict (via `git rebase --continue`) and then rerun `stack fix` to fix the remainder of the stack.");
            }
        });
        let numberRestacked = 1; // 1 for self
        for (const child of yield currentBranch.getChildrenFromMeta()) {
            const childRestack = yield restackBranch(child, silent);
            numberRestacked += childRestack.numberRestacked;
        }
        return { numberRestacked };
    });
}
exports.restackBranch = restackBranch;
//# sourceMappingURL=fix.js.map