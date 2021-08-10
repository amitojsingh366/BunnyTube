import Collection from "@discordjs/collection";
import { AuthedUser } from "./AuthedUser";
import { RoomUser } from "./RoomUser";
import { Eventra } from "@duxcore/eventra";
import { RoomEvents } from "../events";
import { PlaybackStatus, Privacy, RoomUserRole } from "../types";
import { database } from "../../prisma";
import { v4 as uuidv4 } from "uuid";


export class Room extends Eventra<RoomEvents>{
    private _id: string;
    private _privacy: Privacy;
    private _creator: AuthedUser;
    private _users: Collection<string, RoomUser> = new Collection<string, RoomUser>();

    constructor(id: string, privacy: Privacy, creator: AuthedUser) {
        super();
        this._id = id;
        this._privacy = privacy;
        this._creator = creator;
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
        }).then(async () => {
            this.emit('joined', roomUser.data());

            const data = JSON.stringify({
                op: 'room:user_joined',
                data: { user: roomUser.data() }
            })

            this._users.forEach((u) => u.ws.send(data))
        })
        return roomUser.data();
    }

    async leave(userId: string) {
        const user = this.getUser(userId);
        if (!user) return;

        this._users.delete(user.id)

        await database.roomUser.delete({ where: { userId: user.id } }).then(async () => {
            this.emit('left', user.data());

            const data = JSON.stringify({
                op: 'room:user_left',
                data: { user: user.data() }
            })

            this._users.forEach((u) => u.ws.send(data))
        })

        return this;
    }

    async kick(modId: string, userId: string, reason: string) {
        const user = this.getUser(userId);
        const mod = this.getUser(modId);
        if (!user || !mod) return;
        if (mod.role == RoomUserRole.USER) return;

        this._users.delete(user.id);

        return await database.roomUser.delete({ where: { userId: user.id } }).then(async () => {
            this.emit('kicked', user.data());

            const data = JSON.stringify({
                op: 'room:user_kicked',
                data: { user: user.data(), reason }
            })

            user.ws.send(data);
            this._users.forEach((u) => u.ws.send(data))

            return user;
        })
    }


    async destroy(modId: string) {
        const user = this.getUser(modId);
        if (!user) return;

        if (user.id !== this.creator.id) return;

        for (const id in this._users) {
            const u = this._users.get(id);
            if (!u) continue;
            await this.kick(user.id, u.id, 'Room Closed').then(() => { })
        }

        await database.roomUser.deleteMany({ where: { roomId: this._id } }).then(async () => {
            await database.room.delete({ where: { id: this.id } })
        })
    }

    async sendMessage(authorId: string, content: string) {
        const author = this.getUser(authorId);
        if (!author) return;

        const id = uuidv4();

        const messageData = {
            id,
            author: author.data(),
            content
        }

        this._users.forEach((u) => {
            if (u.id !== author.id) u.ws.send(JSON.stringify({
                op: 'chat:message',
                data: messageData
            }))
        })

        return messageData;
    }

    async sendPlaybackStatus(authorId: string, status: PlaybackStatus) {
        const author = this.getUser(authorId);
        if (!author) return false;

        if (author.role === RoomUserRole.USER) return false;

        this._users.forEach((u) => {
            u.ws.send(JSON.stringify({
                op: 'playback:status',
                data: status
            }))
        });
        return true;
    }

    async changeUserRole(modId: string, userId: string, newRole: RoomUserRole) {
        const mod = this.getUser(modId);
        if (!mod) return;

        if (mod.role === RoomUserRole.ADMINISTRATOR) return;

        const roomUser = this.getUser(userId);
        if (!roomUser) return;

        roomUser.setRole(newRole);

        this._users.set(userId, roomUser);

        await database.roomUser.update({
            where: { userId }, data: {
                role: newRole
            }
        }).then(() => {
            this._users.forEach((u) => {
                u.ws.send(JSON.stringify({
                    op: 'user:updated',
                    data: roomUser.data()
                }))
            });
        });
        return true;
    }

    get id(): string { return this._id }
    get privacy(): Privacy { return this._privacy }
    get creator(): AuthedUser { return this._creator }
    get users(): Collection<string, RoomUser> { return this._users }
}