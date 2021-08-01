import WebSocket from 'ws';
import { RoomUserData } from './types';

export interface WebsocketServerEvents {
    'opened': (client: WebSocket) => void,
    'closed': (client: WebSocket) => void,
    'error': (client: WebSocket, error: Error) => void,
}

export interface RoomEvents {
    'joined': (user: RoomUserData) => void,
    'left': (user: RoomUserData) => void,
    'kicked': (user: RoomUserData) => void,
}
