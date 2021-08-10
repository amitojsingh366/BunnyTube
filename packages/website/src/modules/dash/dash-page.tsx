import { useWrappedConn } from "../../hooks/useConn";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

export default function DashboardPage() {
    const wrapper = useWrappedConn();
    const { replace } = useRouter();
    const [name, setName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!wrapper.connection) return;
        wrapper.query.user.get().then((resp) => {
            if (!resp.success) replace("/")
            if (resp.success) setName(resp.user.name)
        })
    }, [wrapper.connection])

    const createRoom = async () => {
        setLoading(true);
        const resp = await wrapper.mutation.room.create(isPrivate);
        setLoading(false);
        if (!resp.success) console.error(resp.error)
        if (resp.success) {
            replace(`/room/${resp.room.id}`)
        }
    }

    const logout = () => {
        replace('/logout')
    }

    return (
        <div className="flex flex-col content-center justify-center p-10 gap-2">
            <h3>Welcome {name}</h3>
            <div className="inline-flex" >
                <label>Private:</label><Input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            </div>

            <Button loading={loading} onClick={createRoom}>Create Room</Button>

            <Button onClick={logout}>Log Out</Button>
        </div>
    );
}
