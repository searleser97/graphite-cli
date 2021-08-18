import { Branch } from "../../wrapper-classes";

class MemoizatedData {
  _branches: Branch[] = [];
  _branchParents: Record<string, Branch[]> = {};
  _branchChildren: Record<string, Branch[]> = {};
  _branchRef: Record<string, string> = {};
  _mergeBase: Record<string, string> = {};

  // public getAllBranches(): Branch[] {}
}

const memoizatedData = new MemoizatedData();

export { memoizatedData };
