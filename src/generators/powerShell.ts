import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";
import { convertFileToBase64, firstLetterUpper } from "../helpers/helper";
import * as path from "path";

export default class PowerShell implements CodeGenerator {

    displayName: string = "PowerShell";
    lang: string = "powershell";
    id: string = "powershell";

    getCode(request: RequestCodeModel): CodeResultModel {

        // Test Online

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];
        let contentType = "";

        codeBuilder.push(`$headers = @{}`)
        request.headers.forEach(element => {
            codeBuilder.push(`$headers.Add("${element.name}", "${element.value}")`)
        });

        let bodyContent = "";
        let body = request.body;
        let contentTypeHeader: string | undefined = request.headers.find(s => s.name == "Content-Type")?.value;
        if (contentTypeHeader)
            contentType = `-ContentType '${contentTypeHeader}'`;

        if (body) {
            if (body.type == "formdata") {
                let boundary = "kljmyvW1ndjXaOEAg4vPm6RBUqO6MC5A";
                var formArray: string[] = [];

                if (body.form && body.form.length > 0) {
                    body.form.forEach(element => {
                        formArray.push(`--${boundary}\nContent-Disposition: form-data; name="${element.name}"\n\n${element.value}\n`);
                    });

                }

                // if (body.files && body.files.length > 0) {
                //     body.files.forEach(element => {
                //         let name = path.basename(element.value);
                //         // var imageAsBase64 = convertFileToBase64(body.binary);
                //         formArray.push(`--${boundary}\nContent-Disposition: form-data; name="${element.name}"; filename="${name}"\nContent-Type: multipart/form-data\n\n\n`);
                //     });
                // }

                bodyContent = `$body = '${formArray.join("")}--${boundary}--\n'`;
                // todo multi part form
                codeBuilder.push(`$contentType = 'multipart/form-data; boundary=${boundary}'`)
                contentType = `-ContentType $contentType`;
            }
            else if (body.type == "formencoded" && body.form && body.form.length > 0) {
                var formArray: string[] = [];
                body.form.forEach(element => {
                    formArray.push(`${element.name}=${element.value}`);
                });

                bodyContent = `$body = '${formArray.join("&")}'`;

            } else if (body.raw) {
                // console.log("python body:", body.raw);
                bodyContent = `$body = '${body.raw}'`;
            }
            else if (body.graphql) {
                let varData = body.graphql.variables;
                let variablesData = varData ? JSON.parse(varData.replace(/\n/g, " ")) : "{}"

                let gqlBody = {
                    query: body.graphql.query,
                    variables: variablesData
                }

                let bodyString = JSON.stringify(gqlBody);

                bodyContent = `$body = '${bodyString.replace(/\$/g, '`$').replace(/"/g, '`"').replace(/\\n/g, " ")}'`;
            }
            else if (body.binary) {
                var imageAsBase64 = convertFileToBase64(body.binary);
                bodyContent = `$body = '${imageAsBase64}'`;
            }
        }

        codeBuilder.push("");
        codeBuilder.push(`$reqUrl = '${request.url}'`)


        codeBuilder.push(`${bodyContent}\n`);
        let bodyAppendText = bodyContent ? "-Body $body" : "";

        codeBuilder.push(`$response = Invoke-RestMethod -Uri $reqUrl -Method ${firstLetterUpper(request.method)} -Headers $headers ${contentType} ${bodyAppendText}`);
        codeBuilder.push(`$response | ConvertTo-Json`);
        codeResult.code = codeBuilder.join("\n");
        return codeResult
    }
}