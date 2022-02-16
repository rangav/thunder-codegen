import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";
import { URL } from "url";
import { convertFileToBase64 } from "../helpers/helper";

export default class PythonHttpClient implements CodeGenerator {

    displayName: string = "Python http.client";
    lang: string = "python";
    id: string = "python-httpclient";

    getCode(request: RequestCodeModel): CodeResultModel {

        // Test Online https://www.programiz.com/python-programming/online-compiler/

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];
        let headerString: string[] = [];

        codeBuilder.push("import http.client\n");

        const url = new URL(request.url);

        if (url.port) {
            codeBuilder.push(`conn = http.client.HTTPSConnection("${url.hostname}", ${url.port})\n`);
        } else {
            codeBuilder.push(`conn = http.client.HTTPSConnection("${url.hostname}")\n`);
        }

        request.headers.forEach(element => {
            headerString.push(` "${element.name}": "${element.value}"`)
        });

        let bodyContent = `payload = ""`;
        let body = request.body;
        if (body) {
            if (body.type == "formdata" && body.form && body.form.length > 0) {
                let boundary = "kljmyvW1ndjXaOEAg4vPm6RBUqO6MC5A";
                var formArray: string[] = [];
                body.form.forEach(element => {
                    formArray.push(`--${boundary}\\r\\nContent-Disposition: form-data; name=\\"${element.name}\\"\\r\\n\\r\\n${element.value}\\r\\n`);
                });

                bodyContent = `payload = "${formArray.join("")}--${boundary}--\\r\\n"`;
                // todo multi part form
                headerString.push(` "Content-Type": "multipart/form-data; boundary=${boundary}"`)
            } else if (body.type == "formencoded" && body.form && body.form.length > 0) {
                var formArray: string[] = [];
                body.form.forEach(element => {
                    formArray.push(`${element.name}=${element.value}`);
                });

                bodyContent = `payload = "${formArray.join("&")}"`;
            } else if (body.raw) {
                // console.log("python body:", body.raw);
                bodyContent = body.type == "json" ? `payload = json.dumps(${body.raw})` : `payload = "${body.raw.replace(/  +/g, ' ').replace(/\n/g, "\\n")}"`;
            }
            else if (body.graphql) {
                let varData = body.graphql.variables;
                let variablesData = varData ? JSON.parse(varData.replace(/\n/g, " ")) : "{}"

                let gqlBody = {
                    query: body.graphql.query,
                    variables: variablesData
                }

                let bodyString = JSON.stringify(gqlBody);

                bodyContent = `payload = "${bodyString.replace(/"/g, '\\"').replace(/\\n/g, " ")}"`;
            }
            else if (body.binary) {
                var imageAsBase64 = convertFileToBase64(body.binary);
                bodyContent = `payload = "${imageAsBase64}"`;
            }
        }

        codeBuilder.push(`headersList = {\n${headerString.join(",\n")} \n}`);
        codeBuilder.push("");

        codeBuilder.push(`${bodyContent}\n`);

        codeBuilder.push(`conn.request("${request.method}", "${url.pathname}${url.search}", payload, headersList)`);
        codeBuilder.push(`response = conn.getresponse()`);
        codeBuilder.push(`result = response.read()\n`);
        codeBuilder.push(`print(result.decode("utf-8"))`);
        codeResult.code = codeBuilder.join("\n");
        return codeResult
    }
}