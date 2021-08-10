import { RoomUserRole, UserRole } from "../types";
import { AuthedUser } from "./AuthedUser";
import { Room } from "./Room";
import WebSocket from "ws";

export class RoomUser {
    private _id: string;
    private _username: string;
    private _room: Room;
    private _role: RoomUserRole;
    private _ws: WebSocket;
    private _wsId: string;

    constructor(user: AuthedUser, room: Room) {
        this._id = user.id;
        this._username = user.username;
        this._ws = user.wsClient.ws;
        this._wsId = user.wsClient.id;
        this._room = room;
        this._role = RoomUserRole.USER;
        if (room.creator.id == user.id) this._role = RoomUserRole.ADMINISTRATOR;
        if (user.role == UserRole.ADMINISTRATOR) this._role = RoomUserRole.MODERATOR;
    }

    get id(): string { return this._id }
    get username(): string { return this._username }
    get room(): Room { return this._room }
    get role(): RoomUserRole { return this._role }
    get ws(): WebSocket { return this._ws }
    get wsId(): string { return this._wsId }

    setRole(newRole: RoomUserRole) {
        this._role = newRole;
    }

    data() {
        return {
            id: this._id,
            username: this._username,
            roomId: this._room.id,
            role: this._role,
            wsId: this._wsId
        }
    }
}

