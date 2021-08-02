import { MiddlewareMethod } from "../classes/OperatorExecutor"

export const Ping = () => {
    const mid: MiddlewareMethod = (server, client, payload, next) => {
        console.log(payload)
        const wsClient = server.clients.get(client.id);
        if (!wsClient) return;

        wsClient.timeout.lastPing = Date.now();

        server.clients.set(wsClient.id, wsClient);
        next()
    }
    return mid;
}
