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


import type { DuckRequest } from "../types";
import Validator from "./validator";

/** useful things */
export default class Service {

    /**
     * set base URL
     * @param url path like: /user (or full url, but without base param)
     * @param base url like: https://example.com/api
     * @returns url like: https://example.com/api/user
     */
    public static setBaseURL(url?: string, base?: string): string {
        let finalURL: URL
        if (base) {
            finalURL = new URL(base)
            if (url) {
                finalURL.pathname += `/${url}`
            }
            finalURL.pathname = this.replaceDoubleSlashes(finalURL.pathname)
        } else if (url) {
            finalURL = new URL(url)
        } else {
            throw Error('empty URL')
        }
        // recheck
        try {
            let urlString = finalURL.toString()
            finalURL = new URL(urlString)
        } catch (err) {
            throw err
        }
        return finalURL.toString()
    }

    /**
     * replace double slashes
     * @param str string like: //hello//world////
     * @returns string like: /hello/world/
     */
    public static replaceDoubleSlashes(str: string): string {
        const isString = Validator.isString(str)
        if (!isString) {
            const hasToString = Validator.isHasToStringMethod(str)
            if (!hasToString) {
                return str
            }
            str = str.toString()
        }
        return str.replace(/(?<!:)\/\/+/g, "/")
    }

    /** trim excess whitespace off the beginning and end of a string */
    public static trim(str: string): string {
        const isNotString = !Validator.isString(str)
        if (isNotString) {
            const hasToString = Validator.isHasToStringMethod(str)
            if (!hasToString) {
                return str
            }
            str = str.toString()
        }
        return str.trim()
    }

    /** set request params to url using {@link URL} object */
    public static setRequestParams(url: string, params?: DuckRequest.Params): string {
        if (!params) {
            return url
        }
        const urlObj = new URL(url)
        for (const prop in params) {
            const paramValue = params[prop]
            const hasToString = Validator.isHasToStringMethod(paramValue)
            if (!hasToString) {
                continue
            }
            const paramValueString = paramValue.toString()
            urlObj.searchParams.set(prop, paramValueString)
        }
        return urlObj.toString()
    }

    /** set request headers to XHR based on settings */
    public static setRequestHeaders(setter: DuckRequest.HeaderSetter, ...headers: DuckRequest.Headers[]) {
        if (!headers) {
            return
        }
        const set = (headers?: DuckRequest.Headers) => {
            if (!headers) {
                return
            }
            for (const prop in headers) {
                const headerValue = headers[prop]
                const hasToString = Validator.isHasToStringMethod(headerValue)
                if (!hasToString) {
                    continue
                }
                const headerValueString = headerValue.toString()
                setter.setRequestHeader(prop, headerValueString)
            }
        }
        for (const head of headers) {
            set(head)
        }
    }

    /** if not exists, set Content-Type header in headers */
    public static setContentTypeIfUnset(value: string | number, headers: DuckRequest.Headers) {
        const isHeaderExists = (name: string): boolean => {
            return headers && name in headers
        }
        const basicCase = "Content-Type"
        let caseExists = isHeaderExists(basicCase)
        if (caseExists) {
            return
        }
        // check cases
        const toBasicCase = (original: string) => {
            const oldValue = headers[original]
            delete headers[original]
            headers[basicCase] = oldValue
        }
        const upperCase = basicCase.toUpperCase()
        caseExists = isHeaderExists(upperCase)
        if (caseExists) {
            toBasicCase(upperCase)
            return
        }
        const lowerCase = basicCase.toLowerCase()
        caseExists = isHeaderExists(lowerCase)
        if (caseExists) {
            toBasicCase(lowerCase)
            return
        }
        headers[basicCase] = value
    }

    /** if rawValue string - check is valid json, trim and return. Otherwise - stringify and return. 
     * If error while validation or stringify - throws error */
    public static stringifySafely(rawValue: any): any {
        const getJSON = () => {
            try {
                rawValue = JSON.stringify(rawValue)
                return rawValue
            } catch (err) {
                throw err
            }
        }
        const notString = !Validator.isString(rawValue)
        if (notString) {
            // not a string? try make JSON string
            return getJSON()
        }
        // ok, maybe rawValue a JSON string?
        try {
            // check & trim if all good
            JSON.parse(rawValue)
            return this.trim(rawValue)
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== "SyntaxError") {
                throw err
            }
        }
        // ok, try make json anyway
        return getJSON()
    }
}