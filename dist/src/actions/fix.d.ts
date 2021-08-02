import Branch from "../wrapper-classes/branch";
export declare function fixAction(silent: boolean): Promise<void>;
export declare function restackBranch(currentBranch: Branch, silent: boolean): Promise<{
    numberRestacked: number;
}>;
