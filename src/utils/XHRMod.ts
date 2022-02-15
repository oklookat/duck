import { Config, DuckBasic, DuckError, DuckHook, DuckRequest, DuckResponse } from "../types";
import Parse from "./parse";
import Service from "./service";
import Validator from "./validator";

/** adds cool features to XHR */
export default class XHRMod extends XMLHttpRequest {

    private gc: Config
    private rc: DuckRequest.Config

    constructor(gc: Config, rc: DuckRequest.Config, method: DuckRequest.Method) {
        super()
        this.gc = gc
        this.rc = rc
        //
        rc.method = method
        this.timeout = gc.timeout || 15000
        // url
        let url = Service.setBaseURL(rc.url, gc.baseURL)
        url = Service.setRequestParams(url, rc.params)
        rc.url = url
        // credentials
        this.withCredentials = rc.withCredentials || gc.withCredentials || false
    }

    /** send request */
    public sendRequest(method: DuckRequest.Method): Promise<DuckResponse> {
        this.open(method, this.rc.url, true)
        Service.setRequestHeaders(this, this.gc.headers!, this.rc.headers!)
        const body = Parse.requestBody(this.rc.body, this.rc, this.gc)
        // setup events #1
        this.onAbort()
        this.onProgress()
        this.onUploadProgress()
        this.onUploaded()
        return new Promise((resolve, reject) => {
            // setup events #2
            this.onNetworkError(reject)
            this.onTimeoutError(reject)
            this.onResponse(resolve, reject)
            //
            this.send(body)
            this.onRequest()
        })
    }

    /** on request cancelled */
    private onAbort() {
        const err: DuckError.Request = {
            type: "cancel",
            message: undefined
        }
        if (this.rc.cancelToken && "cancel" in this.rc.cancelToken) {
            this.rc.cancelToken.cancel = (message?: string) => {
                err.message = message
                if (!Validator.isRequestActive(this)) {
                    return
                }
                this.abort()
            }
        }
        this.onabort = () => {
            this.executeErrorHook(err)
        }
    }

    /** execute hooks when client send request */
    private onRequest() {
        const h: DuckHook.Output.onRequest = {
            name: "onRequest",
            config: this.rc,
            data: this.rc
        }
        this.executeHooks(h)
    }

    /** when network error (not HTTP)  */
    private onNetworkError(reject: DuckBasic.Rejector) {
        const err: DuckError.Request = {
            type: "network"
        }
        this.onerror = () => {
            this.executeErrorHook(err)
            reject(err)
        }
    }

    /** execute hooks when request or response error */
    private onTimeoutError(reject: DuckBasic.Rejector) {
        const err: DuckError.Request = {
            type: "timeout"
        }
        this.ontimeout = () => {
            this.executeErrorHook(err)
            reject(err)
        }
    }

    /** on downloading from server  */
    private onProgress() {
        this.onprogress = (e) => {
            const h: DuckHook.Output.onLoad = {
                name: "onDownload",
                config: this.rc,
                data: e
            }
            this.executeHooks(h)
        }
    }

    /** on file uploading to server */
    private onUploadProgress() {
        this.upload.onprogress = (e) => {
            const h: DuckHook.Output.onLoad = {
                name: "onUploadProgress",
                config: this.rc,
                data: e
            }
            this.executeHooks(h)
        }
    }

    /** on file uploaded to server */
    private onUploaded() {
        this.upload.onload = (e) => {
            const h: DuckHook.Output.onLoad = {
                name: "onUploaded",
                config: this.rc,
                data: e
            }
            this.executeHooks(h)
        }
    }

    /** on reponse from server */
    private onResponse(resolve: DuckBasic.Resolver<DuckResponse>, reject: DuckBasic.Rejector) {
        const getData = () => {
            const statusCode = this.status
            const body = Parse.responseBody(this.response)
            // HTTP error?
            const isErrorCode = Validator.isHTTPError(statusCode)
            if (isErrorCode) {
                const err: DuckError.Responsed = {
                    type: "response",
                    statusCode: statusCode,
                    body: body
                }
                this.executeErrorHook(err)
                throw err
            }
            // not HTTP error
            const resp: DuckResponse = {
                body: body,
                statusCode: statusCode
            }
            const h: DuckHook.Output.onResponse = {
                name: "onResponse",
                config: this.rc,
                data: resp
            }
            this.executeHooks(h)
            return resp
        }
        this.onload = () => {
            try {
                const response = getData()
                resolve(response)
            } catch (err) {
                // HTTP error (in normal cases)
                reject(err)
            }
        }
    }

    /** execute error hook */
    private executeErrorHook(err: DuckError.Any) {
        const h: DuckHook.Output.onError = {
            name: "onError",
            config: this.rc,
            data: err
        }
        this.executeHooks(h)
    }

    /** execute hooks in global and request configs */
    private executeHooks(h: DuckHook.Any) {
        const globalHookAvailable = Validator.isHookAvailable(h.name, this.gc.hooks)
        if (globalHookAvailable) {
            // @ts-ignore
            this.gc.hooks[h.name](h)
        }
        const localHookAvailable = Validator.isHookAvailable(h.name, this.rc.hooks)
        if (localHookAvailable) {
            // @ts-ignore
            this.rc.hooks[h.name](h)
        }
    }

}