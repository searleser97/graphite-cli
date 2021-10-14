export default class GitRepo {
    dir: string;
    constructor(dir: string, opts?: {
        existingRepo?: boolean;
        repoUrl?: string;
    });
    execCliCommand(command: string): void;
    execCliCommandAndGetOutput(command: string): string;
    unstagedChanges(): boolean;
    createChange(textValue: string, prefix?: string, unstaged?: boolean): void;
    createChangeAndCommit(textValue: string, prefix?: string): void;
    deleteBranch(name: string): void;
    createPrecommitHook(contents: string): void;
    createAndCheckoutBranch(name: string): void;
    checkoutBranch(name: string): void;
    rebaseInProgress(): boolean;
    finishInteractiveRebase(opts?: {
        mergeStrategy?: "THEIRS";
    }): void;
    currentBranchName(): string;
    listCurrentBranchCommitMessages(): string[];
    mergeBranch(args: {
        branch: string;
        mergeIn: string;
    }): void;
}
