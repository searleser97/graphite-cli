declare type RepoConfigT = {
    owner?: string;
    name?: string;
    trunk?: string;
    ignoreBranches?: string[];
    logSettings?: {
        maxStacksShownBehindTrunk?: number;
        maxDaysShownBehindTrunk?: number;
    };
    maxStacksShownBehindTrunk?: number;
    maxDaysShownBehindTrunk?: number;
    maxBranchLength?: number;
};
declare class RepoConfig {
    _data: RepoConfigT;
    constructor(data: RepoConfigT);
    private save;
    getRepoOwner(): string;
    path(): string;
    setTrunk(trunkName: string): void;
    getTrunk(): string | undefined;
    setIgnoreBranches(ignoreBranches: string[]): void;
    getIgnoreBranches(): string[];
    setRepoOwner(owner: string): void;
    getRepoName(): string;
    setRepoName(name: string): void;
    getMaxDaysShownBehindTrunk(): number;
    setMaxDaysShownBehindTrunk(n: number): void;
    getMaxStacksShownBehindTrunk(): number;
    setMaxStacksShownBehindTrunk(n: number): void;
    /**
     * These settings used to (briefly) live in logSettings. Moving these to live
     * in the top-level namespace now that they're shared between multiple
     * commands (e.g. log and stacks).
     */
    migrateLogSettings(): void;
    getMaxBranchLength(): number;
    setMaxBranchLength(numCommits: number): void;
}
declare const repoConfigSingleton: RepoConfig;
export default repoConfigSingleton;
