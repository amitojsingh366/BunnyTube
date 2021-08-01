import WebSocket from 'ws';
import { RoomUser } from './classes/RoomUser';

export interface WebsocketServerEvents {
    'opened': (client: WebSocket) => void,
    'closed': (client: WebSocket) => void,
    'error': (client: WebSocket, error: Error) => void,
}

export interface RoomEvents {
    'joined': (user: RoomUser) => void,
    'left': (user: RoomUser) => void,
    'kicked': (user: RoomUser) => void,
}
