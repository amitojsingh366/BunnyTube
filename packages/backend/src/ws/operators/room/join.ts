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
    if (!payload.data.id) return client.ws.send(JSON.stringify({
        code: 4000,
        error: 'Room ID Is Mandatory'
    }));


    const room = server.rooms.getRoom(payload.data.id);

    if (!room) return client.ws.send(JSON.stringify({
        code: 4004,
        error: 'Room Does Not Exist'
    }));

    const user = server.users.getUserByWsId(client.id);
    if (!user) return client.ws.send(JSON.stringify({
        code: 4001,
        error: 'Unauthorized'
    }))

    await room.join(user)

    return client.ws.send(JSON.stringify({
        op: `${operator.name}:reply`,
        data: {
            success: true,
            id: room.id
        }
    }))
})

export default operator;

