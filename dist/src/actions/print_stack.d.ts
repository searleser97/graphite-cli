import Branch from "../wrapper-classes/branch";
declare type TPrintStackConfig = {
    currentBranch: Branch | null;
    offTrunk: boolean;
};
export declare function printStack(args: {
    baseBranch: Branch;
    indentLevel: number;
    config: TPrintStackConfig;
}): void;
export {};
