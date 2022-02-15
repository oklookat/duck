import { beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

import { articlesPosts, articlesURL } from './xhr/index.test'
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
    return rest.get(articlesURL, (req, res, ctx) => {
      let result: any = articlesPosts
      const hasNiceParams = req.url.searchParams.toString() === getParams.toString()
      if (hasNiceParams) {
        result = getParams.expected()
      }
      return res(
        ctx.status(200),
        ctx.json(result))
    })
  }

  static post() {
    return rest.post(articlesURL, (req, res, ctx) => {
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
    })
  }

  static patchThrottled() {
    return rest.patch(articlesURL + "/throttled", async (req, res, ctx) => {
      return res(
        ctx.delay(5000),
        ctx.json(articlesPosts)
      )
    })
  }

}

export const restHandlers = [
  TheHandlers.getWithParams(),
  TheHandlers.post(),
  TheHandlers.patchThrottled(),
]

const server = setupServer(...restHandlers)

// start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// close server after all tests
afterAll(() => server.close())

// reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())