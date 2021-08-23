"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const branch_1 = __importDefault(require("./branch"));
class AbstractStackBuilder {
    constructor(opts) {
        this.useMemoizedResults = (opts === null || opts === void 0 ? void 0 : opts.useMemoizedResults) || false;
    }
    allStacksFromTrunk() {
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
        const allStackBaseNames = allBranches.map((b) => this.getStackBaseBranch(b).name);
        const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
        return uniqueStackBaseNames.map((bn) => new branch_1.default(bn, { useMemoizedResults: this.useMemoizedResults }));
    }
}
exports.default = AbstractStackBuilder;
//# sourceMappingURL=abstract_stack_builder.js.map