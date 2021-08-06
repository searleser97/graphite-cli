"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaStackBuilder = void 0;
const _1 = require(".");
const utils_1 = require("../lib/utils");
class MetaStackBuilder extends _1.AbstractStackBuilder {
    constructor() {
        super(...arguments);
        this.fullStackFromBranch = (branch) => {
            const base = this.getStackBaseBranch(branch);
            const stack = this.upstackInclusiveFromBranch(base);
            if (branch.name == utils_1.getTrunk().name) {
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
}
exports.MetaStackBuilder = MetaStackBuilder;
//# sourceMappingURL=meta_stack_builder.js.map