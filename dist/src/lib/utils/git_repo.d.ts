export default class GitRepo {
    dir: string;
    constructor(dir: string);
    execCliCommand(command: string): void;
    execCliCommandAndGetOutput(command: string): string;
    createChange(textValue: string, prefix?: string): void;
    createChangeAndCommit(textValue: string, prefix?: string): void;
    createPrecommitHook(contents: string): void;
    createAndCheckoutBranch(name: string): void;
    checkoutBranch(name: string): void;
    rebaseInProgress(): boolean;
    finishInteractiveRebase(): void;
    currentBranchName(): string;
    listCurrentBranchCommitMessages(): string[];
    expectCommits(commitMessages: string): void;
}
