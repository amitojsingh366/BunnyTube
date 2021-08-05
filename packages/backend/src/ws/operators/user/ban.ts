import OperatorExecutor from "../../classes/OperatorExecutor";
import { AdminOnly } from "../../operatorMiddleware/adminonly";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Ping } from "../../operatorMiddleware/ping";
import { Schema } from "../../operatorMiddleware/schema";
import banSchema from '../../schemas/user/ban.json';

const operator = new OperatorExecutor({
    name: 'user:ban'
})

operator.use(Ping());
operator.use(Schema(banSchema))
operator.use(CheckAuth())
operator.use(AdminOnly())

operator.setExecutor(async (server, client, payload) => {
    return operator.reply(client, payload, {
        success: true,
        id: ''
    })
})

export default operator;

