declare type UserConfigT = {
    branchPrefix?: string;
    authToken?: string;
    message?: messageT;
};
declare type messageT = {
    contents: string;
    cliVersion: string;
};
declare class UserConfig {
    _data: UserConfigT;
    constructor(data: UserConfigT);
    setAuthToken(authToken: string): void;
    getAuthToken(): string | undefined;
    setBranchPrefix(branchPrefix: string): void;
    getBranchPrefix(): string | undefined;
    setMessage(message: messageT | undefined): void;
    getMessage(): messageT | undefined;
    private save;
    path(): string;
}
declare const userConfigSingleton: UserConfig;
export default userConfigSingleton;
