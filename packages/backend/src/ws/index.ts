import WebSocket from 'ws';
import Collection from '@discordjs/collection';
import { v4 as uuidv4 } from 'uuid';
import { Eventra } from '@duxcore/eventra';
import { WebsocketServerEvents } from './events';
import { MessagePayload } from './types';
import OperatorExecutor from './classes/OperatorExecutor';
import { glob } from 'glob';
import { PrismaClient } from '@prisma/client';


export class WebsocketServer extends Eventra<WebsocketServerEvents> {
    public clients: Collection<string, { id: string, ws: WebSocket }> = new Collection();
    public operators: Collection<string, OperatorExecutor> = new Collection();
    public server: WebSocket.Server;
    public database: PrismaClient;

    constructor(port: number) {
        super();
        this.server = new WebSocket.Server({ port });

        this.database = new PrismaClient();
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
        this.clients.set(id, { id, ws });

        this.emit('opened', ws);

        ws.on('close', () => {
            this.emit('closed', ws);
            this.removeClient(id);
        })

        ws.on('error', (error) => {
            this.emit('error', ws, error);
        })

        ws.on('message', (data) => {
            const payload: MessagePayload = JSON.parse(data as string);
            if (!this.operators.has(payload.op)) return ws.send(JSON.stringify({ code: 1007, error: 'Invalid OP' }))

            const operator = this.operators.get(payload.op)
            operator?.execute(this, { id, ws }, payload);
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
        this.database.authedUsers.delete({ where: { wsId: id } });
        this.clients.delete(id);
    }

    start() {
        this.server.on('connection', (ws) => {
            const id = uuidv4();
            this.addClient(id, ws);
        })
    }

    stop() {
        for (const key in this.clients.keys()) {
            if (Object.prototype.hasOwnProperty.call(this.clients.keys(), key)) {
                const id = this.clients.keys()[key];
                this.removeClient(id);
            }
        }

        this.server.removeAllListeners();
        this.server.close();
        this.database.$disconnect();
    }


}




