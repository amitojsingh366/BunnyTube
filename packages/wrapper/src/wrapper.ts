import { Connection } from "./connection";
import { ChatMessageData, ErrorResponse, GenericSuccessResponse, RoomCreateAndJoinResponse, RoomUserJoinAndLeaveData, RoomUserKickedData, SendMessageResponse, Token, UserAuthAndCreateResponse, UserBanResponse, UserGetResponse } from "./types";

type Handler<Data> = (data: Data) => void;

export type Wrapper = ReturnType<typeof wrap>;

export const wrap = (connection: Connection) => ({
    connection,
    query: {
        user: {
            auth: (username: string, password?: string, token?: string): Promise<UserAuthAndCreateResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('user:auth', { username, password, token }).then((f) => {
                    const resp = (f as UserAuthAndCreateResponse | ErrorResponse);
                    if (resp.success) connection.authed = true;
                    resolve(resp)
                })
            }),
            get: (): Promise<UserGetResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('user:get', {}).then((f) => {
                    resolve((f as UserGetResponse | ErrorResponse))
                })
            }),
        },
        ping: (): Promise<GenericSuccessResponse | ErrorResponse> => new Promise((resolve, reject) => {
            connection.fetch('ping', {}).then((f) => {
                resolve((f as GenericSuccessResponse | ErrorResponse))
            })
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
            create: (isPrivate?: boolean): Promise<RoomCreateAndJoinResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('room:create', { private: isPrivate }).then((f) => {
                    resolve((f as RoomCreateAndJoinResponse | ErrorResponse))
                })
            }),
            join: (id: string): Promise<RoomCreateAndJoinResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('room:join', { id }).then((f) => {
                    resolve((f as RoomCreateAndJoinResponse | ErrorResponse))
                })
            }),
            leave: (): Promise<GenericSuccessResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('room:leave', {}).then((f) => {
                    resolve((f as GenericSuccessResponse | ErrorResponse))
                })
            })
        },
        chat: {
            sendMessage: (content: string): Promise<SendMessageResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('chat:send_message', { content }).then((f) => {
                    resolve((f as SendMessageResponse | ErrorResponse))
                })
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
