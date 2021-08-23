import { AbstractStackBuilder, Branch } from ".";
export default class GitStackBuilder extends AbstractStackBuilder {
    protected getBranchParent(branch: Branch): Branch | undefined;
    protected getChildrenForBranch(branch: Branch): Branch[];
    protected getParentForBranch(branch: Branch): Branch | undefined;
    private checkSiblingBranches;
}
