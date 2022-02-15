/** XHR wrapper */
export default class duck {
    /** get package version */
    public get version(): string
    /** main config */
    public config: Config
    constructor(config?: Config)
    /** send request (GET) */
    public GET(config: DuckRequest.Config): Promise<DuckResponse>
    /** send request (POST) */
    public POST(config: DuckRequest.Config): Promise<DuckResponse>
    /** send request (PUT) */
    public PUT(config: DuckRequest.Config): Promise<DuckResponse>
    /** send request (DELETE) */
    public DELETE(config: DuckRequest.Config): Promise<DuckResponse>
    /** send request (HEAD) */
    public HEAD(config: DuckRequest.Config): Promise<DuckResponse>
    /** send request (OPTIONS) */
    public OPTIONS(config: DuckRequest.Config): Promise<DuckResponse>
    /** send request (PATCH) */
    public PATCH(config: DuckRequest.Config): Promise<DuckResponse>
}

/** you can cancel request by passing CancelToken instance in request config */
export class CancelToken {
    /** cancel request */
    cancel(message?: string): void
}

/** duck main config */
export type Config = DuckBasic.Config & {
    /**
     * Base URL. After settings this option, you can use relative paths in request.
     * 
     * Example: 
     * 
     * baseURL = https://example.com/api/v1.
     * 
     * {@link RequestConfig.url request url} = "/users"
     * 
     * request go to: https://example.com/api/v1/users
     */
    baseURL?: string
}

/** basic things */
export namespace DuckBasic {
    /** should have method that converts value to string */
    export interface Stringer {
        toString: () => string
    }
    /** method that resolves promise */
    export type Resolver<T> = (value: T | PromiseLike<T>) => void
    /** method that reject promise */
    export type Rejector = (reason?: any) => void
    /** you can cancel request by passing Cancelable implementation in request config */
    export interface Cancelable {
        cancel: (message?: string) => void
    }

    /** global & local configs extends this */
    export type Config = {
        /** @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials */
        withCredentials?: boolean
        /** how long to wait response from the server (in ms)  */
        timeout?: number
        headers?: DuckRequest.Headers
        hooks?: DuckHook.List
    }
}

/** request things */
export namespace DuckRequest {
    export type Method = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH"
    export type Body = string | number | object | Blob | BufferSource | FormData | URLSearchParams | ReadableStream
    export type Params = Record<string | number, DuckBasic.Stringer>
    export type Headers = Record<string | number, DuckBasic.Stringer>
    /** should have method to set headers */
    export interface HeaderSetter {
        setRequestHeader(name: string, value: string): void
    }
    /** configuration for one request */
    export type Config = DuckBasic.Config & {
        /** this property is set automatically.
         * 
         *  What is it for? For example: understand in a hook what kind of method
         */
        method?: DuckRequest.Method
        /** 
         * request URL or path like "/hello/world" if {@link GlobalConfig.baseURL baseURL} setted */
        url: string
        body?: DuckRequest.Body
        params?: DuckRequest.Params
        /** token for request cancel */
        cancelToken?: DuckBasic.Cancelable
    }
}

/** response from server */
export type DuckResponse = {
    body: any
    statusCode: number
}

/** request/response error */
export namespace DuckError {

    /** any error */
    export type Any = DuckError.Request | DuckError.Responsed

    /** cancel / timeout / CORS / connection */
    export type Request = {
        type: "timeout" | "network" | "request"
    } | {
        type: "cancel"
        message?: string | number
    }

    /** HTTP (399+ status code) */
    export type Responsed = DuckResponse & {
        type: "response"
    }
}

/** hook things */
export namespace DuckHook {

    /** hook names */
    export type Name = "onRequest" | "onResponse" | "onDownload" | "onUploadProgress" | "onUploaded" | "onError"

    /** execute functions on XHR lifecycle */
    export type List = { [Name in DuckHook.Name]?: (output: GetOutput<Name>) => void }

    /** any hook from {@link Hook.Output} */
    export type Any = Output.onRequest | Output.onResponse | Output.onLoad | Output.onError

    // service
    export type GetOutput<Name extends DuckHook.Name,
        Output = DuckHook.Any> = Output extends { name: infer U } ? Name extends U ? Output : never : never

    // https://qna.habr.com/q/1080798
    export namespace Output {

        interface Base {
            name: DuckHook.Name
            config: DuckRequest.Config
            data: unknown
        }

        /** request to server */
        export interface onRequest extends Base {
            name: "onRequest"
            data: DuckRequest.Config
        }

        /** response from server */
        export interface onResponse extends Base {
            name: "onResponse"
            data: DuckResponse
        }

        /** server download / upload */
        export interface onLoad extends Base {
            name: "onDownload" | "onUploadProgress" | "onUploaded"
            data: ProgressEvent<EventTarget>
        }

        /** any error: request / cors / timeout etc */
        export interface onError extends Base {
            name: "onError"
            data: DuckError.Any
        }
    }
}



