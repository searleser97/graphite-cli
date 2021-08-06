import Branch from "./branch";
export declare type stackNodeT = {
    branch: Branch;
    parents: stackNodeT[];
    children: stackNodeT[];
};
export declare class Stack {
    source: stackNodeT;
    constructor(source: stackNodeT);
    toString(): string;
    toDictionary(): Record<string, any>;
    equals(other: Stack): boolean;
    static fromMap(map: Record<string, any>): Stack;
}
