import { describe, expect, it } from "vitest"
import { duckd } from "."

// @vitest-environment jsdom


describe("POST Requests", () => {
    it("should send POST with body and get 'hello' response", async () => {
        let body: object | string = { "hello": 1 }
        let result = await duckd.POST({ url: "", body: body })
        expect(result.body).toEqual(body)
        body = "hello"
        result = await duckd.POST({ url: "", body: body })
        expect(result.body).equal(body)
    })
})