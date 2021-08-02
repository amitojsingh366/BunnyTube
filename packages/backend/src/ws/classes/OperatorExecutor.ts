import { MessagePayload } from "../types";
import WebSocket from "isomorphic-ws";
import { WebsocketServer } from "..";

export type MiddlewareMethod = (server: WebsocketServer, client: { id: string, ws: WebSocket }, payload: MessagePayload, next: () => void) => void;
export type Executor = (server: WebsocketServer, client: { id: string, ws: WebSocket }, payload: MessagePayload) => void;

const defaultExecutor: Executor = (server: WebsocketServer, client: { id: string, ws: WebSocket }, payload: MessagePayload) => {
    return client.ws.send(JSON.stringify({ code: 1007, error: 'Invalid OP' }))
}

export default class OperatorExecutor {

    private _middlewareMethods: MiddlewareMethod[] = [];
    private _executor: Executor = defaultExecutor;

    private _name: string;

    constructor(vals: { name: string }) {
        this._name = vals.name;
    }

    get name(): string { return this._name; }

    public use(...mwm: MiddlewareMethod[]): OperatorExecutor {
        mwm.map(meth => this._middlewareMethods.push(meth));
        return this;
    }

    public setExecutor(executor: Executor): OperatorExecutor {
        this._executor = executor;
        return this;
    }

    public async execute(server: WebsocketServer, client: { id: string, ws: WebSocket }, payload: MessagePayload): Promise<OperatorExecutor> {
        let proms: Promise<void>[] = []
        this._middlewareMethods.map(fn => proms.push(new Promise((res, _rej) => fn(server, { ws: client.ws, id: client.id }, payload, res))));
        if (proms.length > 0) await Promise.all(proms);

        this._executor(server, { ws: client.ws, id: client.id }, payload);
        return this;
    }
}
