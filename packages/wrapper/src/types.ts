export type Token = string;

export interface RoomUser {
    id: string,
    username: string,
    roomId: string,
    role: string,
}

export interface UserAuthAndCreateResponse {
    success: true,
    token: Token
}

export interface UserBanResponse {
    success: true,
    id: string
}

export interface RoomCreateAndJoinResponse {
    success: true,
    id: string
}

export interface ChatMessageData {
    author: RoomUser,
    content: string
}

export interface RoomUserJoinAndLeaveData {
    user: RoomUser
}

export interface RoomUserKickedData {
    user: RoomUser,
    reason: string
}

export interface ErrorResponse {
    success: false,
    error: string,
    code: number
}

