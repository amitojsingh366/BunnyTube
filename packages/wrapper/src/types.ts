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

export interface RoomCreateResponse {
    success: true,
    room: { id: string, privacy: 'PUBLIC' | 'PRIVATE' }
}

export interface RoomJoinResponse {
    success: true,
    room: {
        id: string,
        privacy: 'PUBLIC' | 'PRIVATE',
        creator: RoomUser,
        users: RoomUser[]
    },
    roomUser: RoomUser
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

export interface PlaybackStatusData {
    op: string,
    data: PlaybackStatus
}

export interface PlaybackStatus {
    currentTime: number,
    paused: boolean,
    source?: 'YOUTUBE' | 'CUSTOM',
    videoUrl?: string,
    isPlaying: boolean
}

export interface UserUpdateData {
    op: string,
    data: RoomUser
}


export enum RoomUserRole {
    ADMINISTRATOR = 'ADMINISTRATOR',
    MODERATOR = 'MODERATOR',
    USER = 'USER'
}
