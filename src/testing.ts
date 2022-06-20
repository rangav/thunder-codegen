import { CodeProcessor } from "./codeProcessor";
import { RequestCodeModel } from "./models/requestModel";

let codeGenerator = new CodeProcessor();
let request: RequestCodeModel = {
    "url": "https://httpbin.org/anything",
    "method": "POST",
    "headers": [
        { name: "Accept", value: "*/*" },
        { name: "User-Agent", value: "Thunder Client (https://www.thunderclient.com)" }
    ],
    "body": {
        "type": "json",
        "raw": "{\n  \"name\": \"abc\"\n}",
        "form": [
            {
                "name": "name",
                "value": "abc"
            },
            {
                "name": "loc",
                "value": "boston"
            }
        ]
    }
}

let result = codeGenerator.getCode("http", request);
console.log(result?.code);