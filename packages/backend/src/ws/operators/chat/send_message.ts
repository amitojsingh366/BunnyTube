import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Schema } from "../../operatorMiddleware/schema";
import sendMessageSchema from '../../schemas/chat/send_message.json';

const operator = new OperatorExecutor({
    name: 'chat:send_message'
})

operator.use(Schema(sendMessageSchema))
operator.use(CheckAuth())

operator.setExecutor(async (server, client, payload) => {
    if (!payload.data.content) return client.ws.send(JSON.stringify({
        code: 4000,
        error: 'Content Is Mandatory'
    }));


    const user = server.users.getUserByWsId(client.id);
    if (!user) return client.ws.send(JSON.stringify({
        code: 4001,
        error: 'Unauthorized'
    }))

    if (!user.room) return client.ws.send(JSON.stringify({
        code: 4004,
        error: 'Room Does Not Exist'
    }));

    await user.room.sendMessage(user.id, payload.data.content);

    return client.ws.send(JSON.stringify({
        op: `${operator.name}:reply`,
        data: {
            success: true
        }
    }))
})

export default operator;

