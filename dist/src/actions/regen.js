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
const config_1 = require("../lib/config");
const log_1 = require("../lib/log");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
function regenAction(silent) {
    return __awaiter(this, void 0, void 0, function* () {
        const branch = preconditions_1.currentBranchPrecondition();
        const trunk = trunk_1.getTrunk();
        if (trunk.name == branch.name) {
            // special case regen all stacks
            regenAllStacks(silent);
            return;
        }
        const baseBranch = getStackBaseBranch(branch);
        printBranchNameStack(`(Original git infered stack)`, baseBranch.stackByTracingGitParents(), silent);
        printBranchNameStack(`(Original graphite recorded stack)`, baseBranch.stackByTracingMetaParents(), silent);
        // TODO (nicholasyan): this is a short-term band-aid. We need to handle
        // multiple parents in the long-term.
        yield recursiveRegen(baseBranch, trunk, silent);
        printBranchNameStack(`(New graphite stack)`, baseBranch.stackByTracingMetaParents(), silent);
    });
}
exports.regenAction = regenAction;
function regenAllStacks(silent) {
    const allBranches = branch_1.default.allBranches();
    log_1.log(`Computing stacks from ${allBranches.length} branches...`);
    const allStackBaseNames = allBranches
        .filter((b) => !config_1.repoConfig.getIgnoreBranches().includes(b.name) &&
        b.name != trunk_1.getTrunk().name)
        .map((b) => getStackBaseBranch(b).name);
    const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
    uniqueStackBaseNames.forEach((branchName) => {
        log_1.log(`Regenerating stack for (${branchName})`);
        recursiveRegen(new branch_1.default(branchName), trunk_1.getTrunk(), silent);
    });
}
// Returns the first non-trunk base branch. If there is no non-trunk branch
// - the current branch is trunk - we return null.
function getStackBaseBranch(currentBranch) {
    const trunkMergeBase = utils_1.gpExecSync({
        command: `git merge-base ${trunk_1.getTrunk()} ${currentBranch.name}`,
    })
        .toString()
        .trim();
    let baseBranch = currentBranch;
    let baseBranchParent = baseBranch.getParentsFromGit()[0]; // TODO: greg - support two parents
    while (baseBranchParent !== undefined &&
        baseBranchParent.name !== trunk_1.getTrunk().name &&
        baseBranchParent.isUpstreamOf(trunkMergeBase)) {
        baseBranch = baseBranchParent;
        baseBranchParent = baseBranch.getParentsFromGit()[0];
    }
    return baseBranch;
}
function recursiveRegen(currentBranch, newParent, silent) {
    const oldMetaParent = currentBranch.getParentFromMeta();
    // The only time we expect newParent to be undefined is if we're fixing
    // the base branch which is behind trunk.
    if (oldMetaParent && oldMetaParent.name === newParent.name) {
        log_1.log(`-> No change for (${currentBranch.name}) with branch parent (${oldMetaParent.name})`, { silent });
    }
    else {
        log_1.log(`-> Updating (${currentBranch.name}) branch parent from (${oldMetaParent === null || oldMetaParent === void 0 ? void 0 : oldMetaParent.name}) to (${chalk_1.default.green(newParent.name)})`, { silent });
        currentBranch.setParentBranchName(newParent.name);
    }
    const gitChildren = currentBranch.getChildrenFromGit();
    gitChildren.forEach((child) => {
        recursiveRegen(child, currentBranch, silent);
    });
}
function printBranchNameStack(message, names, silent) {
    log_1.log(`[${names.map((name) => `(${chalk_1.default.green(name)})`).join("->")}] ${message}`, { silent });
}
//# sourceMappingURL=regen.js.map