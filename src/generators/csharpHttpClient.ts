import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";
import { firstLetterUpper } from "../helpers/helper";

export default class CsharpHttpClient implements CodeGenerator {

    displayName: string = "C# HttpClient";
    lang: string = "csharp";
    id: string = "cs-httpclient";

    getCode(request: RequestCodeModel): CodeResultModel {

        // Test online https://dotnetfiddle.net/ - > choose .Net 5
        // using System.Net.Http;
        // using System.Threading.Tasks;
        // using System.Text;

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];

        codeBuilder.push(`var client = new HttpClient();`);
        codeBuilder.push(`var request = new HttpRequestMessage();`);
        codeBuilder.push(`request.RequestUri = new Uri("${request.url}");`);
        codeBuilder.push(`request.Method = HttpMethod.${firstLetterUpper(request.method)};`);
        codeBuilder.push(``);

        request.headers.forEach(element => {
            if (!element.name.includes("Content-Type"))
                codeBuilder.push(`request.Headers.Add("${element.name}", "${element.value}");`)
        });
        codeBuilder.push(``);

        let body = request.body;
        if (body) {
            if (body.type == "formdata" && (body.form || body.files)) {
                codeBuilder.push(`var content = new MultipartFormDataContent();`)
                body.form?.forEach(element => {
                    codeBuilder.push(`content.Add(new StringContent("${element.value}"), "${element.name}");`);
                });

                body.files?.forEach(element => {
                    codeBuilder.push(`content.Add(new ByteArrayContent(File.ReadAllBytes("${element.value}")), "file", "${element.name}");`);
                });

                codeBuilder.push(`request.Content = content;\n`);

            } else if (body.type == "formencoded" && body.form) {
                codeBuilder.push(`var formList = new List<KeyValuePair<string, string>>();`);
                body.form.forEach(element => {
                    codeBuilder.push(`formList.Add(new KeyValuePair<string, string>("${element.name}", "${element.value}"));`);
                });

                codeBuilder.push(`request.Content = new FormUrlEncodedContent(formList);\n`);
            } else if (body.raw) {
                let contentType = "application/json";
                if (body.type == "xml") {
                    contentType = "application/xml"
                }
                if (body.type === "text") {
                    contentType = "text/plain";
                }

                let bodyString = JSON.stringify(body.raw);

                codeBuilder.push(`var bodyString = ${bodyString.replace(/\\n/g, "")};`);
                codeBuilder.push(`var content = new StringContent(bodyString, Encoding.UTF8, "${contentType}");`);
                codeBuilder.push(`request.Content = content;\n`);
            }
            else if (body.graphql) {
                let varData = body.graphql.variables;
                let variablesData = varData ? JSON.parse(varData.replace(/\n/g, " ")) : "{}"

                let gqlBody = {
                    query: body.graphql.query,
                    variables: variablesData
                }

                let bodyString = JSON.stringify(gqlBody);

                codeBuilder.push(`var content = new StringContent("${bodyString.replace(/"/g, '\\"').replace(/\\n/g, " ")}", Encoding.UTF8, "application/json");`);
                codeBuilder.push(`request.Content = content;\n`);

            }
            else if (body.binary) {
                let contentType = request.headers.find(s => s.name == "Content-Type")?.value;

                codeBuilder.push(`var base64 = Convert.ToBase64String(File.ReadAllBytes("${body.binary}"));`)
                codeBuilder.push(`var content = new StringContent(base64, Encoding.UTF8, "${contentType}");`);
                codeBuilder.push(`request.Content = content;\n`);
            }
        }

        codeBuilder.push(`var response = await client.SendAsync(request);`)
        codeBuilder.push(`var result = await response.Content.ReadAsStringAsync();`)
        codeBuilder.push(`Console.WriteLine(result);`)
        codeResult.code = codeBuilder.join("\n");
        return codeResult
    }
}