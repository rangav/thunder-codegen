import { RequestCodeModel } from "../models/requestModel";
import { CodeResultModel } from "../models/codeModels";

export default interface CodeGenerator {
    id: string;
    displayName: string;
    lang: string
    getCode(request: RequestCodeModel): CodeResultModel;
}