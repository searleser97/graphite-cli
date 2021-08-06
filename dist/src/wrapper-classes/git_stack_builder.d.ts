import { AbstractStackBuilder, Stack } from ".";
import Branch from "./branch";
export declare class GitStackBuilder extends AbstractStackBuilder {
    fullStackFromBranch: (branch: Branch) => Stack;
    protected getStackBaseBranch(branch: Branch): Branch;
    protected getChildrenForBranch(branch: Branch): Branch[];
}
