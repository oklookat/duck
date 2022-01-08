import type { GlobalConfig, RequestConfig, Response, RequestFail, HookOutput } from "./types"
import { RequestMethod, RequestError, HookName } from "./types"
import Parse from "./utils/parse"
import Service from "./utils/service"
import Validator from "./utils/validator"

/** XHR wrapper */
export default class duck {

    public config: GlobalConfig = {
        timeout: 15000,
        baseURL: undefined,
        withCredentials: false,
        headers: undefined,
        hooks: undefined,
    }

    constructor(config?: GlobalConfig) {
        if (!config) {
            return
        }
        for (const name in config) {
            // @ts-ignore
            this.config[name] = config[name]
        }
    }

    /** send request (GET) */
    public GET(config: RequestConfig): Promise<Response> {
        return this.buildAndSend(RequestMethod.GET, config)
    }

    /** send request (POST) */
    public POST(config: RequestConfig): Promise<Response> {
        return this.buildAndSend(RequestMethod.POST, config)
    }

    /** send request (PUT) */
    public PUT(config: RequestConfig): Promise<Response> {
        return this.buildAndSend(RequestMethod.PUT, config)
    }

    /** send request (DELETE) */
    public DELETE(config: RequestConfig): Promise<Response> {
        return this.buildAndSend(RequestMethod.DELETE, config)
    }

    /** send request (HEAD) */
    public HEAD(config: RequestConfig): Promise<Response> {
        return this.buildAndSend(RequestMethod.HEAD, config)
    }

    /** send request (OPTIONS) */
    public OPTIONS(config: RequestConfig): Promise<Response> {
        return this.buildAndSend(RequestMethod.OPTIONS, config)
    }

    /** send request (PATCH) */
    public PATCH(config: RequestConfig): Promise<Response> {
        return this.buildAndSend(RequestMethod.PATCH, config)
    }

    /** create XHR, set settings and headers, then send request via {@link setupHooksAndSend} */
    private buildAndSend(method: RequestMethod, rc: RequestConfig): Promise<Response> {
        let xhr = new XMLHttpRequest();
        xhr.timeout = this.config.timeout || 15000
        // url
        let url = Service.setBaseURL(rc.url, this.config.baseURL)
        url = Service.setRequestParams(url, rc.params)
        rc.url = url
        // credentials
        let withCredentials = false
        if (rc.withCredentials) {
            withCredentials = rc.withCredentials
        } else if (this.config.withCredentials) {
            withCredentials = this.config.withCredentials
        }
        xhr.withCredentials = withCredentials
        // send
        xhr.open(method, rc.url, true)
        Service.setRequestHeaders(xhr, rc, this.config)
        return this.setupHooksAndSend(xhr, rc)
    }

    /** set config, parse request body, set hooks, send request */
    private setupHooksAndSend(xhr: XMLHttpRequest, rc: RequestConfig): Promise<Response> {
        const body = Parse.requestBody(rc.body, rc, this.config)
        return new Promise((resolve, reject) => {
            // when downloading from server
            xhr.onprogress = (e) => {
                this.onDownload(e, rc)
            }
            // when file uploading to server
            xhr.upload.onprogress = (e) => {
                this.onUploadProgress(e, rc)
            }
            // when file uploaded to server
            xhr.upload.onload = (e) => {
                this.onUploaded(e, rc)
            }
            // when response from server
            xhr.onload = () => {
                try {
                    const response = this.onResponse(xhr, rc)
                    resolve(response)
                } catch (err) {
                    // HTTP error (in normal cases)
                    reject(err)
                }
            }
            // when network error (not HTTP)
            xhr.onerror = () => {
                const err: RequestFail = {
                    type: RequestError.network
                }
                this.onError(err, rc)
                reject(err)
            }
            // when timeout
            xhr.ontimeout = () => {
                const err: RequestFail = {
                    type: RequestError.timeout
                }
                this.onError(err, rc)
                reject(err)
            }
            // if cancel token provided
            if (rc.cancelToken && 'cancel' in rc.cancelToken) {
                rc.cancelToken.cancel = (message?: string) => {
                    if (!Validator.isRequestActive(xhr)) {
                        return
                    }
                    xhr.abort()
                    const err: RequestFail = {
                        type: RequestError.cancel,
                        message: message
                    }
                    this.onError(err, rc)
                    reject(err)
                }
            }
            xhr.send(body)
            this.onRequest(rc)
        })
    }

    /** execute hooks when client send request */
    private onRequest(rc: RequestConfig) {
        const h: HookOutput = {
            name: HookName.onRequest,
            config: rc,
            data: rc
        }
        this.executeHooks(h)
    }

    /** execute hooks when get response from server */
    private onResponse(xhr: XMLHttpRequest, rc: RequestConfig): Response {
        const statusCode = xhr.status
        const body = Parse.responseBody(xhr.response)
        // HTTP error?
        const is4xx = Validator.isCodeXX(statusCode, 400)
        const is5xx = Validator.isCodeXX(statusCode, 500)
        if (is4xx || is5xx) {
            const err: RequestFail = {
                type: RequestError.response,
                statusCode: statusCode,
                body: body
            }
            this.onError(err, rc)
            throw err
        }
        // not HTTP error
        const resp: Response = {
            body: body,
            statusCode: statusCode
        }
        this.onSuccess(resp, rc)
        return resp
    }

    /** execute hooks when request or response error */
    private onError(err: RequestFail, rc: RequestConfig) {
        const h: HookOutput = {
            name: HookName.onError,
            config: rc,
            data: err
        }
        this.executeHooks(h)
    }

    /** execute hooks when response has 1xx, 2xx, 3xx status code */
    private onSuccess(data: Response, rc: RequestConfig) {
        const h: HookOutput = {
            name: HookName.onResponse,
            config: rc,
            data: data
        }
        this.executeHooks(h)
    }

    /** execute hooks when downloading data from server */
    private onDownload(e: ProgressEvent<EventTarget>, rc: RequestConfig) {
        const h: HookOutput = {
            name: HookName.onDownload,
            config: rc,
            data: e
        }
        this.executeHooks(h)
    }

    /** execute hooks when upload data to server */
    private onUploadProgress(e: ProgressEvent<EventTarget>, rc: RequestConfig) {
        const h: HookOutput = {
            name: HookName.onUploadProgress,
            config: rc,
            data: e
        }
        this.executeHooks(h)
    }

    /** execute hooks when data uploaded to server */
    private onUploaded(e: ProgressEvent<EventTarget>, rc: RequestConfig) {
        const h: HookOutput = {
            name: HookName.onUploaded,
            config: rc,
            data: e
        }
        this.executeHooks(h)
    }

    /** execute hooks depending on global and request config */
    private executeHooks(h: HookOutput) {
        const globalHookAvailable = Validator.isHookAvailable(h.name, this.config.hooks)
        if (globalHookAvailable) {
            // @ts-ignore
            this.config.hooks[h.name](h as any)
        }
        const localHookAvailable = Validator.isHookAvailable(h.name, h.config.hooks)
        if (localHookAvailable) {
            // @ts-ignore
            h.config.hooks[h.name](h as any)
        }
    }
}