"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackNode = void 0;
const _1 = require(".");
class StackNode {
    constructor(opts) {
        this.branch = opts.branch;
        this.parents = opts.parents || [];
        this.children = opts.children || [];
    }
    equals(other) {
        if (this.branch.name !== other.branch.name) {
            return false;
        }
        if (this.children.length === 0 && other.children.length === 0) {
            return true;
        }
        if (this.children
            .map((c) => c.branch.name)
            .sort()
            .join(" ") !==
            other.children
                .map((c) => c.branch.name)
                .sort()
                .join(" ")) {
            return false;
        }
        if (this.parents
            .map((c) => c.branch.name)
            .sort()
            .join(" ") !==
            other.parents
                .map((c) => c.branch.name)
                .sort()
                .join(" ")) {
            return false;
        }
        return this.children.every((c) => {
            return c.equals(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            other.children.find((bc) => bc.branch.name == c.branch.name));
        });
    }
    toDictionary() {
        const data = {};
        data[this.branch.name] = {};
        this.children.forEach((child) => (data[this.branch.name][child.branch.name] =
            child.toDictionary()[child.branch.name]));
        return data;
    }
    static childrenNodesFromMap(parent, map) {
        if (!map) {
            return [];
        }
        return Object.keys(map).map((branchName) => {
            const node = new StackNode({
                branch: new _1.Branch(branchName),
                parents: [parent],
                children: [],
            });
            node.children = StackNode.childrenNodesFromMap(node, map[branchName]);
            return node;
        });
    }
}
exports.StackNode = StackNode;
//# sourceMappingURL=stack_node.js.map