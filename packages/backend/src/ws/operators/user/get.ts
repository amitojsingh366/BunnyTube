import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Ping } from "../../operatorMiddleware/ping";

const operator = new OperatorExecutor({
    name: 'user:get'
})

operator.use(Ping());
operator.use(CheckAuth())

operator.setExecutor(async (server, client, payload) => {
    const user = server.users.getUserByWsId(client.id)

    if (!user) return operator.reply(client, payload, {
        success: false,
        code: 4001,
        error: 'Unauthorized'
    })

    return operator.reply(client, payload, {
        success: true,
        user: user.data()
    })
})

export default operator;

