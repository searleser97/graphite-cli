"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
const branch_1 = __importDefault(require("./branch"));
class Stack {
    constructor(source) {
        this.source = source;
    }
    toString() {
        return JSON.stringify(nodeToDictionary(this.source), null, 2);
    }
    toDictionary() {
        return nodeToDictionary(this.source);
    }
    equals(other) {
        return nodesAreEqual(this.source, other.source);
    }
    static fromMap(map) {
        if (Object.keys(map).length != 1) {
            throw Error(`Map must have only only top level branch name`);
        }
        const sourceBranchName = Object.keys(map)[0];
        const sourceNode = {
            branch: new branch_1.default(sourceBranchName),
            parents: [],
            children: [],
        };
        sourceNode.children = childrenNodesFromMap(sourceNode, map[sourceBranchName]);
        return new Stack(sourceNode);
    }
}
exports.Stack = Stack;
function childrenNodesFromMap(parent, map) {
    if (!map) {
        return [];
    }
    return Object.keys(map).map((branchName) => {
        const node = {
            branch: new branch_1.default(branchName),
            parents: [parent],
            children: [],
        };
        node.children = childrenNodesFromMap(node, map[branchName]);
        return node;
    });
}
function nodeToDictionary(node) {
    const data = {};
    data[node.branch.name] = {};
    node.children.forEach((child) => (data[node.branch.name][child.branch.name] =
        nodeToDictionary(child)[child.branch.name]));
    return data;
}
function nodesAreEqual(a, b) {
    if (a.branch.name !== b.branch.name) {
        return false;
    }
    if (a.children.length === 0 && b.children.length === 0) {
        return true;
    }
    if (a.children
        .map((c) => c.branch.name)
        .sort()
        .join(" ") !==
        b.children
            .map((c) => c.branch.name)
            .sort()
            .join(" ")) {
        return false;
    }
    if (a.parents
        .map((c) => c.branch.name)
        .sort()
        .join(" ") !==
        b.parents
            .map((c) => c.branch.name)
            .sort()
            .join(" ")) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return a.children.every((c) => {
        return nodesAreEqual(c, 
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        b.children.find((bc) => bc.branch.name == c.branch.name));
    });
}
//# sourceMappingURL=stack.js.map