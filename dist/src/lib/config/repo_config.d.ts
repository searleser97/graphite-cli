declare type RepoConfigT = {
    owner?: string;
    name?: string;
    trunk?: string;
    ignoreBranches?: string[];
    logSettings?: {
        maxStacksShownBehindTrunk?: number;
        maxDaysShownBehindTrunk?: number;
    };
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
    getLogMaxDaysShownBehindTrunk(): number;
    setLogMaxDaysShownBehindTrunk(n: number): void;
    getLogMaxStacksShownBehindTrunk(): number;
    setLogMaxStacksShownBehindTrunk(n: number): void;
}
declare const repoConfigSingleton: RepoConfig;
export default repoConfigSingleton;
