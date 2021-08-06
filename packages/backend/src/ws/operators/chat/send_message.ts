import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Ping } from "../../operatorMiddleware/ping";
import { Schema } from "../../operatorMiddleware/schema";
import sendMessageSchema from '../../schemas/chat/send_message.json';

const operator = new OperatorExecutor({
    name: 'chat:send_message'
})

operator.use(Ping());
operator.use(Schema(sendMessageSchema))
operator.use(CheckAuth())

operator.setExecutor(async (server, client, payload) => {
    if (!payload.data.content) return operator.reply(client, payload, {
        success: false,
        code: 4000,
        error: 'Content Is Mandatory'
    })


    const user = server.users.getUserByWsId(client.id);
    if (!user) return operator.reply(client, payload, {
        success: false,
        code: 4001,
        error: 'Unauthorized'
    })


    if (!user.room) return operator.reply(client, payload, {
        success: false,
        code: 4004,
        error: 'Room Does Not Exist'
    })


    const message = await user.room.sendMessage(user.id, payload.data.content);
    if (!message) return operator.reply(client, payload, {
        success: false,
        code: 4006,
        error: 'Unknown Error Occured'
    })

    return operator.reply(client, payload, {
        success: true,
        message: message
    })
})

export default operator;

