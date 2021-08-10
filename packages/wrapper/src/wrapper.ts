import { Connection } from "./connection";
import {
    ChatMessageData, ErrorResponse, GenericSuccessResponse,
    PlaybackStatus, PlaybackStatusData, RoomCreateResponse, RoomJoinResponse,
    RoomUserJoinAndLeaveData, RoomUserKickedData, RoomUserRole, SendMessageResponse,
    UserAuthAndCreateResponse, UserBanResponse, UserGetResponse, UserUpdateData
} from "./types";

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
            }),
            changeRole: (userId: string, newRole: RoomUserRole, room?: boolean): Promise<GenericSuccessResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('user:change_role', { userId, newRole, room }).then((f) => {
                    resolve((f as GenericSuccessResponse | ErrorResponse))
                })
            }),
        },
        room: {
            create: (isPrivate?: boolean): Promise<RoomCreateResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('room:create', { private: isPrivate }).then((f) => {
                    resolve((f as RoomCreateResponse | ErrorResponse))
                })
            }),
            join: (id: string): Promise<RoomJoinResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('room:join', { id }).then((f) => {
                    resolve((f as RoomJoinResponse | ErrorResponse))
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
        },
        playback: {
            sendStatus: (status: PlaybackStatus): Promise<GenericSuccessResponse | ErrorResponse> => new Promise((resolve, reject) => {
                connection.fetch('playback:send_status', status).then((f) => {
                    resolve((f as GenericSuccessResponse | ErrorResponse))
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
            updated: (handler: Handler<UserUpdateData>) =>
                connection.addListener("user:updated", handler),
        },
        playback: {
            status: (handler: Handler<PlaybackStatusData>) =>
                connection.addListener("playback:status", handler),
        }
    }

})
