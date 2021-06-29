import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";

export default class JavascriptAxios implements CodeGenerator {

    displayName: string = "Javascript Axios";
    lang: string = "javascript";
    id: string = "js-axios";

    getCode(request: RequestCodeModel): CodeResultModel {

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];
        let headerString: string[] = [];

        codeBuilder.push(`import axios from "axios";\n`);

        request.headers.forEach(element => {
            headerString.push(` "${element.name}": "${element.value}"`)
        });

        codeBuilder.push(`let headersList = {\n${headerString.join(",\n")} \n}`);
        codeBuilder.push("");

        let bodyContent = "";
        let body = request.body;
        if (body) {
            if (body.type == "formdata" && body.form) {
                codeBuilder.push(`let formdata = new FormData();`)
                body.form.forEach(element => {
                    codeBuilder.push(`formdata.append("${element.name}", "${element.value}");`);
                });
                codeBuilder.push(``);
                bodyContent = `  data: formdata`;
            } else if (body.type == "formencoded" && body.form) {
                var formArray: string[] = [];
                body.form.forEach(element => {
                    formArray.push(`${element.name}=${element.value}`);
                });

                bodyContent = `  data: "${formArray.join("&")}"`;
            } else if (body.raw) {
                bodyContent = body.type == "json" ? `  data: ${JSON.stringify(body.raw)}` : `  data: \`${body.raw}\``;
            }
        }

        codeBuilder.push(`let reqOptions = {`);
        codeBuilder.push(`  url: "${request.url}",`);
        codeBuilder.push(`  method: "${request.method}",`);
        codeBuilder.push(`  headers: headersList,`);
        if (bodyContent) {
            codeBuilder.push(`${bodyContent},`);
        }
        codeBuilder.push(`}\n`)

        codeBuilder.push(`axios.request(reqOptions).then(function (response) {`);
        codeBuilder.push(`  console.log(response.data);`)
        codeBuilder.push("})");

        codeResult.code = codeBuilder.join("\n");
        return codeResult
    }
}