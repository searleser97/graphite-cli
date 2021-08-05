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
exports.restackBranch = exports.fixAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
function fixAction(silent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.uncommittedChanges()) {
            throw new errors_1.PreconditionsFailedError("Cannot fix with uncommitted changes");
        }
        const currentBranch = preconditions_1.currentBranchPrecondition();
        if (currentBranch.name == utils_1.getTrunk().name) {
            // Dont rebase main
            for (const child of yield currentBranch.getChildrenFromMeta()) {
                yield restackBranch(child, silent);
            }
        }
        else {
            yield restackBranch(currentBranch, silent);
        }
        utils_1.checkoutBranch(currentBranch.name);
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
        if (parentBranch.ref() === mergeBase) {
            utils_1.logInfo(`No fix needed for (${currentBranch.name}) on (${parentBranch.name})`);
        }
        else {
            utils_1.logInfo(`Fixing (${chalk_1.default.green(currentBranch.name)}) on (${parentBranch.name})`);
            utils_1.checkoutBranch(currentBranch.name);
            currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
            utils_1.gpExecSync({
                command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${currentBranch.name}`,
                options: { stdio: "ignore" },
            }, () => {
                if (utils_1.rebaseInProgress()) {
                    throw new errors_1.RebaseConflictError("Resolve the conflict (via `git rebase --continue`) and then rerun `gp stack fix` to fix the remaining stack.");
                }
            });
        }
        for (const child of yield currentBranch.getChildrenFromMeta()) {
            yield restackBranch(child, silent);
        }
    });
}
exports.restackBranch = restackBranch;
//# sourceMappingURL=fix.js.map