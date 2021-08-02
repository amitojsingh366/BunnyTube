import OperatorExecutor from "../../classes/OperatorExecutor";
import { Ping } from "../../operatorMiddleware/ping";

const operator = new OperatorExecutor({
    name: 'ping'
})

operator.use(Ping());

operator.setExecutor(async (server, client, payload) => {
    return client.ws.send(JSON.stringify({
        op: `${operator.name}:reply`
    }))
})

export default operator;

