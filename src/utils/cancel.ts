import { DuckBasic } from "../types";
import Log from "./logger";

export default class CancelToken implements DuckBasic.Cancelable {

    // @ts-ignore
    public cancel(message?: string): void {
        Log("warn")("You called empty CancelToken. Pass CancelToken instance in request config")
    }

}