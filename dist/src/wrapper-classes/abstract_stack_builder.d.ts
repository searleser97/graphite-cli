import { Stack } from ".";
import Branch from "./branch";
export default abstract class AbstractStackBuilder {
    useMemoizedResults: boolean;
    constructor(opts?: {
        useMemoizedResults: boolean;
    });
    allStacks(): Stack[];
    upstackInclusiveFromBranchWithParents(branch: Branch): Stack;
    upstackInclusiveFromBranchWithoutParents(branch: Branch): Stack;
    private allStackBaseNames;
    downstackFromBranch: (branch: Branch) => Stack;
    fullStackFromBranch: (branch: Branch) => Stack;
    private getStackBaseBranch;
    protected abstract getBranchParent(branch: Branch): Branch | undefined;
    protected abstract getChildrenForBranch(branch: Branch): Branch[];
    protected abstract getParentForBranch(branch: Branch): Branch | undefined;
}
