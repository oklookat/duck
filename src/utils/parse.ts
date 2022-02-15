// some from: https://github.com/axios/axios/blob/76f09afc03fbcf392d31ce88448246bcd4f91f8c/dist/axios.js#L1267

// MIT license stuff (axios):
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


import Service from "./service";
import type { Config, DuckRequest } from "../types";
import Validator from "./validator";

/** parse things */
export default class Parse {

    /** check body and set headers if needed */
    public static requestBody(body: any, rc: DuckRequest.Config, gc: Config): any {
        // binary?
        const isBin =
            Validator.isFormData(body) ||
            Validator.isArrayBuffer(body) ||
            Validator.isBuffer(body) ||
            Validator.isStream(body) ||
            Validator.isFile(body) ||
            Validator.isBlob(body)
        if (isBin) {
            return body
        }
        if (Validator.isArrayBufferView(body)) {
            return body.buffer;
        }
        /** set content-type header to two configs */
        const cTypeSetter = (value: string) => {
            if (!gc.headers) {
                gc.headers = {}
            }
            if (!rc.headers) {
                rc.headers = {}
            }
            Service.setContentTypeIfUnset(value, gc.headers)
            Service.setContentTypeIfUnset(value, rc.headers)
        }
        // request params?
        if (Validator.isURLSearchParams(body)) {
            cTypeSetter("application/x-www-form-urlencoded; charset=utf-8")
            return body
        }
        // can be converted to JSON?
        if (Validator.isObject(body)) {
            cTypeSetter("application/json")
            body = Service.stringifySafely(body)
            return body
        }
        return body
    }

    /** parse json after response. Returns body */
    public static responseBody(body: any): any {
        if (!body) {
            return body
        }
        try {
            body = JSON.parse(body);
        } catch (e) {
        }
        return body
    }

}