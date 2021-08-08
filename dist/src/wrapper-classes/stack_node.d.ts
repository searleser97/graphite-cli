import { Branch } from ".";
export declare class StackNode {
    branch: Branch;
    parents: StackNode[];
    children: StackNode[];
    constructor(opts: {
        branch: Branch;
        parents?: StackNode[];
        children?: StackNode[];
    });
    equals(other: StackNode): boolean;
    toDictionary(): Record<string, any>;
    static childrenNodesFromMap(parent: StackNode, map?: Record<string, any>): StackNode[];
}
