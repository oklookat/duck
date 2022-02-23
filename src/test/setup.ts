import { beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { DefaultRequestBody, PathParams, ResponseComposition, ResponseResolver, rest, RestContext, RestRequest } from 'msw'

import { articlesPosts, articlesURL } from './xhr'
import { getParams } from './xhr/get.test'

class Util {

  static highlightTextInConsole(val: string): void {
    const lim = "--------------VVVVVVVV--------------------"
    console.log(lim)
    console.log(val)
    console.log(lim)
  }

}

class TheHandlers {

  static getWithParams() {
    return (req: RestRequest<never, PathParams>, res: ResponseComposition<DefaultRequestBody>, ctx: RestContext) => {
      let result: any = articlesPosts
      const hasNiceParams = req.url.searchParams.toString() === getParams.toString()
      if (hasNiceParams) {
        result = getParams.expected()
      }
      return res(
        ctx.status(200),
        ctx.json(result))
    }
  }

  static post() {
    return (req: RestRequest<never, PathParams>, res: ResponseComposition<DefaultRequestBody>, ctx: RestContext) => {
      let parsed: any
      try {
        // @ts-ignore
        parsed = JSON.parse(req.body)
      } catch (err) {
        parsed = req.body
      }
      return res(
        ctx.status(200),
        ctx.json(parsed))
    }
  }

  static patchThrottled() {
    return (req: RestRequest<never, PathParams>, res: ResponseComposition<DefaultRequestBody>, ctx: RestContext) => {
      return res(
        //ctx.delay(5000),
        ctx.json(articlesPosts)
      )
    }
  }

}

export const restHandlers = [
  rest.get(articlesURL, TheHandlers.getWithParams()),
  rest.post(articlesURL, TheHandlers.post()),
  rest.patch(articlesURL + "/throttled", TheHandlers.patchThrottled())
]

const server = setupServer(...restHandlers)

beforeAll(() => {
  // Establish requests interception layer before all tests.
  server.listen()
})

afterAll(() => {
  // Clean up after all tests are done, preventing this
  // interception layer from affecting irrelevant tests.
  server.close()
})

// reset handlers after each test `important for test isolation`
afterEach(() => {
  server.resetHandlers()
})