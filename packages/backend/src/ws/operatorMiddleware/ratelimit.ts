import { MiddlewareMethod } from "../classes/OperatorExecutor"

export const RateLimit = (ms: number) => {
    const ratelimits = new Set()
    const mid: MiddlewareMethod = (server, client, payload, next) => {
        if (ratelimits.has(client.id)) return client.ws.send(JSON.stringify({
            op: `${payload.op}:reply`,
            data: {
                success: false,
                code: 4029,
                error: 'Rate Limited'
            },
            ref: payload.ref
        }));

        ratelimits.add(client.id)
        setTimeout(() => {
            ratelimits.delete(client.id)
        }, ms);
        next()
    }
    return mid;
}
