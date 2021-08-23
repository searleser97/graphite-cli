import Branch from "../../wrapper-classes/branch";
declare function currentBranchPrecondition(): Branch;
declare function branchExistsPrecondition(branchName: string): void;
declare function uncommittedChangesPrecondition(): void;
declare function ensureSomeStagedChangesPrecondition(): void;
declare function currentGitRepoPrecondition(): string;
export { currentBranchPrecondition, branchExistsPrecondition, uncommittedChangesPrecondition, currentGitRepoPrecondition, ensureSomeStagedChangesPrecondition, };
