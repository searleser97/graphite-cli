import Branch from "../../wrapper-classes/branch";
export declare function getBranchChildrenOrParentsFromGit(branch: Branch, opts: {
    direction: "children" | "parents";
    useMemoizedResults?: boolean;
}): Branch[];
