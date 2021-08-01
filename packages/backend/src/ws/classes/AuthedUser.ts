import { UserRole } from "@prisma/client";
import { UserFile, UserToken } from "../types";
import { database } from "../../prisma";
import WebSocket from "ws";
import { Room } from "./Room";

export class AuthedUser {
    private _id: string;
    private _wsClient: { id: string; ws: WebSocket };
    private _name: string;
    private _username: string;
    private _email?: string | null;
    private _password: string;
    private _created: Date;
    private _updatedAt?: Date | null;
    private _role: UserRole;
    private _token?: UserToken | null;
    private _files?: UserFile[] | null;
    private _room?: Room;

    constructor(id: string, wsClient: { id: string; ws: WebSocket }) {
        this._id = id;
        this._wsClient = wsClient;
        this._role = UserRole.USER;
        this._name = "";
        this._username = "";
        this._password = "";
        this._created = new Date();

        this.fetch();
    }

    async fetch(files = false) {
        const user = await database.user.findUnique({ where: { id: this._id }, include: { token: true, files } })
        if (!user) return;
        this._id = user.id;
        this._role = user.role;
        this._name = user.name;
        this._username = user.username;
        this._email = user.email;
        this._password = user.password;
        this._created = user.created;
        this._updatedAt = user.updatedAt;
        this._role = user.role;
        this._token = user.token as UserToken;
        if (files) this._files = user.files as UserFile[];
    }


    get id(): string { return this._id }
    get wsClient(): { id: string; ws: WebSocket } { return this._wsClient }
    get role(): UserRole { return this._role }
    get name(): string { return this._name }
    get username(): string { return this._username }
    get email(): string | null | undefined { return this._email }
    get password(): string { return this._password }
    get created(): Date { return this._created }
    get updatedAt(): Date | null | undefined { return this._updatedAt }
    get token(): UserToken | null | undefined { return this._token }
    get files(): UserFile[] | null | undefined { return this._files }
    get room(): Room | undefined { return this._room }

    setRoom(room: Room | undefined) {
        this._room = room;
    }
}


// id          String        @id @default(uuid())
// index       Int           @default(autoincrement())
// name        String
// username    String        @unique
// email       String?       @unique
// password    String
// created     DateTime      @default(now())
// updatedAt   DateTime      @updatedAt
// role        UserRole      @default(USER)
// token       Token?
// roomUsers   RoomUser[]
// files       File[]
// authedUsers AuthedUsers[]