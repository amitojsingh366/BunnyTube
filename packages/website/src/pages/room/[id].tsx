import { useWrappedConn } from "../../hooks/useConn";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { RoomUser } from "@bunnytube/wrapper";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
    const wrapper = useWrappedConn();
    const { query, replace } = useRouter();
    const roomId = typeof query.id === "string" ? query.id : "";
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<{ author: RoomUser, content: string, id: string }>>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (message !== "") {
            setLoading(true);
            const resp = await wrapper.mutation.chat.sendMessage(message);
            setLoading(false);
            if (resp.success) setMessages((current) => current.concat(resp.message));
        }
    }

    useEffect(() => {
        if (!wrapper.connection || !wrapper.connection.authed) return;

        wrapper.mutation.room.join(roomId).then((resp) => {
            if (!resp.success) replace("/dash")
        })

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
            }))
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
        })
    }, [(wrapper.connection ? wrapper.connection.authed : wrapper.connection)])



    return (
        <div className="w-full h-full">
            <div className="flex flex-col content-center justify-center p-10 gap-2">
                {messages && messages.map((m) => <p key={m.id}>{m.author.username}: {m.content}</p>)}
                <Input type="text" placeholder="Message" onChange={(e) => setMessage(e.target.value)} />
                <Button loading={loading} onClick={sendMessage}>Send Message</Button>
            </div>
        </div>
    );
}
