"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractStackBuilder = void 0;
const _1 = require(".");
const config_1 = require("../lib/config");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("./branch"));
class AbstractStackBuilder {
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
            parents: [],
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
                    parents: [curNode],
                    children: [],
                });
            });
            nodes = nodes.concat(curNode.children);
        } while (nodes.length > 0);
        return new _1.Stack(sourceNode);
    }
    allStackBaseNames() {
        const allBranches = branch_1.default.allBranches();
        const allStackBaseNames = allBranches
            .filter((b) => !config_1.repoConfig.getIgnoreBranches().includes(b.name) &&
            b.name != utils_1.getTrunk().name)
            .map((b) => this.getStackBaseBranch(b).name);
        const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
        return uniqueStackBaseNames.map((bn) => new branch_1.default(bn));
    }
}
exports.AbstractStackBuilder = AbstractStackBuilder;
//# sourceMappingURL=abstract_stack_builder.js.map