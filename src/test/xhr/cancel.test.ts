import { describe, expect, it } from "vitest"
import { CancelToken } from "../.."
import { DuckHook } from "../../types"
import { duckd, hooks } from "."

// @vitest-environment jsdom

//// idk how test this, because request delay not working
describe("Cancel Token", () => {
    it("should send request, cancel it, and check is onError-cancel hook executed", async () => {
        // patch hook
        const cancelMessage = "cancelled"
        const oldHook = hooks.onError
        let hookActivated = false
        const newHook = (e: DuckHook.Output.onError) => {
            hookActivated = e.data.type === "cancel" && e.data.message === cancelMessage
        }
        hooks['onError'] = newHook
        // send & cancel
        const token = new CancelToken()
        duckd.PATCH({ url: "/throttled", body: "cancel body", cancelToken: token })
        token.cancel(cancelMessage)
        // recover hook
        hooks['onError'] = oldHook
        expect(hookActivated).toBe(true)
    })
})