import { describe, expect, it } from "vitest"
import { articlesPosts, duckd } from "."

// @vitest-environment jsdom

class GETParams {
    toServer() {
        return {
            '1': 'hello',
            '2': null,
            '3': 3
        }
    }
    toString() {
        return "1=hello&3=3"
    }
    filtered() {
        return {
            '1': 'hello',
            '3': 3
        }
    }
    expected() {
        return {
            ...this.filtered(),
            articlesPosts
        }
    }
}
export const getParams = new GETParams()


describe("GET Requests", () => {
    it('should send GET with params to server, and get body object with posts + filtered params', async () => {
        const result = await duckd.GET({ url: "", params: getParams.toServer() })
        expect(result.body).toMatchObject(getParams.expected())
        expect(result.statusCode).equals(200)
    })
})