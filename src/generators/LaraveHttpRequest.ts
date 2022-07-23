import { RequestCodeModel } from "../models/requestModel";
import CodeGenerator from "./codeGenerator";
import { CodeResultModel } from "../models/codeModels";

export default class LaraveHttpRequest implements CodeGenerator {

    displayName: string = "PHP-Laravel HTTP Client";
    lang: string = "php";
    id: string = "laravel-http";
    firstline: string = `    $response = Illuminate\\Support\\Facades\\Http::`;

    getCode(request: RequestCodeModel): CodeResultModel {

        let codeResult = new CodeResultModel(this.lang);
        let codeBuilder = [];

        let params = this.getParams(request);
        let body = request.body;
        let method = request.method.toLowerCase()
        let funname = request.url.substring(request.url.lastIndexOf('/') + 1);
        codeBuilder.push(`function test_${method}_${funname}()`);
        codeBuilder.push(`{`);
        if (body && (body.type == "formdata" || body.type == "formencoded")) {
            codeBuilder.push(`${this.firstline}asForm()`);
        } else {
            codeBuilder.push(`${this.firstline}withBody(`);
            codeBuilder = [...codeBuilder, ...this.getRawContent(request)];
        }

        codeBuilder = [...codeBuilder, ...this.getHeaders(request)];

        if (params.length == 0 && !this.isForm(request)) {
            codeBuilder.push(`    ->${method}('${request.url}');`)
        } else {

            codeBuilder.push(`    ->${method}('${request.url}',[`)
            codeBuilder = [...codeBuilder, ...params];
            codeBuilder.push(`    ]);`);
        }
        codeBuilder.push(`    return $response->body();`)
        codeBuilder.push(`}`);
        codeResult.code = codeBuilder.join(" \n");
        return codeResult
    }

    public isForm(request: RequestCodeModel) {
        let body = request.body;
        return body && (body.type == "formdata" || body.type == "formencoded");
        //(request.body.raw || request.body?.binary || request.body?.graphql);
    }

    public getHeaders(request: RequestCodeModel) {
        let codeBuilder = [];
        if (request.body) {
            codeBuilder.push(`    ->withHeaders([`);
        } else {
            codeBuilder.push(`    ${this.firstline}withHeaders([`);
        }
        request.headers.forEach(element => {
            codeBuilder.push(`        '${element.name}'=> '${element.value}',`)
        });
        codeBuilder.push(`    ])`);
        return codeBuilder;
    }

    public getParams(request: RequestCodeModel) {
        let body = request.body;
        let codeBuilder: any[] = [];

        if (body && this.isForm(request)) {
            body.form?.forEach(element => {
                codeBuilder.push(`        '${element.name}'=>'${element.value}',`);
            });
        }

        return codeBuilder;
    }

    public getRawContent(request: RequestCodeModel) {
        let body = request.body;
        let codeBuilder: any[] = [];
        if (body) {
            if (body.raw || body.binary) {
                codeBuilder.push(`        '${body.raw}', '${body.type}'`);
            }
            else if (body.graphql) {
                let varData = body.graphql.variables;
                let variablesData = varData ? JSON.parse(varData.replace(/\n/g, " ")) : "{}"

                let gqlBody = {
                    query: body.graphql.query,
                    variables: variablesData
                }
                codeBuilder.push(`        '${JSON.stringify(gqlBody)}', 'text/json'`);
            }
        }
        return codeBuilder;
    }
}