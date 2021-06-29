export class CodeResultModel {
    code: string = ""
    lang: string = ""

    constructor(language: string) {
        this.lang = language;
    }
}

export class CodeItemModel {
    name: string;
    id: string;

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }
}