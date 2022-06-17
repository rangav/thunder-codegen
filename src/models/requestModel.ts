
export type KeyValue = {
    name: string,
    value: string,
    isDisabled?: boolean | undefined
}

export type BasicAuth = {
    username: string,
    password: string | undefined
}

export type GraphqlBody = {
    query: string,
    variables?: string | undefined
}

export type BodyType = "none" | "text" | "json" | "xml" | "formdata" | "formencoded" | "graphql" | "binary";

export type RequestBody = {
    type: BodyType,
    raw?: string,
    form?: KeyValue[],
    files?: KeyValue[],
    graphql?: GraphqlBody,
    binary?: string
}

export type AuthType = "none" | "inherit" | "basic" | "bearer" | "oauth2" | "ntlm" | "aws";

export type Authentication = {
    type: AuthType,
    basic?: BasicAuth,
    bearer?: string,
    oauth2?: any,
    ntlm?: any,
    aws?: any
}

export class RequestCodeModel {
    public method: string = "";
    public url: string = "";
    public headers: KeyValue[] = [];
    public body?: RequestBody;
    public auth?: Authentication;
}