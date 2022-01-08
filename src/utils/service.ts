// some from: https://github.com/axios/axios/blob/76f09afc03fbcf392d31ce88448246bcd4f91f8c/lib/utils.js
// by license:
/**
Copyright (c) 2014-present Matt Zabriskie
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */


import type { GlobalConfig, RequestConfig, Headers, RequestParams } from "../types";
import Validator from "./validator";

/** useful things */
export default class Service {

    /**
     * set base URL
     * @param url url like: /user
     * @param base url like: example.com
     * @returns url like: example.com/user
     */
    public static setBaseURL(url: string, base?: string): string {
        if (!base) {
            return url
        }
        return Service.replaceDoubleSlashes(`${base}/${url}`)
    }

    /**
     * replace double slashes
     * @param s string like: hello//world////
     * @returns string like: hello/world
     */
    public static replaceDoubleSlashes(s: string): string {
        return s.replace(/(?<!:)\/\/+/g, '/')
    }

    /** trim excess whitespace off the beginning and end of a string */
    public static trim(str: string): string {
        return str.trim()
    }

    /** set request params to url using {@link URL} object */
    public static setRequestParams(url: string, params?: RequestParams): string {
        if (!params) {
            return url
        }
        let urlObj = new URL(url)
        for (const param in params) {
            urlObj.searchParams.set(param, params[param].toString())
        }
        return urlObj.toString()
    }

    /** set request headers to XHR based on settings */
    public static setRequestHeaders(xhr: XMLHttpRequest, rc: RequestConfig, gc: GlobalConfig) {
        const set = (headers?: Headers) => {
            if (!headers) {
                return
            }
            for (const header in headers) {
                xhr.setRequestHeader(header, headers[header].toString())
            }
        }
        set(gc.headers)
        set(rc.headers)
    }

    /** check content type in local and global config. If content type not in local and global, set header in local config */
    public static setContentTypeIfUnset(value: string | number, gc: GlobalConfig, rc: RequestConfig) {
        const header = 'Content-Type'
        if (gc.headers && header in gc.headers) {
            return
        }
        if (rc.headers && header in rc.headers) {
            return
        }
        if (!rc.headers) {
            rc.headers = {}
        }
        rc.headers[header] = value
    }

    /** if rawValue string - check is valid json, trim and return. Otherwise - stringify and return. If error while validation or stringify - throws error */
    public static stringifySafely(rawValue: any): any {
        const getJSON = () => {
            try {
                rawValue = JSON.stringify(rawValue)
                return rawValue
            } catch (err) {
                throw err
            }
        }
        // try to make json string if rawValue not a string
        if (!Validator.isString(rawValue)) {
            return getJSON()
        }
        // otherwise, maybe rawValue a JSON string?
        try {
            // check is json
            JSON.parse(rawValue)
            // remove spaces
            return this.trim(rawValue)
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'SyntaxError') {
                throw err
            }
        }
        // ok, try make json anyway
        getJSON()
    }
}