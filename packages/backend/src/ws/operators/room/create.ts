import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Ping } from "../../operatorMiddleware/ping";
import { Schema } from "../../operatorMiddleware/schema";
import createSchema from '../../schemas/room/create.json';
import { Privacy } from "../../types";

const operator = new OperatorExecutor({
    name: 'room:create'
})

operator.use(Ping());
operator.use(Schema(createSchema))
operator.use(CheckAuth())

operator.setExecutor(async (server, client, payload) => {
    if (!payload.data.name) return client.ws.send(JSON.stringify({
        code: 4000,
        error: 'Room Name Is Mandatory'
    }));

    const roomPrivacy = payload.data.private ? Privacy.PRIVATE : Privacy.PUBLIC;
    const room = await server.rooms.createRoom(client, payload.data.name, roomPrivacy);

    if (!room) return client.ws.send(JSON.stringify({
        code: 1013,
        error: 'An error occured'
    }));

    return client.ws.send(JSON.stringify({
        op: `${operator.name}:reply`,
        data: {
            success: true,
            id: room.id
        }
    }))
})

export default operator;

