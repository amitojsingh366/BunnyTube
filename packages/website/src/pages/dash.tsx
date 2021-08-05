import { useWrappedConn } from "../hooks/useConn";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
    const wrapper = useWrappedConn();
    const { replace } = useRouter();
    const [data, setData] = useState("{}");

    useEffect(() => {
        if (!wrapper.connection || !wrapper.connection.authed) return;

        wrapper.query.user.get().then((resp) => {
            if (!resp.success) replace("/")
            if (resp.success) setData(JSON.stringify(resp.user))
        })
    }, [(wrapper.connection ? wrapper.connection.authed : wrapper.connection)])

    return (
        <div className="w-full h-full">
            <div className="flex flex-col content-center justify-center p-10 gap-2">
                <p>{data}</p>
            </div>
        </div>
    );
}
