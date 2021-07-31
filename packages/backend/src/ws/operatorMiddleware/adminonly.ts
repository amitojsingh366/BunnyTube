import { MiddlewareMethod } from "../classes/OperatorExecutor"
export const AdminOnly = () => {
    const mid: MiddlewareMethod = (server, client, payload, next) => {
        const adminUsername = process.env.APP_ADMIN || "";

        next()
    }
    return mid;
}
