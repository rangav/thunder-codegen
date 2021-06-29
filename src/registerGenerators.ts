import CodeGenerator from "./generators/codeGenerator";
import CsharpHttpClient from "./generators/csharpHttpClient";
import CurlRequest from "./generators/curlRequest";
import JavascriptFetch from "./generators/javascriptFetch";
import JavascriptAxios from "./generators/javascriptAxios";
import PythonHttpClient from "./generators/pythonHttpClient";
import PythonRequests from "./generators/pythonRequests";

export default class RegisterGenerators {

    public static getCodeGenerators(): CodeGenerator[] {
        var generators: CodeGenerator[] = [];

        generators.push(new JavascriptFetch());
        generators.push(new JavascriptAxios());
        generators.push(new CsharpHttpClient());
        generators.push(new CurlRequest());
        generators.push(new PythonHttpClient());
        generators.push(new PythonRequests());

        return generators;
    }
}