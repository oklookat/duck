import { expect, test } from "vitest";
import { DuckRequest } from "../types";
import Service from "../utils/service";

// @vitest-environment jsdom

test("set base URL", () => {
    type mock = {
        base: string
        url: string
        expected: string
    }
    const mocks: mock[] = [
        {
            base: "https://example.com/api/hello",
            url: "/world",
            expected: "https://example.com/api/hello/world"
        },
        {
            base: "http://example.com",
            url: "/api/hello",
            expected: "http://example.com/api/hello"
        }
    ]
    for (const prop in mocks) {
        const theMock = mocks[prop]
        const result = Service.setBaseURL(theMock.url, theMock.base)
        expect(result).equals(theMock.expected)
    }
})


test("replace double slashes", () => {

    const mocks: Record<string, string> = {
        "1234": "1234",
        "123/456/789": "123/456/789",
        "//123/////456/////////789///////": "/123/456/789/"
    }
    for (const prop in mocks) {
        const result = Service.replaceDoubleSlashes(prop)
        const expected = mocks[prop]
        expect(result).equals(expected)
    }

})

test("set request params", () => {

    type mock = {
        url: string
        requestParams: DuckRequest.Params
        expected: string
    }

    const objectWithToStringMethod = {
        toString: () => {
            return "5"
        }
    }

    const mocks: mock[] = [
        {
            url: "https://example.com/api/users",
            requestParams: {
                // @ts-ignore
                "1": null,
                "2": 2,
                // @ts-ignore
                "3": undefined,
                4: "4",
                "5": objectWithToStringMethod
            },
            expected: "https://example.com/api/users?2=2&4=4&5=5"
        }
    ]

    for (const prop in mocks) {
        const theMock = mocks[prop]
        const result = Service.setRequestParams(theMock.url, theMock.requestParams)
        expect(result).equals(theMock.expected)
    }

})

test("set request headers", () => {
    const settedResult: DuckRequest.Headers = {}
    const headerSetter: DuckRequest.HeaderSetter = {
        setRequestHeader: (name, value) => {
            settedResult[name] = value
        }
    }
    const headersMockOne: DuckRequest.Headers = {
        'X-ONE': 'one',
        // @ts-ignore
        'X-NULL': null,
        // @ts-ignore
        'X-UNDEF': undefined,
        'X-TWO': 'two'
    }
    const headersMockTwo: DuckRequest.Headers = {
        'X-THREE': 'three'
    }
    Service.setRequestHeaders(headerSetter, headersMockOne, headersMockTwo)
    const expected: DuckRequest.Headers = {
        'X-ONE': 'one',
        'X-TWO': 'two',
        'X-THREE': 'three'
    }
    expect(settedResult).toEqual(expected)

})

test("set Content-Type if unset", () => {
    // content-type exists
    const headersMock: DuckRequest.Headers = {
        'X-ONE': 'one',
        'CONTENT-TYPE': 'yyy'
    }
    const expected: DuckRequest.Headers = {
        'X-ONE': 'one',
        'Content-Type': 'yyy'
    }
    Service.setContentTypeIfUnset('xxx', headersMock)
    expect(headersMock).toEqual(expected)
    // content-type not exists
    delete headersMock['Content-Type']
    expected['Content-Type'] = 'xxx'
    Service.setContentTypeIfUnset('xxx', headersMock)
    expect(headersMock).toEqual(expected)
})  