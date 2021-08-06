import { AbstractStackBuilder, Stack } from ".";
import Branch from "./branch";
export declare class MetaStackBuilder extends AbstractStackBuilder {
    protected getStackBaseBranch(branch: Branch): Branch;
    fullStackFromBranch: (branch: Branch) => Stack;
    protected getChildrenForBranch(branch: Branch): Branch[];
}
