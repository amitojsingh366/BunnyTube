import { useWrappedConn } from "../../hooks/useConn";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { RoomUser } from "@bunnytube/wrapper";
import { v4 as uuidv4 } from "uuid";
import { VideoPlayer } from "../../components/VideoPlayer";
import { RoomUserComponent } from "../../components/RoomUserComponent";

export default function RoomPage() {
    const wrapper = useWrappedConn();
    const { query, replace } = useRouter();
    const roomId = typeof query.id === "string" ? query.id : "";
    const [roomUser, setRoomUser] = useState<RoomUser>();
    const [roomUsers, setRoomUsers] = useState<RoomUser[]>();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<{ author: RoomUser, content: string, id: string }>>([]);
    const [loading, setLoading] = useState(false);
    const ytRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

    const sendMessage = async () => {
        if (message !== "") {
            setLoading(true);
            let match = message.match(ytRegex);
            if (match) {
                const resp = await wrapper.mutation.playback.sendStatus({
                    videoUrl: match ? match[1] : "",
                    paused: false,
                    source: 'YOUTUBE',
                    currentTime: 0,
                    isPlaying: true
                })
                if (resp.success) { setMessage(""); setLoading(false); return; }
            }
            const resp = await wrapper.mutation.chat.sendMessage(message);
            setLoading(false);
            if (resp.success) setMessages((current) => current.concat(resp.message));
            setMessage("");
        }
    }

    useEffect(() => {
        if (!wrapper.connection) return;
        wrapper.mutation.room.join(roomId).then((resp) => {
            if (!resp.success) replace("/dash");
            if (resp.success) { setRoomUsers(resp.room.users); setRoomUser(resp.roomUser); }
        });

        wrapper.subscribe.chat.message((message) => {
            setMessages((current) => current.concat(message.data));
        });

        wrapper.subscribe.room.userJoin((data) => {
            const author = {
                username: 'System',
                id: data.data.user.id,
                roomId: data.data.user.roomId,
                role: data.data.user.role
            }
            setMessages((current) => current.concat({
                id: uuidv4(),
                author,
                content: `${data.data.user.username} has joined!`
            }))
            setRoomUsers((current) => current ?
                current.concat(data.data.user) : [data.data.user]);
        })

        wrapper.subscribe.room.userLeave((data) => {
            const author = {
                username: 'System',
                id: data.data.user.id,
                roomId: data.data.user.roomId,
                role: data.data.user.role
            }
            setMessages((current) => current.concat({
                id: uuidv4(),
                author,
                content: `${data.data.user.username} has left`
            }));
            setRoomUsers((current) => current?.filter((u) => u.id !== data.data.user.id))
        })

        wrapper.subscribe.room.userKicked((data) => {
            const author = {
                username: 'System',
                id: data.data.user.id,
                roomId: data.data.user.roomId,
                role: data.data.user.role
            }
            setMessages((current) => current.concat({
                id: uuidv4(),
                author,
                content: `${data.data.user.username} was kicked by a mod!`
            }))
            setRoomUsers((current) => current?.filter((u) => u.id !== data.data.user.id))
        });

        wrapper.subscribe.user.updated((data) => {
            setRoomUsers((current) => current?.filter((u) => u.id !== data.data.id));
            setRoomUsers((current) => current ?
                current.concat(data.data) : [data.data]);


        })
    }, [wrapper.connection]);

    useEffect(() => {
        if (!roomUser) return;
        wrapper.subscribe.user.updated((data) => {
            if (roomUser.id == data.data.id) setRoomUser(data.data)
        })
    }, [roomUser])


    return (
        <div>
            <div className="flex flex-row content-center justify-center gap-2">
                <VideoPlayer roomUser={roomUser} />
                <div className="flex flex-col content-center justify-center gap-2 pl-8 max-w-xs break-words">
                    {messages && messages.map((m) => <p key={m.id}>{m.author.username}: {m.content}</p>)}
                    <Input type="text" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
                    <Button loading={loading} onClick={sendMessage}>Send Message</Button>
                </div>
            </div>
            <div className="flex flex-col content-center justify-center gap-2 pl-14 p-10">
                {roomUsers && roomUsers.map((u) => <RoomUserComponent key={u.id} user={u} currentUser={roomUser} />)}
            </div>
        </div>
    );
}
