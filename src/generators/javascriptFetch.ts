import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";
import { convertFileToBase64 } from "../helpers/helper";

export default class JavascriptFetch implements CodeGenerator {

    displayName: string = "Javascript Fetch";
    lang: string = "javascript";
    id: string = "js-fetch";

    public getCode(request: RequestCodeModel): CodeResultModel {

        // test online: https://codesandbox.io/s/6kj6r17qk?file=/src/index.js

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];
        let headerString: string[] = [];

        request.headers.forEach(element => {
            headerString.push(` "${element.name}": "${element.value}"`)
        });

        codeBuilder.push(`let headersList = {`);
        codeBuilder.push(`${headerString.join(",\n")}`);
        codeBuilder.push(`}\n`);

        let hasBody = false;
        let body = request.body;
        if (body) {
            if (body.type == "formdata" && (body.form || body.files)) {
                codeBuilder.push(`let bodyContent = new FormData();`)
                body.form?.forEach(element => {
                    codeBuilder.push(`bodyContent.append("${element.name}", "${element.value}");`);
                });
                body.files?.forEach(element => {
                    codeBuilder.push(`bodyContent.append("${element.name}", "${element.value}");`);
                });
                codeBuilder.push(``);
                hasBody = true;
            }
            else if (body.type == "formencoded" && body.form) {
                var formArray: string[] = [];
                body.form.forEach(element => {
                    formArray.push(`${element.name}=${element.value}`);
                });

                codeBuilder.push(`let bodyContent = "${formArray.join("&")}";\n`);
                hasBody = true;
            }
            else if (body.raw) {
                hasBody = true;
                if (body.type == "json") {
                    codeBuilder.push(`let bodyContent = JSON.stringify(${body.raw});\n`);

                } else {
                    codeBuilder.push(`let bodyContent = ${JSON.stringify(body.raw)};\n`);
                }
            } else if (body.graphql) {
                let varData = body.graphql.variables;
                let variablesData = varData ? JSON.parse(varData.replace(/\n/g, " ")) : "{}"
                codeBuilder.push("let gqlBody = {");
                codeBuilder.push(`  query: \`${body.graphql.query}\`,`);
                codeBuilder.push(`  variables: ${JSON.stringify(variablesData)}`);
                codeBuilder.push("}\n");

                codeBuilder.push(`let bodyContent =  JSON.stringify(gqlBody);\n`);
                hasBody = true;
            }
            else if (body.binary) {
                var imageAsBase64 = convertFileToBase64(body.binary);
                codeBuilder.push(`let bodyContent =  '${imageAsBase64}';\n`);
                hasBody = true;
            }
        }

        codeBuilder.push(`fetch("${request.url}", { `);
        codeBuilder.push(`  method: "${request.method}",`);
        if (hasBody) {
            codeBuilder.push(`  body: bodyContent,`);
        }
        codeBuilder.push(`  headers: headersList`);
        codeBuilder.push("}).then(function(response) {");
        codeBuilder.push("  return response.text();")
        codeBuilder.push("}).then(function(data) {");
        codeBuilder.push("  console.log(data);")
        codeBuilder.push("})");

        codeResult.code = codeBuilder.join("\n");
        return codeResult
    }
}