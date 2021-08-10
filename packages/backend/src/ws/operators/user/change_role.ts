import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Ping } from "../../operatorMiddleware/ping";
import { Schema } from "../../operatorMiddleware/schema";
import changeRoleSchema from "../../schemas/user/change_role.json";
import { RoomUserRole } from "../../types";

const operator = new OperatorExecutor({
    name: 'user:change_role'
})

operator.use(Ping());
operator.use(Schema(changeRoleSchema))
operator.use(CheckAuth())

operator.setExecutor(async (server, client, payload) => {
    if (!payload.data.userId) return operator.reply(client, payload, {
        success: false,
        code: 4000,
        error: 'User id is mandatory'
    });

    if (!payload.data.room) return operator.reply(client, payload, {
        success: false,
        code: 4000,
        error: 'Only room roles can be changed for now'
    });

    if (!payload.data.newRole) return operator.reply(client, payload, {
        success: false,
        code: 4000,
        error: 'New role needs to be provided'
    });

    const user = server.users.getUserByWsId(client.id)
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

    const adminRoomUser = user.room.getUser(user.id);
    if (!adminRoomUser) return operator.reply(client, payload, {
        success: false,
        code: 4004,
        error: 'User not in a room'
    })

    if (adminRoomUser.role !== RoomUserRole.ADMINISTRATOR) return operator.reply(client, payload, {
        success: false,
        code: 4001,
        error: 'Unauthorized'
    })

    const roomUser = user.room.getUser(payload.data.userId);
    if (!roomUser) return operator.reply(client, payload, {
        success: false,
        code: 4004,
        error: 'User not in a room'
    })

    await user.room.changeUserRole(user.id, roomUser.id, payload.data.newRole);

    return operator.reply(client, payload, {
        success: true
    })
})

export default operator;

