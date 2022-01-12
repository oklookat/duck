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


import type { HookName, Hooks } from "../types"

/** validate things */
export default class Validator {

    public toString = Object.prototype.toString

    // simple checks

    public static isUndefined(val: any): boolean {
        return typeof val === 'undefined'
    }

    public static isObject(val: any): boolean {
        return val !== null && typeof val === 'object'
    }

    public static isFunction(val: any): boolean {
        return val instanceof Function
    }

    public static isArray(val: any): boolean {
        return this.toString.call(val) === '[object Array]'
    }

    public static isString(val: any): boolean {
        return typeof val === 'string'
    }

    // not simple checks

    public static isFormData(val: any): boolean {
        return val instanceof FormData
    }

    public static isArrayBuffer(val: any): boolean {
        return toString.call(val) === '[object ArrayBuffer]'
    }

    public static isBuffer(val: any): boolean {
        return val !== null && !this.isUndefined(val) && val.constructor !== null && !this.isUndefined(val.constructor)
            && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val)
    }

    public static isStream(val: any): boolean {
        return this.isObject(val) && this.isFunction(val.pipe)
    }

    public static isFile(val: any): boolean {
        return toString.call(val) === '[object File]'
    }

    public static isBlob(val: any): boolean {
        return val instanceof Blob
    }

    public static isURLSearchParams(val: any): boolean {
        return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams
    }

    public static isArrayBufferView(val: any): boolean {
        let result: any
        if (ArrayBuffer.isView) {
            result = ArrayBuffer.isView(val)
        } else {
            result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer)
        }
        return result
    }

    // duck checks

    /** check is hookName in hooks */
    public static isHookAvailable(hookName: HookName, hooks?: Hooks): boolean {
        if (!hooks) {
            return false
        }
        return hookName in hooks && this.isFunction(hooks[hookName])
    }

    /** check is code in status code. Like: check is 4xx HTTP error. */
    public static isCodeXX(statusCode: number, code: number): boolean {
        // return statusCode.toString()[0] === code.toString()[0]
        return (statusCode - code) >= 0 && (statusCode - code) <= 99
    }

    /** is request in process */
    public static isRequestActive(xhr: XMLHttpRequest): boolean {
        const readyState = xhr.readyState
        const isRunning = readyState !== 0 && readyState !== 4
        return isRunning
    }
}
