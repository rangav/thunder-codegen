import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";

export default class CurlRequest implements CodeGenerator {

    displayName: string = "cURL";
    lang: string = "curl";
    id: string = "curl";

    getCode(request: RequestCodeModel): CodeResultModel {

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];

        codeBuilder.push(`curl -X ${request.method}`)
        codeBuilder.push(`  '${request.url}'`)

        request.headers.forEach(element => {
            codeBuilder.push(`  -H '${element.name}: ${element.value}'`)
        });

        let body = request.body;
        if (body) {
            if (body.type == "formdata" && body.form) {
                body.form.forEach(element => {
                    codeBuilder.push(`  --form '${element.name}="${element.value}"'`);
                });

                body.files?.forEach(element => {
                    codeBuilder.push(`  --form '${element.name}=@${element.value}'`);
                });

            } else if (body.type == "formencoded" && body.form) {
                var formArray: string[] = [];
                body.form.forEach(element => {
                    formArray.push(`${element.name}=${element.value}`);
                });

                codeBuilder.push(`  -d '${formArray.join("&")}'`);
            } else if (body.raw) {
                codeBuilder.push(`  -d '${body.raw}'`);
            } else if (body.binary) {
                codeBuilder.push(`  --data-binary '@${body.binary}'`);
            }
        }

        codeResult.code = codeBuilder.join(" \\\n");
        return codeResult
    }
}