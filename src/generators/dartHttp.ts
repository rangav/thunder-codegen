import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";

export default class DartHttp implements CodeGenerator {

    displayName: string = "Dart Http";
    lang: string = "dart";
    id: string = "dart";

    getCode(request: RequestCodeModel): CodeResultModel {

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];
        let headerString: string[] = [];

        request.headers.forEach(element => {
            headerString.push(` '${element.name}': '${element.value}'`)
        });

        // codeBuilder.push("import 'package:http/http.dart' as http;\n");

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

                codeBuilder.push(`var body = {\n${formData.join(",\n")} \n};`);
                bodyContent += "req.fields.addAll(body);"
                RequestType = "MultipartRequest";

            } else if (body.type == "formencoded" && body.form) {
                let formData: string[] = [];
                body.form?.forEach(element => {
                    formData.push(` '${element.name}': '${element.value}'`)
                });

                codeBuilder.push(`var body = {\n${formData.join(",\n")} \n};`);
                bodyContent += "req.bodyFields = body;"
            } else if (body.raw) {

                if (body.type == "json") {
                    codeBuilder.push(`var body = ${body.raw};`);
                    bodyContent += "req.body = json.encode(body);"
                } else {
                    codeBuilder.push(`var body = '''${body.raw}''';`);
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

                codeBuilder.push(`var body = '''${bodyString.replace(/\$/g, "\\$").replace(/\\n/g, " ")}''';`);
                bodyContent += "req.body = body;"
            }
            else if (body.binary) {
                codeBuilder.push(`var file = File('${body.binary}');`)
                codeBuilder.push(`var body = await file.readAsBytes();\n`)
                bodyContent += "req.bodyBytes = body;"
            }
        }

        codeBuilder.push(`var req = http.${RequestType}('${request.method}', url);`);
        codeBuilder.push(`req.headers.addAll(headersList);`);
        if (bodyContent) {
            codeBuilder.push(bodyContent);
        }

        codeBuilder.push(`\nvar res = await req.send();`);
        codeBuilder.push(`final resBody = await res.stream.bytesToString();`);

        codeBuilder.push(`\nif (res.statusCode >= 200 && res.statusCode < 300) {`);
        codeBuilder.push("  print(resBody);");
        codeBuilder.push("}\nelse {")
        codeBuilder.push("  print(res.reasonPhrase);")
        codeBuilder.push("}")

        codeResult.code = codeBuilder.join("\n");
        return codeResult
    }
}