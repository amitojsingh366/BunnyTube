import { Connection } from "./connection";
import { ChatMessageData, ErrorResponse, RoomCreateAndJoinResponse, RoomUserJoinAndLeaveData, RoomUserKickedData, Token, UserAuthAndCreateResponse, UserBanResponse } from "./types";

type Handler<Data> = (data: Data) => void;

export type Wrapper = ReturnType<typeof wrap>;

export const wrap = (connection: Connection) => ({
    connection,
    query: {
        user: {
            auth: (username: string, password?: string, token?: string): Promise<UserAuthAndCreateResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('user:auth', { username, password, token }).then((f) => {
                    resolve((f as UserAuthAndCreateResponse | ErrorResponse))
                })
            })
        },
        ping: () => new Promise((resolve, reject) => {
            connection.fetch('ping', {})
        })
    },

    mutation: {
        user: {
            create: (username: string, name: string, password: string, email?: string): Promise<UserAuthAndCreateResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('user:create', { username, name, password, email }).then((f) => {
                    resolve((f as UserAuthAndCreateResponse | ErrorResponse))
                })
            }),
            ban: (username: string, reason?: string): Promise<UserBanResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('user:ban', { username, reason }).then((f) => {
                    resolve((f as UserBanResponse | ErrorResponse))
                })
            })
        },
        room: {
            create: (name: string, isPrivate?: string): Promise<RoomCreateAndJoinResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('room:create', { name, private: isPrivate }).then((f) => {
                    resolve((f as RoomCreateAndJoinResponse | ErrorResponse))
                })
            }),
            join: (id: string): Promise<RoomCreateAndJoinResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('room:join', { id }).then((f) => {
                    resolve((f as RoomCreateAndJoinResponse | ErrorResponse))
                })
            }),
            leave: () => new Promise((resolve, reject) => {
                connection.fetch('room:leave', {})
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
        },
        user: {
            userAuth: (handler: Handler<UserAuthAndCreateResponse>) =>
                connection.addListener("user:auth:reply", handler),
        }
    }

})
