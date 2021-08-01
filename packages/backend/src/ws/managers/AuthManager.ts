import Collection from "@discordjs/collection";
import { AuthedUser } from "../classes/AuthedUser";
import WebSocket from "ws";

export class AuthManager {
    private _users: Collection<string, AuthedUser>;

    constructor() {
        this._users = new Collection<string, AuthedUser>();
    }

    auth(id: string, client: { id: string; ws: WebSocket }) {
        const user = new AuthedUser(id, client);
        this._users.set(client.id, user);
    }

    deauth(wsId: string) {
        return this._users.delete(wsId);
    }

    getUserByWsId(wsId: string) {
        return this._users.get(wsId);
    }
}