import { RequestCodeModel } from "./models/requestModel";
import CodeGenerator from "./generators/codeGenerator";
import { CodeResultModel, CodeItemModel } from "./models/codeModels";
import RegisterGenerators from "./registerGenerators";

export class CodeProcessor {
    private _codegenList: CodeGenerator[];

    constructor() {
        this._codegenList = RegisterGenerators.getCodeGenerators();
    }

    private findMatchGenerator(codeId: any): CodeGenerator | undefined {
        let match = this._codegenList.find(s => s.id == codeId);
        return match;
    }

    getCode(codeId: any, request: RequestCodeModel): CodeResultModel | undefined {
        var match = this.findMatchGenerator(codeId);
        if (!match) {
            return undefined;
        }

        return match.getCode(request);
    }

    /**
     * Get Code Generators Name List for display
     * @returns
     */
    getCodegenList(): CodeItemModel[] {
        let data = this._codegenList.sort((a, b) => a.displayName.localeCompare(b.displayName));
        let result: CodeItemModel[] = [];
        data.forEach(element => {
            result.push(new CodeItemModel(element.displayName, element.id));
        });

        return result;
    }
}