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
    const roomPrivacy = payload.data.private ? Privacy.PRIVATE : Privacy.PUBLIC;
    const room = await server.rooms.createRoom(client, roomPrivacy);

    if (!room) return operator.reply(client, payload, {
        success: false,
        code: 1013,
        error: 'An error occured'
    })

    return operator.reply(client, payload, {
        success: true,
        room: { id: room.id, privacy: room.privacy }
    })
})

export default operator;

