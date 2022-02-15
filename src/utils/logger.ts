export default function Log(type: "log" | "warn" | "error") {
    return (message: string) => {
        console[type](`[duck] ${message}`)
    }
}