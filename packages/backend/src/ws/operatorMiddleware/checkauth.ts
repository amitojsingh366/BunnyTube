import { MiddlewareMethod } from "../classes/OperatorExecutor"

export const CheckAuth = () => {
    const mid: MiddlewareMethod = (server, client, payload, next) => {

        server.database.authedUsers.findUnique({ where: { wsId: client.id } }).then((user) => {
            if (!user) return client.ws.send(JSON.stringify({
                code: 4001,
                error: 'Unauthorized'
            }))
        })

        next()
    }
    return mid;
}
