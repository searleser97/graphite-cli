declare type UserConfigT = {
    branchPrefix?: string;
    authToken?: string;
};
declare class UserConfig {
    _data: UserConfigT;
    constructor(data: UserConfigT);
    setAuthToken(authToken: string): void;
    getAuthToken(): string | undefined;
    setBranchPrefix(branchPrefix: string): void;
    getBranchPrefix(): string | undefined;
    private save;
    path(): string;
}
declare const userConfigSingleton: UserConfig;
export default userConfigSingleton;
