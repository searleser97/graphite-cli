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
exports.ontoAction = void 0;
const validate_1 = require("../actions/validate");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
const fix_1 = require("./fix");
function ontoAction(onto, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.uncommittedChanges()) {
            throw new errors_1.PreconditionsFailedError("Cannot fix with uncommitted changes");
        }
        const originalBranch = preconditions_1.currentBranchPrecondition();
        yield stackOnto(originalBranch, onto, silent);
        utils_1.checkoutBranch(originalBranch.name);
    });
}
exports.ontoAction = ontoAction;
function stackOnto(currentBranch, onto, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        preconditions_1.branchExistsPrecondition(onto);
        checkBranchCanBeMoved(currentBranch, onto);
        yield validateStack(true);
        const parent = yield getParentForRebaseOnto(currentBranch, onto);
        // Save the old ref from before rebasing so that children can find their bases.
        currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
        // Add try catch check for rebase interactive....
        utils_1.gpExecSync({
            command: `git rebase --onto ${onto} $(git merge-base ${currentBranch.name} ${parent.name}) ${currentBranch.name}`,
            options: { stdio: "ignore" },
        }, () => {
            if (utils_1.rebaseInProgress()) {
                throw new errors_1.RebaseConflictError("Please resolve the rebase conflict and then continue with your `stack onto` command.");
            }
            else {
                throw new errors_1.ExitFailedError(`Rebase failed when moving (${currentBranch.name}) onto (${onto}).`);
            }
        });
        // set current branch's parent only if the rebase succeeds.
        currentBranch.setParentBranchName(onto);
        // Now perform a fix starting from the onto branch:
        for (const child of yield currentBranch.getChildrenFromMeta()) {
            yield fix_1.restackBranch(child, silent);
        }
        utils_1.logInfo(`Successfully moved (${currentBranch.name}) onto (${onto})`);
    });
}
function getParentForRebaseOnto(branch, onto) {
    const metaParent = branch.getParentFromMeta();
    if (metaParent) {
        return metaParent;
    }
    // If no meta parent, automatically recover:
    branch.setParentBranchName(onto);
    return new branch_1.default(onto);
}
function validateStack(silent) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield validate_1.validate("UPSTACK", silent);
        }
        catch (_a) {
            throw new errors_1.ValidationFailedError(`Cannot stack "onto", git branches must match stack.`);
        }
    });
}
function checkBranchCanBeMoved(branch, onto) {
    if (branch.name === utils_1.getTrunk().name) {
        throw new errors_1.PreconditionsFailedError(`Cannot stack (${branch.name}) onto ${onto}, (${branch.name}) is currently set as trunk.`);
    }
}
//# sourceMappingURL=onto.js.map