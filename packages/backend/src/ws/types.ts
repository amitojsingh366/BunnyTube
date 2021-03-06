export interface MessagePayload {
    op: string;
    data: any;
    ref?: string
}

export enum UserRole {
    ADMINISTRATOR = 'ADMINISTRATOR',
    USER = 'USER'
}

export enum RoomUserRole {
    ADMINISTRATOR = 'ADMINISTRATOR',
    MODERATOR = 'MODERATOR',
    USER = 'USER'
}

export enum Privacy {
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC',
}

export interface UserFile {
    id: string;
    url: string;
    size: bigint;
    userId: string;
    privacy: Privacy;
}

export interface UserToken {
    id: number;
    userId: string;
    jti: string;
    revoked: boolean;
    revokedAt: Date;
    issuedAt: Date;
}

export interface RoomUserData {
    id: string,
    username: string,
    roomId: string,
    role: string,
    wsId: string
}

export interface PlaybackStatus {
    currentTime: number,
    paused: boolean,
    source?: 'YOUTUBE' | 'CUSTOM',
    videoUrl?: string,
    isPlaying: boolean
}
