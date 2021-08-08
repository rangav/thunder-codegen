import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";
import { convertFileToBase64 } from "../helpers/helper";

export default class PythonRequests implements CodeGenerator {

    displayName: string = "Python Requests";
    lang: string = "python";
    id: string = "python-requests";

    getCode(request: RequestCodeModel): CodeResultModel {

        // Test Online https://www.programiz.com/python-programming/online-compiler/

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];
        let headerString: string[] = [];

        codeBuilder.push("import requests\n");

        codeBuilder.push(`reqUrl = "${request.url}"\n`);

        request.headers.forEach(element => {
            headerString.push(` "${element.name}": "${element.value}"`)
        });

        let bodyContent = `payload = ""`;
        let filesBody = "";
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
            } else if (body.type == "formdata" && body.files && body.files.length > 0) {

                codeBuilder.push(`post_files = {`)
                body.files?.forEach(element => {
                    codeBuilder.push(`  "${element.name}": open("${element.value}", "rb"),`);
                });
                codeBuilder.push(`}`)
                filesBody = "files=post_files,"
            }
            else if (body.type == "formencoded" && body.form && body.form.length > 0) {
                var formArray: string[] = [];
                body.form.forEach(element => {
                    formArray.push(`${element.name}=${element.value}`);
                });

                bodyContent = `payload = "${formArray.join("&")}"`;
            } else if (body.raw) {
                // console.log("python body:", body.raw);
                bodyContent = body.type == "json" ? `payload = ${JSON.stringify(body.raw)}` : `payload = "${body.raw.replace(/  +/g, ' ').replace(/\n/g, "\\n")}"`;
            }
            else if (body.binary) {
                var imageAsBase64 = convertFileToBase64(body.binary);
                bodyContent = `payload = '${imageAsBase64}'`;
            }
        }

        codeBuilder.push(`headersList = {\n${headerString.join(",\n")} \n}`);
        codeBuilder.push("");

        codeBuilder.push(`${bodyContent}\n`);

        codeBuilder.push(`response = requests.request("${request.method}", reqUrl, data=payload, ${filesBody} headers=headersList)\n`);
        codeBuilder.push(`print(response.text)`);
        codeResult.code = codeBuilder.join("\n");
        return codeResult
    }
}