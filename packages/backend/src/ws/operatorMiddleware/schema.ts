import { MiddlewareMethod } from "../classes/OperatorExecutor"
export const Schema = (data) => {
    const mid: MiddlewareMethod = (server, client, payload, next) => {
        if (!check(data, payload)) return client.ws.send(JSON.stringify({
            op: `${payload.op}:reply`,
            data: {
                success: false,
                code: 400,
                error: 'Invalid Schema'
            },
            ref: payload.ref
        }))
        next()
    }
    return mid;
}


function check(data, payload) {
    for (const key in Object.keys(data)) {
        const oKey = Object.keys(data)[key]
        const element = data[oKey];

        if (oKey !== "type" && oKey !== "properties" && !element.isOptional) {
            if (!payload[oKey]) return false;
            if (typeof payload[oKey] !== element.type) return false;
            if (element['properties']) return check(element['properties'], payload[oKey]);
        }
    }
    return true;
}
