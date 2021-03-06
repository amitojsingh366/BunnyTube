import WebSocket from "isomorphic-ws";
import Collection from '@discordjs/collection';
import { v4 as uuidv4 } from 'uuid';
import { Eventra } from '@duxcore/eventra';
import { WebsocketServerEvents } from './events';
import { MessagePayload } from './types';
import OperatorExecutor from './classes/OperatorExecutor';
import { glob } from 'glob';
import { database } from '../prisma';
import { AuthManager } from './managers/AuthManager';
import { RoomManager } from './managers/RoomManager';


export class WebsocketServer extends Eventra<WebsocketServerEvents> {
    public clients: Collection<string, { id: string, ws: WebSocket, timeout: { interval?: NodeJS.Timer, lastPing: number } }> = new Collection();
    public operators: Collection<string, OperatorExecutor> = new Collection();
    public server: WebSocket.Server;
    public users: AuthManager = new AuthManager(this);
    public rooms: RoomManager = new RoomManager(this);
    public WS_TIMEOUT: number = Number(process.env.WS_TIMEOUT || 10000);

    constructor(port: number) {
        super();
        this.server = new WebSocket.Server({ port });

        this.registerOperators();
        this.start();
    }

    registerOperators() {
        const ext = (__filename.endsWith("ts") ? "ts" : "js");
        glob(`${__dirname}/operators/**/**/*.${ext}`, async (err, files) => {
            files.map(f => {
                const imported = require(f);
                if (!(imported.default instanceof OperatorExecutor)) return;

                const op: OperatorExecutor = imported.default;
                this.operators.set(op.name, op);
            });
        });
    }

    addClient(id: string, ws: WebSocket) {
        this.clients.set(id, { id, ws, timeout: { lastPing: Date.now() } });
        this.addClientTimeout(id, this.WS_TIMEOUT)

        this.emit('opened', ws);

        ws.on('close', () => {
            this.emit('closed', ws);
            this.removeClient(id);
        })

        ws.on('error', (error) => {
            this.emit('error', ws, error);
        })

        ws.on('message', (data) => {
            try {
                const payload: MessagePayload = JSON.parse(data as string);
                if (!this.operators.has(payload.op)) return ws.send(JSON.stringify({ code: 1007, error: 'Invalid OP' }))

                const operator = this.operators.get(payload.op)
                operator?.execute(this, { id, ws }, payload);
            } catch (e) {
                console.log('Error')
            }
        })
    }

    getClient(id: string) {
        if (!this.clients.has(id)) return;
        return this.clients.get(id);
    }

    removeClient(id: string) {
        if (!this.clients.has(id)) return;

        const client = this.clients.get(id);
        if (!client) return;

        if (!client.ws.CLOSED) client.ws.close();
        this.users.deauth(id);
        if (client.timeout.interval) clearInterval(client.timeout.interval);
        this.clients.delete(id);
    }

    start() {
        this.cleanRooms();
        this.server.on('connection', (ws) => {
            const id = uuidv4();
            this.addClient(id, ws);
        })
        process.on('exit', () => {
            this.stop();
        })
    }

    stop() {
        for (const key in this.clients.keys()) {
            const id = this.clients.keys()[key];
            this.removeClient(id);
        }

        this.server.removeAllListeners();
        this.server.close();
        this.cleanRooms();
    }

    cleanRooms() {
        database.roomUser.deleteMany().then(() => {
            database.room.deleteMany().then(() => {
                database.$disconnect();
            })
        })
    }

    addClientTimeout(id: string, timeout: number) {
        const client = this.getClient(id);
        if (!client) return;

        const interval = setInterval(() => {
            if (Date.now() - client.timeout.lastPing > timeout) client.ws.close();
        }, timeout)

        client.timeout.interval = interval;
        this.clients.set(id, client);
    }

    setClientTimeout(timeout: number) {
        this.WS_TIMEOUT = timeout;
    }
}
