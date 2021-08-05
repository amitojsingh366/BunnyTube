import { MiddlewareMethod } from "../classes/OperatorExecutor"

export const CheckAuth = () => {
    const mid: MiddlewareMethod = (server, client, payload, next) => {

        const user = server.users.getUserByWsId(client.id);
        if (!user) return client.ws.send(JSON.stringify({
            op: `${payload.op}:reply`,
            data: {
                success: false,
                code: 4001,
                error: 'Unauthorized'
            },
            ref: payload.ref
        }))

        next()
    }
    return mid;
}
