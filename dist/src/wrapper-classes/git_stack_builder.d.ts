import { AbstractStackBuilder, Branch, Stack } from ".";
export declare class GitStackBuilder extends AbstractStackBuilder {
    fullStackFromBranch: (branch: Branch) => Stack;
    protected getStackBaseBranch(branch: Branch): Branch;
    protected getChildrenForBranch(branch: Branch): Branch[];
    protected getParentsForBranch(branch: Branch): Branch[];
}
