/** XHR wrapper */
export default class duck {
    public config: GlobalConfig
    constructor(config?: GlobalConfig)
    public GET(config: RequestConfig): Promise<Response>
    public POST(config: RequestConfig): Promise<Response>
    public PUT(config: RequestConfig): Promise<Response>
    public DELETE(config: RequestConfig): Promise<Response>
    public HEAD(config: RequestConfig): Promise<Response>
    public OPTIONS(config: RequestConfig): Promise<Response>
    public PATCH(config: RequestConfig): Promise<Response>
}

/** you can cancel request by passing Cancelable in request config */
export interface Cancelable {
    cancel: (message?: string) => void
}

/** available request methods */
export enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS",
    PATCH = "PATCH"
}

/** available hooks */
export enum HookName {
    onRequest = "onRequest",
    onResponse = "onResponse",
    onDownload = "onDownload",
    onUploadProgress = "onUploadProgress",
    onUploaded = "onUploaded",
    onError = "onError"
}

/** available request errors */
export enum RequestError {
    /** connection timeout */
    timeout = "timeout",
    /** cors-like error */
    network = "network",
    /** error while request */
    request = "request",
    /** server error (not 2** status code) */
    response = "response",
    /** request has been cancelled */
    cancel = "cancel"
}

/** available request body */
export type RequestBody = string | number | object | Blob | BufferSource | FormData | URLSearchParams | ReadableStream

/** headers */
export type Headers = {
    [name: string]: string | number
}

/** request params */
export type RequestParams = {
    [name: string]: string | number | boolean
}

/** response from server */
export type Response = {
    body: any
    statusCode: number
}

/** request errors */
export type RequestFail = {
    type: RequestError.timeout | RequestError.network | RequestError.request
} | Response & {
    type: RequestError.response
} | {
    type: RequestError.cancel
    message?: string | number
}

/** global & local configs extends this */
export type BasicConfig = {
    /** @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials */
    withCredentials?: boolean
    /** how long to wait response from the server (in ms)  */
    timeout?: number
    headers?: Headers
    hooks?: Hooks
}

/** global configuration for all requests */
export type GlobalConfig = BasicConfig & {
    /**
     * URL like https://example.com.
     * Any request will paste this url before request url.
     */
    baseURL?: string
}

/** configuration for one request */
export type RequestConfig = BasicConfig & {
    /** this property is set automatically.
     *  What is it for? For example: understand in a hook what kind of method
     */
    method?: RequestMethod
    /** URL or path like '/hello/world' if {@link GlobalConfig.baseURL baseURL} setted */
    url: string
    body?: RequestBody
    params?: RequestParams
    /** token for request cancel */
    cancelToken?: Cancelable
}


/** useful data in hook */
export type HookOutput = HookOutput.onRequest | HookOutput.onResponse | HookOutput.onLoad | HookOutput.onError
/** execute functions on XHR lifecycle */
export type Hooks = { [Name in HookName]?: (output: GetHookOutput<Name>) => void }
/** get hook type depending on hook name */
export type GetHookOutput<Name extends HookName, Output = HookOutput> = Output extends { name: infer U } ? Name extends U ? Output : never : never
// https://qna.habr.com/q/1080798
export namespace HookOutput {

    interface Base {
        name: HookName
        config: RequestConfig
        data: unknown
    }

    /** requet to server */
    export interface onRequest extends Base {
        name: HookName.onRequest
        data: RequestConfig
    }

    /** response from server */
    export interface onResponse extends Base {
        name: HookName.onResponse
        data: Response
    }

    /** server download / upload */
    export interface onLoad extends Base {
        name: HookName.onDownload | HookName.onUploadProgress | HookName.onUploaded
        data: ProgressEvent<EventTarget>
    }

    /** any error: request / cors / timeout etc */
    export interface onError extends Base {
        name: HookName.onError
        data: RequestFail
    }
}



