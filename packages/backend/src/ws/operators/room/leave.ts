import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Schema } from "../../operatorMiddleware/schema";
import leaveSchema from '../../schemas/room/leave.json';

const operator = new OperatorExecutor({
    name: 'room:leave'
})

operator.use(Schema(leaveSchema))
operator.use(CheckAuth())

operator.setExecutor(async (server, client, payload) => {
    const user = server.users.getUserByWsId(client.id);
    if (!user) return client.ws.send(JSON.stringify({
        code: 4001,
        error: 'Unauthorized'
    }))

    if (user.room) await user.room.leave(user.id);

    return client.ws.send(JSON.stringify({
        op: `${operator.name}:reply`,
        data: {
            success: true,
        }
    }))
})

export default operator;

