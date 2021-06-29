
export type KeyValue = {
    name: string,
    value: string,
    isDisabled?: boolean | undefined
}

export type BasicAuth = {
    username: string,
    password: string
}

export type GraphqlBody = {
    query: string,
    variables?: string | undefined
}

export type BodyType = "none" | "text" | "json" | "xml" | "formdata" | "formencoded" | "graphql";

export type RequestBody = {
    type: BodyType,
    raw: string | undefined,
    form: KeyValue[] | undefined,
    files: KeyValue[] | undefined,
    graphql: GraphqlBody | undefined
}

export type AuthType = "none" | "basic" | "bearer" | "oauth2";

export type Authentication = {
    type: AuthType,
    basic: BasicAuth | undefined,
    bearer: string | undefined,
    oauth2: any
}

export class RequestCodeModel {
    public method: string = "";
    public url: string = "";
    public headers: KeyValue[] = [];
    public params: KeyValue[] | undefined;
    public body: RequestBody | undefined;
    public auth: Authentication | undefined;
}