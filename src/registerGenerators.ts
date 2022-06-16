import CodeGenerator from "./generators/codeGenerator";
import CsharpHttpClient from "./generators/csharpHttpClient";
import CurlRequest from "./generators/curlRequest";
import JavascriptFetch from "./generators/javascriptFetch";
import JavascriptAxios from "./generators/javascriptAxios";
import PythonHttpClient from "./generators/pythonHttpClient";
import PythonRequests from "./generators/pythonRequests";
import PowerShell from "./generators/powershell";
import DartHttp from "./generators/dartHttp";
import Http from "./generators/httpRequest";
import HttpRequest from "./generators/httpRequest";

export default class RegisterGenerators {

    public static getCodeGenerators(): CodeGenerator[] {
        var generators: CodeGenerator[] = [];

        generators.push(new JavascriptFetch());
        generators.push(new JavascriptAxios());
        generators.push(new CsharpHttpClient());
        generators.push(new CurlRequest());
        generators.push(new PythonHttpClient());
        generators.push(new PythonRequests());
        generators.push(new PowerShell());
        generators.push(new DartHttp());
        generators.push(new HttpRequest());

        return generators;
    }
}