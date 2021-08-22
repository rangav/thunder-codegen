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

        let bodyContent = "";
        let body = request.body;
        if (body) {
            if (body.type == "formdata" && (body.form || body.files)) {
                codeBuilder.push(`let formdata = new FormData();`)
                body.form?.forEach(element => {
                    codeBuilder.push(`formdata.append("${element.name}", "${element.value}");`);
                });
                body.files?.forEach(element => {
                    codeBuilder.push(`formdata.append("${element.name}", "${element.value}");`);
                });
                codeBuilder.push(``);

                bodyContent = `  body: formdata`;
            }
            else if (body.type == "formencoded" && body.form) {
                var formArray: string[] = [];
                body.form.forEach(element => {
                    formArray.push(`${element.name}=${element.value}`);
                });

                bodyContent = `  body: "${formArray.join("&")}"`;
            }
            else if (body.raw) {
                bodyContent = body.type == "json" ? `  body: ${JSON.stringify(body.raw)}` : `  body: \`${body.raw}\``;
            } else if (body.graphql) {
                let varData = body.graphql.variables;
                let variablesData = varData ? JSON.parse(varData.replace(/\n/g, " ")) : "{}"
                codeBuilder.push("let gqlBody = {");
                codeBuilder.push(`  query: \`${body.graphql.query}\`,`);
                codeBuilder.push(`  variables: ${JSON.stringify(variablesData)}`);
                codeBuilder.push("}\n");

                bodyContent = `  body: JSON.stringify(gqlBody)`;
            }
            else if (body.binary) {
                var imageAsBase64 = convertFileToBase64(body.binary);
                bodyContent = `  body: '${imageAsBase64}'`;
            }
        }

        codeBuilder.push(`fetch("${request.url}", { `);
        codeBuilder.push(`  method: "${request.method}",`);
        if (bodyContent) {
            codeBuilder.push(`${bodyContent},`);
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