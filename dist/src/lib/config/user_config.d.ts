declare type UserConfigT = {
    branchPrefix?: string;
    authToken?: string;
};
export declare function makeId(length: number): string;
export declare let config: UserConfigT;
export declare function setUserAuthToken(authToken: string): void;
export {};
