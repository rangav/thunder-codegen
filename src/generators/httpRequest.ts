import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";

export default class HttpRequest implements CodeGenerator {

    displayName: string = "Http";
    lang: string = "http";
    id: string = "http";

    getCode(request: RequestCodeModel): CodeResultModel {

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];
  


        const url = new URL(request.url);

        // codeBuilder.push("import 'package:http/http.dart' as http;\n");

        codeBuilder.push(`${request.method} ${url.pathname} HTTP/1.1\r\n`); //The http version is better to be obtained from the file settings.json
        codeBuilder.push(`Host: ${url.hostname}: ${url.port}\r\n`);

        request.headers.forEach(element => {
            codeBuilder.push(`'${element.name}: ${element.value}\r\n'`)
        });

        codeBuilder.push(`var headersList = {\n${headerString.join(",\n")} \n};`);
        codeBuilder.push(`var url = Uri.parse('${request.url}');\n`)

        let bodyContent = "";
        let RequestType = "Request";
        let body = request.body;
        if (body) {
            if (body.type == "formdata" && (body.form || body.files)) {
                let formData: string[] = [];
                body.form?.forEach(element => {
                    formData.push(` '${element.name}': '${element.value}'`)
                });

                body.files?.forEach(element => {
                    bodyContent += `req.files.add(await http.MultipartFile.fromPath('${element.name}', '${element.value}'));\n`;
                });

                codeBuilder.push(`{\n${formData.join(",\n")} \n}`);
                bodyContent += "req.fields.addAll(body);"
                RequestType = "MultipartRequest";

            } else if (body.type == "formencoded" && body.form) {
                let formData: string[] = [];
                body.form?.forEach(element => {
                    formData.push(` '${element.name}': '${element.value}'`)
                });

                codeBuilder.push(`{\n${formData.join(",\n")} \n}`);
                bodyContent += "req.bodyFields = body;"
            } else if (body.raw) {

                if (body.type == "json") {
                    codeBuilder.push(`${body.raw}`);
                    bodyContent += "req.body = json.encode(body);"
                } else {
                    codeBuilder.push(`'''${body.raw}'''`);
                    bodyContent += "req.body = body;"
                }
            }
            else if (body.graphql) {
                let varData = body.graphql.variables;
                let variablesData = varData ? JSON.parse(varData.replace(/\n/g, " ")) : "{}"

                let gqlBody = {
                    query: body.graphql.query,
                    variables: variablesData
                }

                let bodyString = JSON.stringify(gqlBody);

                codeBuilder.push(`'''${bodyString.replace(/\$/g, "\\$").replace(/\\n/g, " ")}'''`);
                bodyContent += "req.body = body;"
            }
            else if (body.binary) {
                codeBuilder.push(`File('${body.binary}');`)
                bodyContent += "req.bodyBytes = body;"
            }
        }



        codeResult.code = codeBuilder.join("\r\n");
        return codeResult
    }
}