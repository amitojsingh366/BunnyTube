import Collection from "@discordjs/collection";
import { Room } from "../classes/Room";
import WebSocket from "isomorphic-ws";
import { database } from "../../prisma";
import { WebsocketServer } from "..";
import { Privacy } from "../types";

export class RoomManager {
    private _rooms: Collection<string, Room>;
    private _server: WebsocketServer;

    constructor(server: WebsocketServer) {
        this._rooms = new Collection<string, Room>();
        this._server = server;
    }

    get rooms(): Collection<string, Room> { return this._rooms }

    getRoom(id: string) {
        return this._rooms.get(id)
    }

    async createRoom(client: { id: string; ws: WebSocket; }, name: string, privacy: Privacy) {
        const user = this._server.users.getUserByWsId(client.id);
        if (!user) return;

        const r = await database.room.create({
            data: {
                name,
                privacy
            }
        });

        const room = new Room(r.id, user);
        this._rooms.set(r.id, room);

        this.setListeners(room);

        return room;
    }

    async destroyRoom(modId: string, id: string) {
        const room = this.getRoom(id);
        if (!room) return;

        await room.destroy(modId);
        this._rooms.delete(id);
    }

    setListeners(room: Room) {
        room.on('joined', (user) => {
            const authedUser = this._server.users.getUserByWsId(user.wsId);
            if (!authedUser) return;

            authedUser.setRoom(room);
        });

        room.on('left', (user) => {
            const authedUser = this._server.users.getUserByWsId(user.wsId);
            if (!authedUser) return;

            authedUser.setRoom(undefined);
        });

        room.on('kicked', (user) => {
            const authedUser = this._server.users.getUserByWsId(user.wsId);
            if (!authedUser) return;

            authedUser.setRoom(undefined);
        });
    }
}

// id        String     @id @default(uuid())
// index     Int        @default(autoincrement())
// name      String
// privacy   Privacy    @default(PUBLIC)
// users     RoomUser[]
// created   DateTime   @default(now())
// updatedAt DateTime   @updatedAt