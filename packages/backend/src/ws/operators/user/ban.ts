import OperatorExecutor from "../../classes/OperatorExecutor";
import { AdminOnly } from "../../operatorMiddleware/adminonly";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Schema } from "../../operatorMiddleware/schema";
import banSchema from '../../schemas/user/ban.json';

const operator = new OperatorExecutor({
    name: 'user:ban'
})

operator.use(Schema(banSchema))
operator.use(CheckAuth())
operator.use(AdminOnly())

operator.setExecutor(async (server, client, payload) => {
    return client.ws.send(JSON.stringify({
        op: `${operator.name}:reply`,
        data: {
            success: true
        }
    }))
})

export default operator;

