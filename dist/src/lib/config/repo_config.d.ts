declare type RepoConfigT = {
    owner?: string;
    name?: string;
    trunk?: string;
    ignoreBranches?: string[];
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
}
declare const repoConfigSingleton: RepoConfig;
export default repoConfigSingleton;
