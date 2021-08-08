import OperatorExecutor from "../../classes/OperatorExecutor";
import { CheckAuth } from "../../operatorMiddleware/checkauth";
import { Ping } from "../../operatorMiddleware/ping";
import { RateLimit } from "../../operatorMiddleware/ratelimit";
import { Schema } from "../../operatorMiddleware/schema";
import sendStatusSchema from '../../schemas/playback/send_status.json';
import { PlaybackStatus } from "../../types";

const operator = new OperatorExecutor({
    name: 'playback:send_status'
})

operator.use(Ping());
operator.use(Schema(sendStatusSchema))
operator.use(CheckAuth())
operator.use(RateLimit(1000))

operator.setExecutor(async (server, client, payload) => {
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

    const success = await user.room.sendPlaybackStatus(user.id, payload.data as PlaybackStatus);

    return operator.reply(client, payload, {
        success
    })
})

export default operator;

