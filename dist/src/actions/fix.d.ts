import Branch from "../wrapper-classes/branch";
export declare function fixAction(opts: {
    action: "regen" | "rebase" | undefined;
}): Promise<void>;
export declare function restackBranch(branch: Branch): Promise<void>;
