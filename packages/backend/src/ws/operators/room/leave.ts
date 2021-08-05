import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Ping } from "../../operatorMiddleware/ping";
import { Schema } from "../../operatorMiddleware/schema";
import leaveSchema from '../../schemas/room/leave.json';

const operator = new OperatorExecutor({
    name: 'room:leave'
})

operator.use(Ping());
operator.use(Schema(leaveSchema))
operator.use(CheckAuth())

operator.setExecutor(async (server, client, payload) => {
    const user = server.users.getUserByWsId(client.id);
    if (!user) return operator.reply(client, payload, {
        success: false,
        code: 4001,
        error: 'Unauthorized'
    })

    if (user.room) await user.room.leave(user.id);

    return operator.reply(client, payload, {
        success: true,
    })
})

export default operator;

