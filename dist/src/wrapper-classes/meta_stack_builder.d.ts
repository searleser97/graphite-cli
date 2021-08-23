import { AbstractStackBuilder, Stack } from ".";
import Branch from "./branch";
export default class MetaStackBuilder extends AbstractStackBuilder {
    protected getStackBaseBranch(branch: Branch): Branch;
    fullStackFromBranch: (branch: Branch) => Stack;
    protected getChildrenForBranch(branch: Branch): Branch[];
    protected getParentForBranch(branch: Branch): Branch | undefined;
}
