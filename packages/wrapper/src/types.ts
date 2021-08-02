export type Token = string;

export interface RoomUser {
    id: string,
    username: string,
    roomId: string,
    role: string,
}

export interface UserAuthAndCreateResponse {
    success: boolean,
    token: Token
}

export interface UserBanResponse {
    success: boolean,
    id: string
}

export interface RoomCreateAndJoinResponse {
    success: boolean,
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


