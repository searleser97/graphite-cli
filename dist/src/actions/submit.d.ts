import { TScope } from "./scope";
export declare function submitAction(args: {
    scope: TScope;
    editPRFieldsInline: boolean;
    createNewPRsAsDraft: boolean | undefined;
}): Promise<void>;
