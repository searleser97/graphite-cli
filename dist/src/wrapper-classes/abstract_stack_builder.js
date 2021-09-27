"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("./branch"));
class AbstractStackBuilder {
    constructor(opts) {
        this.downstackFromBranch = (branch) => {
            let node = new _1.StackNode({ branch });
            let parent = branch.getParentFromMeta();
            while (parent) {
                node.parent = new _1.StackNode({ branch: parent });
                node.parent.children = [node];
                node = node.parent;
                parent = parent.getParentFromMeta();
            }
            return new _1.Stack(node);
        };
        this.fullStackFromBranch = (branch) => {
            const base = this.getStackBaseBranch(branch, { excludingTrunk: true });
            const stack = this.upstackInclusiveFromBranchWithoutParents(base);
            if (branch.name == utils_1.getTrunk().name) {
                return stack;
            }
            // If the parent is trunk (the only possibility because this is a off trunk)
            const parent = this.getBranchParent(stack.source.branch);
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
        this.useMemoizedResults = (opts === null || opts === void 0 ? void 0 : opts.useMemoizedResults) || false;
    }
    allStacks() {
        const baseBranches = this.allStackBaseNames();
        return baseBranches.map(this.fullStackFromBranch);
    }
    upstackInclusiveFromBranchWithParents(branch) {
        const stack = this.fullStackFromBranch(branch);
        // Traverse to find the source node and set;
        let possibleSourceNodes = [stack.source];
        while (possibleSourceNodes.length > 0) {
            const node = possibleSourceNodes.pop();
            if (!node) {
                throw new Error("Stack missing source node, shouldnt happen");
            }
            if (node.branch.name === branch.name) {
                stack.source = node;
                break;
            }
            possibleSourceNodes = possibleSourceNodes.concat(node.children);
        }
        return stack;
    }
    upstackInclusiveFromBranchWithoutParents(branch) {
        const sourceNode = new _1.StackNode({
            branch,
            parent: undefined,
            children: [],
        });
        let nodes = [sourceNode];
        do {
            const curNode = nodes.pop();
            if (!curNode) {
                break;
            }
            curNode.children = this.getChildrenForBranch(curNode.branch).map((child) => {
                return new _1.StackNode({
                    branch: child,
                    parent: curNode,
                    children: [],
                });
            });
            nodes = nodes.concat(curNode.children);
        } while (nodes.length > 0);
        return new _1.Stack(sourceNode);
    }
    allStackBaseNames() {
        const allBranches = branch_1.default.allBranches({
            useMemoizedResults: this.useMemoizedResults,
        });
        const allStackBaseNames = allBranches.map((b) => this.getStackBaseBranch(b, { excludingTrunk: false }).name);
        const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
        return uniqueStackBaseNames.map((bn) => new branch_1.default(bn, { useMemoizedResults: this.useMemoizedResults }));
    }
    getStackBaseBranch(branch, opts) {
        const parent = this.getBranchParent(branch);
        if (!parent) {
            return branch;
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.excludingTrunk) && parent.isTrunk()) {
            return branch;
        }
        return this.getStackBaseBranch(parent, opts);
    }
}
exports.default = AbstractStackBuilder;
//# sourceMappingURL=abstract_stack_builder.js.map