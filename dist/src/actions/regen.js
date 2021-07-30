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
exports.regenAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const log_1 = require("../lib/log");
const splog_1 = require("../lib/utils/splog");
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
function regenAction(silent) {
    return __awaiter(this, void 0, void 0, function* () {
        const branch = branch_1.default.getCurrentBranch();
        if (branch === null) {
            splog_1.logWarn(`No current branch. Please checkout a branch in the stack to use regen.`);
            return;
        }
        const trunk = trunk_1.getTrunk();
        const baseBranch = getStackBaseBranch(branch, trunk);
        if (baseBranch === null) {
            splog_1.logWarn(`Current branch matches trunk (${trunk_1.getTrunk()}). No stack to regen.`);
            return;
        }
        printBranchNameStack(`(Original git infered stack)`, baseBranch.stackByTracingGitParents(), silent);
        printBranchNameStack(`(Original graphite recorded stack)`, baseBranch.stackByTracingMetaParents(), silent);
        // Walk the current branch down to the base and create stacks.
        const baseBranchParents = baseBranch.getParentsFromGit();
        // TODO (nicholasyan): this is a short-term band-aid. We need to handle
        // multiple parents in the long-term.
        yield recursiveFix(baseBranch, baseBranchParents[0], silent);
        printBranchNameStack(`(New graphite stack)`, baseBranch.stackByTracingMetaParents(), silent);
    });
}
exports.regenAction = regenAction;
// Returns the first non-trunk base branch. If there is no non-trunk branch
// - the current branch is trunk - we return null.
function getStackBaseBranch(currentBranch, trunk) {
    if (currentBranch === trunk) {
        return null;
    }
    let baseBranch = currentBranch;
    let baseBranchParent = baseBranch.getParentFromMeta();
    while (baseBranchParent !== undefined && baseBranchParent !== trunk) {
        baseBranch = baseBranchParent;
        baseBranchParent = baseBranch.getParentFromMeta();
    }
    return baseBranch;
}
function printBranchNameStack(message, names, silent) {
    log_1.log(`[${names.map((name) => `(${chalk_1.default.green(name)})`).join("->")}] ${message}`, { silent });
}
function recursiveFix(currentBranch, newParent, silent) {
    const oldMetaParent = currentBranch.getParentFromMeta();
    // The only time we expect newParent to be undefined is if we're fixing
    // the base branch which is behind trunk.
    if (newParent) {
        log_1.log(`Updating (${currentBranch.name}) branch parent from (${oldMetaParent === null || oldMetaParent === void 0 ? void 0 : oldMetaParent.name}) to (${chalk_1.default.green(newParent.name)})`, { silent });
        currentBranch.setParentBranchName(newParent.name);
    }
    const gitChildren = currentBranch.getChildrenFromGit();
    gitChildren.forEach((child) => {
        recursiveFix(child, currentBranch, silent);
    });
}
//# sourceMappingURL=regen.js.map