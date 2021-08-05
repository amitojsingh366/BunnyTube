import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

import { Connection, connect } from "@bunnytube/wrapper"
import { useAuthStore } from "../auth/useAuthStore";
import { wsUrl } from "../../lib/constants";

type V = Connection | null;

export const WebSocketContext = React.createContext<{
    conn: V;
    setConn: (u: Connection | null) => void;
}>({
    conn: null,
    setConn: () => { },
});

export const WebSocketProvider: React.FC = ({ children }) => {
    const [conn, setConn] = useState<V>(null);
    const { replace } = useRouter();
    const isConnecting = useRef(false);
    const hasAuth = useAuthStore((s) => s.token && s.username);

    const onAuth = (resp: any) => {
        if (resp.success) {
            useAuthStore.getState().setToken({ token: resp.token });
            replace("/dash");
        }
        if (!resp.success) replace("/");
    }

    useEffect(() => {
        if (!conn && !isConnecting.current) {
            isConnecting.current = true;

            const params: {
                url?: string;
                auth?: { username: string, token: string };
                onAuth?: (data: unknown) => void;
            } = { url: wsUrl };

            if (hasAuth) {
                const token = useAuthStore.getState().token;
                const username = useAuthStore.getState().username;
                params.auth = { token, username }
                params.onAuth = onAuth;
            }

            connect(params)
                .then((x) => {
                    setConn(x);
                })
                .catch((err) => {
                    if (err.code === 4001) {
                        replace(`/?next=${window.location.pathname}`);
                    }
                })
                .finally(() => {
                    isConnecting.current = false;
                });
        }
    }, [conn, replace]);

    useEffect(() => {
        if (!conn) {
            return;
        }
    }, [conn]);


    return (
        <WebSocketContext.Provider
            value={useMemo(
                () => ({
                    conn,
                    setConn,
                }),
                [conn]
            )}
        >
            {children}
        </WebSocketContext.Provider>
    );
};