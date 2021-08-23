import { AbstractStackBuilder, Branch, Stack } from ".";
export default class GitStackBuilder extends AbstractStackBuilder {
    fullStackFromBranch: (branch: Branch) => Stack;
    protected getStackBaseBranch(branch: Branch): Branch;
    protected getChildrenForBranch(branch: Branch): Branch[];
    protected getParentForBranch(branch: Branch): Branch | undefined;
    private checkSiblingBranches;
}
