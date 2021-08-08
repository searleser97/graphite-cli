import { Stack } from ".";
import Branch from "./branch";
export declare abstract class AbstractStackBuilder {
    allStacksFromTrunk(): Stack[];
    abstract fullStackFromBranch(branch: Branch): Stack;
    upstackInclusiveFromBranchWithParents(branch: Branch): Stack;
    upstackInclusiveFromBranchWithoutParents(branch: Branch): Stack;
    protected allStackBaseNames(): Branch[];
    protected abstract getStackBaseBranch(branch: Branch): Branch;
    protected abstract getChildrenForBranch(branch: Branch): Branch[];
    protected abstract getParentsForBranch(branch: Branch): Branch[];
}
