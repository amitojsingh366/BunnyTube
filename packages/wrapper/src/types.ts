export type Token = string;

export interface RoomUser {
    id: string,
    username: string,
    roomId: string,
    role: string,
}

export interface UserGetResponse {
    success: true,
    user: {
        id: string;
        username: string;
        role: string;
        name: string;
        email?: string;
        wsId: string;
    }
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
    room: { id: string, privacy: 'PUBLIC' | 'PRIVATE' }
}

export interface SendMessageResponse {
    success: true,
    message: ChatMessage
}

export interface GenericSuccessResponse {
    success: true
}

export interface ChatMessage {
    author: RoomUser,
    content: string,
    id: string,
}

export interface ChatMessageData {
    op: string,
    data: ChatMessage
}

export interface RoomUserJoinAndLeaveData {
    op: string,
    data: {
        user: RoomUser
    }
}

export interface RoomUserKickedData {
    op: string,
    data: {
        user: RoomUser,
        reason: string
    }
}

export interface ErrorResponse {
    success: false,
    error: string,
    code: number
}

