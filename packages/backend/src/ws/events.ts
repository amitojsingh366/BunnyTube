import WebSocket from 'ws';

export interface WebsocketServerEvents {
    'opened': (client: WebSocket) => void,
    'closed': (client: WebSocket) => void,
    'error': (client: WebSocket, error: Error) => void,
}
