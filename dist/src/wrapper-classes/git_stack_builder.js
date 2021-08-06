"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitStackBuilder = void 0;
const _1 = require(".");
const utils_1 = require("../lib/utils");
class GitStackBuilder extends _1.AbstractStackBuilder {
    constructor() {
        super(...arguments);
        this.fullStackFromBranch = (branch) => {
            var _a;
            const base = this.getStackBaseBranch(branch);
            const stack = this.upstackInclusiveFromBranch(base);
            const parents = branch.getParentsFromGit();
            // If the parent isnt trunk, just return.
            if (((_a = parents[0]) === null || _a === void 0 ? void 0 : _a.name) !== utils_1.getTrunk().name) {
                return stack;
            }
            const trunkNode = {
                branch: utils_1.getTrunk(),
                parents: [],
                children: [stack.source],
            };
            stack.source.parents = [trunkNode];
            stack.source = trunkNode;
            return stack;
        };
    }
    getStackBaseBranch(branch) {
        const trunkMergeBase = utils_1.gpExecSync({
            command: `git merge-base ${utils_1.getTrunk()} ${branch.name}`,
        })
            .toString()
            .trim();
        let baseBranch = branch;
        let baseBranchParent = baseBranch.getParentsFromGit()[0]; // TODO: greg - support two parents
        while (baseBranchParent !== undefined &&
            baseBranchParent.name !== utils_1.getTrunk().name &&
            baseBranchParent.isUpstreamOf(trunkMergeBase)) {
            baseBranch = baseBranchParent;
            baseBranchParent = baseBranch.getParentsFromGit()[0];
        }
        return baseBranch;
    }
    getChildrenForBranch(branch) {
        return branch.getChildrenFromGit();
    }
}
exports.GitStackBuilder = GitStackBuilder;
//# sourceMappingURL=git_stack_builder.js.map