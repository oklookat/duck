import { Config, DuckRequest, DuckResponse } from "./types"
import XHRMod from "./utils/XHRMod";
//
import CancelToken from "./utils/cancel"
export {
    CancelToken
}

/** package version */
declare const __DUCK_VERSION__: string;

/** XHR wrapper */
export default class duck {

    public get version(): string {
        return __DUCK_VERSION__
    }

    public config: Config = {
        timeout: 15000,
        baseURL: undefined,
        withCredentials: false,
        headers: undefined,
        hooks: undefined,
    }

    constructor(config?: Config) {
        if (!config) {
            return
        }
        Object.assign(this.config, config)
    }

    public GET(config: DuckRequest.Config): Promise<DuckResponse> {
        return this.send("GET", config)
    }

    public POST(config: DuckRequest.Config): Promise<DuckResponse> {
        return this.send("POST", config)
    }

    public PUT(config: DuckRequest.Config): Promise<DuckResponse> {
        return this.send("PUT", config)
    }

    public DELETE(config: DuckRequest.Config): Promise<DuckResponse> {
        return this.send("DELETE", config)
    }

    public HEAD(config: DuckRequest.Config): Promise<DuckResponse> {
        return this.send("HEAD", config)
    }

    public OPTIONS(config: DuckRequest.Config): Promise<DuckResponse> {
        return this.send("OPTIONS", config)
    }

    public PATCH(config: DuckRequest.Config): Promise<DuckResponse> {
        return this.send("PATCH", config)
    }

    private async send(method: DuckRequest.Method, rc: DuckRequest.Config): Promise<DuckResponse> {
        const xhrMod = new XHRMod(this.config, rc, method)
        return xhrMod.sendRequest(method)
    }

}