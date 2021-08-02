import * as connectionection from "./connection";
import { ChatMessageData, RoomCreateAndJoinResponse, RoomUserJoinAndLeaveData, RoomUserKickedData, UserAuthAndCreateResponse, UserBanResponse } from "./types";

type Handler<Data> = (data: Data) => void;


export type Wrapper = ReturnType<typeof wrap>;

const wrap = (connection: connectionection.Connection) => ({
    connection,
    query: {
        user: {
            auth: (username: string, password?: string, token?: string) => new Promise((resolve, reject) => {
                connection.fetch('user:auth', { username, password, token }).then((f) => {
                    resolve((f as UserAuthAndCreateResponse).token)
                })
            })
        },
        ping: () => new Promise((resolve, reject) => {
            connection.fetch('ping', {})
        })
    },

    mutation: {
        user: {
            create: (username: string, name: string, password: string, email?: string) => new Promise((resolve, reject) => {
                connection.fetch('user:create', { username, name, password, email }).then((f) => {
                    resolve((f as UserAuthAndCreateResponse).token)
                })
            }),
            ban: (username: string, reason?: string) => new Promise((resolve, reject) => {
                connection.fetch('user:ban', { username, reason }).then((f) => {
                    resolve((f as UserBanResponse).id)
                })
            })
        },
        room: {
            create: (name: string, isPrivate?: string) => new Promise((resolve, reject) => {
                connection.fetch('room:create', { name, private: isPrivate }).then((f) => {
                    resolve((f as RoomCreateAndJoinResponse).id)
                })
            }),
            join: (id: string) => new Promise((resolve, reject) => {
                connection.fetch('room:join', { id }).then((f) => {
                    resolve((f as RoomCreateAndJoinResponse).id)
                })
            }),
            leave: () => new Promise((resolve, reject) => {
                connection.fetch('room:leave', {});
            })
        },
        chat: {
            sendMessage: (content: string) => new Promise((resolve, reject) => {
                connection.fetch('chat:send_message', { content })
            }),
        }
    },
    subscribe: {
        chat: {
            message: (handler: Handler<ChatMessageData>) =>
                connection.addListener("chat:message", handler),
        },
        room: {
            userJoin: (handler: Handler<RoomUserJoinAndLeaveData>) =>
                connection.addListener("room:user_joined", handler),
            userLeave: (handler: Handler<RoomUserJoinAndLeaveData>) =>
                connection.addListener("room:user_left", handler),
            userKicked: (handler: Handler<RoomUserKickedData>) =>
                connection.addListener("room:user_kicked", handler),
        }
    }

})
export default wrap;