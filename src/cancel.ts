import { Cancelable } from "./types";

/** you can cancel request by passing CancelToken instance in request config */
export default class CancelToken implements Cancelable {

    /** cancel request */
    // @ts-ignore
    public cancel(message?: string) {
        console.warn('[duck]: you called empty CancelToken. Pass CancelToken instance in request config')
    }

}