"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const utils_1 = require("../lib/utils");
class MetaStackBuilder extends _1.AbstractStackBuilder {
    constructor() {
        super(...arguments);
        this.fullStackFromBranch = (branch) => {
            const base = this.getStackBaseBranch(branch);
            const stack = this.upstackInclusiveFromBranchWithoutParents(base);
            if (branch.name == utils_1.getTrunk().name) {
                return stack;
            }
            // If the parent is trunk (the only possibility because this is a off trunk)
            const parent = base.getParentFromMeta();
            if (parent && parent.name == utils_1.getTrunk().name) {
                const trunkNode = new _1.StackNode({
                    branch: utils_1.getTrunk(),
                    parent: undefined,
                    children: [stack.source],
                });
                stack.source.parent = trunkNode;
                stack.source = trunkNode;
            }
            else {
                // To get in this state, the user must likely have changed their trunk branch...
            }
            return stack;
        };
    }
    getStackBaseBranch(branch) {
        const parent = branch.getParentFromMeta();
        if (!parent) {
            return branch;
        }
        if (parent.name == utils_1.getTrunk().name) {
            return branch;
        }
        return this.getStackBaseBranch(parent);
    }
    getChildrenForBranch(branch) {
        return branch.getChildrenFromMeta();
    }
    getParentForBranch(branch) {
        return branch.getParentFromMeta();
    }
}
exports.default = MetaStackBuilder;
//# sourceMappingURL=meta_stack_builder.js.map