import WebSocket from "isomorphic-ws";
import ReconnectingWebSocket from "reconnecting-websocket";
import { v4 as uuidv4 } from "uuid";

const apiUrl = "ws://localhost:8443";

const heartbeatInterval = 8000;
const connectionTimeout = 15000;


export type ListenerHandler<Data = unknown> = (
    data: Data,
) => void;
export type Listener<Data = unknown> = {
    op: string;
    handler: ListenerHandler<Data>;
};

export type Connection = {
    socket: ReconnectingWebSocket,
    close: () => void;
    addListener: <Data = unknown>(
        op: string,
        handler: ListenerHandler<Data>
    ) => () => void;
    send: (op: string, data: unknown, ref: string) => void;
    fetch: (
        op: string,
        data: unknown,
        doneOp?: string
    ) => Promise<unknown>;

};

export const connect = (
    {
        url = apiUrl,
        auth = undefined,
        onAuth = (data: unknown) => { },
    }: {
        url?: string;
        auth?: { username: string, token: string };
        onAuth?: (data: unknown) => void;
    }
): Promise<Connection> => new Promise((resolve, reject) => {
    const socket = new ReconnectingWebSocket(url ? url : apiUrl, [], {
        connectionTimeout,
        WebSocket,
    });


    const listeners: Listener[] = [];

    socket.addEventListener("close", (error) => {
        // I want this here
        // eslint-disable-next-line no-console
        console.log(error);
        if (error.code === 4001) {
            socket.close();
        } else if (error.code === 4003) {
            socket.close();
        } else if (error.code === 4004) {
            socket.close();
        }

    });

    const apiSend = (op: string, data: unknown, ref: string) => {
        const wsdata = JSON.stringify({
            op,
            data,
            ref
        });

        socket.send(wsdata);
    };

    const connection: Connection = {
        socket,
        close: () => socket.close(),
        addListener: (op, handler) => {
            const listener = { op, handler } as Listener<unknown>;

            listeners.push(listener);

            return () => listeners.splice(listeners.indexOf(listener), 1);
        },
        send: apiSend,
        fetch: (op: string, data: unknown) =>
            new Promise((resolveFetch, rejectFetch) => {
                const ref = uuidv4();

                connection.addListener(`${op}:reply`, (data: any) => {
                    if (data.ref !== ref) return;
                    resolveFetch(data.data);
                });

                apiSend(op, data, ref);
            }),
    };

    socket.addEventListener('message', (e) => {
        const message = JSON.parse(e.data);
        listeners
            .filter(({ op }) => op === message.op)
            .forEach((it) =>
                it.handler(message)
            );
    })

    socket.addEventListener('open', () => {
        const interval = setInterval(() => {
            if (socket.readyState === socket.CLOSED) {
                clearInterval(interval);
            } else {
                socket.send(JSON.stringify({ op: 'ping' }));
            }
        }, heartbeatInterval);
        if (auth) {
            connection.fetch('user:auth', auth, 'user:auth:reply').then(onAuth)
        }
    })

    resolve(connection);
});

export default connect;