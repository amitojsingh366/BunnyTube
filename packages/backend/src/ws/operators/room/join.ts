import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Ping } from "../../operatorMiddleware/ping";
import { Schema } from "../../operatorMiddleware/schema";
import joinSchema from '../../schemas/room/join.json';

const operator = new OperatorExecutor({
    name: 'room:join'
})

operator.use(Ping());
operator.use(Schema(joinSchema))
operator.use(CheckAuth())

operator.setExecutor(async (server, client, payload) => {
    if (!payload.data.id) return operator.reply(client, payload, {
        success: false,
        code: 4000,
        error: 'Room ID Is Mandatory'
    })


    const room = server.rooms.getRoom(payload.data.id);

    if (!room) return operator.reply(client, payload, {
        success: false,
        code: 4004,
        error: 'Room Does Not Exist'
    })

    const user = server.users.getUserByWsId(client.id);
    if (!user) return operator.reply(client, payload, {
        success: false,
        code: 4001,
        error: 'Unauthorized'
    })

    await room.join(user)

    return operator.reply(client, payload, {
        success: true,
        room: { id: room.id, privacy: room.privacy }
    })
})

export default operator;

