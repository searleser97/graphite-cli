import Commit from "./commit";
declare type TBranchFilters = {
    useMemoizedResults?: boolean;
    maxDaysBehindTrunk?: number;
    maxBranches?: number;
    sort?: "-committerdate";
};
export default class Branch {
    name: string;
    shouldUseMemoizedResults: boolean;
    constructor(name: string);
    /**
     * Uses memoized results for some of the branch calculations. Only turn this
     * on if the git tree should not change at all during the current invoked
     * command.
     */
    useMemoizedResults(): Branch;
    toString(): string;
    private getMeta;
    private writeMeta;
    stackByTracingMetaParents(branch?: Branch): string[];
    stackByTracingGitParents(branch?: Branch): string[];
    getParentFromMeta(): Branch | undefined;
    getChildrenFromMeta(): Branch[];
    isUpstreamOf(commitRef: string): boolean;
    ref(): string;
    getMetaMergeBase(): string | undefined;
    static exists(branchName: string): boolean;
    getMetaPrevRef(): string | undefined;
    getCurrentRef(): string;
    clearParentMetadata(): void;
    setParentBranchName(parentBranchName: string): void;
    setMetaPrevRef(prevRef: string): void;
    static branchWithName(name: string): Promise<Branch>;
    static getCurrentBranch(): Branch | null;
    private static allBranchesImpl;
    static allBranches(opts?: TBranchFilters): Branch[];
    static allBranchesWithFilter(args: {
        filter: (branch: Branch) => boolean;
        opts?: TBranchFilters;
    }): Branch[];
    static getAllBranchesWithoutParents(opts?: TBranchFilters & {
        excludeTrunk?: boolean;
    }): Promise<Branch[]>;
    static getAllBranchesWithParents(opts?: TBranchFilters): Promise<Branch[]>;
    head(): Commit;
    base(): Commit | undefined;
    getChildrenFromGit(): Branch[];
    getParentsFromGit(): Branch[];
    private pointsToSameCommitAs;
    private getChildrenOrParents;
    setPRInfo(prInfo: {
        number: number;
        url: string;
    }): void;
    getPRInfo(): {
        number: number;
        url: string;
    } | undefined;
    getCommitSHAs(): string[];
    branchesWithSameCommit(): Branch[];
}
export {};
