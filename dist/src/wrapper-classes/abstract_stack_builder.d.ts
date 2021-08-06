import { Stack } from ".";
import Branch from "./branch";
export declare abstract class AbstractStackBuilder {
    allStacksFromTrunk(): Stack[];
    abstract fullStackFromBranch(branch: Branch): Stack;
    upstackInclusiveFromBranch(branch: Branch): Stack;
    protected allStackBaseNames(): Branch[];
    protected abstract getStackBaseBranch(branch: Branch): Branch;
    protected abstract getChildrenForBranch(branch: Branch): Branch[];
}
