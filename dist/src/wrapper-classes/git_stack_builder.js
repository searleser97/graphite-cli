"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const errors_1 = require("../lib/errors");
const utils_1 = require("../lib/utils");
class GitStackBuilder extends _1.AbstractStackBuilder {
    constructor() {
        super(...arguments);
        this.fullStackFromBranch = (branch) => {
            const base = this.getStackBaseBranch(branch);
            const stack = this.upstackInclusiveFromBranchWithoutParents(base);
            const parents = base.getParentsFromGit();
            const parentsIncludeTrunk = parents
                .map((parent) => parent.name)
                .includes(utils_1.getTrunk().name);
            // If the parents don't include trunk, just return.
            if (!parentsIncludeTrunk) {
                return stack;
            }
            const trunkNode = new _1.StackNode({
                branch: utils_1.getTrunk(),
                parent: undefined,
                children: [stack.source],
            });
            stack.source.parent = trunkNode;
            stack.source = trunkNode;
            return stack;
        };
    }
    getStackBaseBranch(branch) {
        let baseBranch = branch;
        let baseBranchParent = baseBranch.getParentsFromGit()[0]; // TODO: greg - support two parents
        while (baseBranchParent !== undefined &&
            baseBranchParent.name !== utils_1.getTrunk().name) {
            baseBranch = baseBranchParent;
            baseBranchParent = baseBranch.getParentsFromGit()[0];
        }
        return baseBranch;
    }
    getChildrenForBranch(branch) {
        this.checkSiblingBranches(branch);
        return branch.getChildrenFromGit();
    }
    getParentForBranch(branch) {
        this.checkSiblingBranches(branch);
        const parents = branch.getParentsFromGit();
        if (parents.length > 1) {
            throw new errors_1.MultiParentError(branch, parents);
        }
        return parents[0];
    }
    checkSiblingBranches(branch) {
        const siblingBranches = branch.branchesWithSameCommit();
        if (siblingBranches.length > 0) {
            throw new errors_1.SiblingBranchError([branch].concat(siblingBranches));
        }
    }
}
exports.default = GitStackBuilder;
//# sourceMappingURL=git_stack_builder.js.map