import Collection from "@discordjs/collection";
import { AuthedUser } from "./AuthedUser";
import { RoomUser } from "./RoomUser";
import { Eventra } from "@duxcore/eventra";
import { RoomEvents } from "../events";
import { RoomUserRole } from "../types";
import { database } from "../../prisma";


export class Room extends Eventra<RoomEvents>{
    private _id: string;
    private _creator: AuthedUser;
    private _users: Collection<string, RoomUser> = new Collection<string, RoomUser>();

    constructor(id: string, creator: AuthedUser) {
        super();
        this._id = id;
        this._creator = creator;

        this.join(creator);
    }

    getUser(id: string) { return this._users.get(id) }

    async join(user: AuthedUser) {
        const roomUser = new RoomUser(user, this);
        this._users.set(roomUser.id, roomUser);

        await database.roomUser.create({
            data: {
                roomId: this._id,
                userId: roomUser.id
            }
        }).then(async (ru) => {
            this.emit('joined', roomUser);

            const data = JSON.stringify({
                op: 'room:user_joined',
                data: { user }
            })

            this._users.forEach((u) => u.ws.send(data))
        })

        return roomUser;
    }

    async leave(user: RoomUser) {
        this._users.delete(user.id)

        await database.roomUser.delete({ where: { userId: user.id } }).then(async (ru) => {
            this.emit('left', user);

            const data = JSON.stringify({
                op: 'room:user_left',
                data: { user }
            })

            this._users.forEach((u) => u.ws.send(data))
        })

        return user;
    }

    async kick(mod: RoomUser, user: RoomUser, reason: string) {
        if (mod.role == RoomUserRole.USER) return;
        this._users.delete(user.id);

        await database.roomUser.delete({ where: { userId: user.id } }).then(async (ru) => {
            this.emit('kicked', user);

            const data = JSON.stringify({
                op: 'room:user_kicked',
                data: { user, reason }
            })

            user.ws.send(data);
            this._users.forEach((u) => u.ws.send(data))
        })
        return user;
    }

    async destroy(modId: string) {
        const user = this.getUser(modId);
        if (!user) return;

        if (user.id !== this.creator.id) return;
        this._users.forEach(async (u) => {
            await this.kick(user, u, 'Room Closed');
        });
        await database.room.delete({ where: { id: this.id } })
    }

    get id(): string { return this._id }
    get creator(): AuthedUser { return this._creator }
    get users(): Collection<string, RoomUser> { return this._users }
}