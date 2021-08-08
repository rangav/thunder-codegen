import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";
import { convertFileToBase64 } from "../helpers/helper";

export default class JavascriptAxios implements CodeGenerator {

    displayName: string = "Javascript Axios";
    lang: string = "javascript";
    id: string = "js-axios";

    getCode(request: RequestCodeModel): CodeResultModel {

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];
        let headerString: string[] = [];

        codeBuilder.push(`import axios from "axios";`);
        if (request?.body?.files && request?.body?.files.length > 0) {
            codeBuilder.push(`var fs = require('fs');`)
        }
        codeBuilder.push("");

        request.headers.forEach(element => {
            headerString.push(` "${element.name}": "${element.value}"`)
        });

        codeBuilder.push(`let headersList = {\n${headerString.join(",\n")} \n}`);
        codeBuilder.push("");

        let bodyContent = "";
        let body = request.body;
        if (body) {
            if (body.type == "formdata" && (body.form || body.files)) {
                codeBuilder.push(`let formdata = new FormData();`)
                body.form?.forEach(element => {
                    codeBuilder.push(`formdata.append("${element.name}", "${element.value}");`);
                });

                body.files?.forEach(element => {
                    codeBuilder.push(`formdata.append("${element.name}", fs.createReadStream("${element.value}"));`);
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
            else if (body.binary) {
                var imageAsBase64 = convertFileToBase64(body.binary);
                bodyContent = `  data: '${imageAsBase64}'`;
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