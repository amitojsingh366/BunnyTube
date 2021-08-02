import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

import { Connection, connect } from "@bunnytube/wrapper"
import { useTokenStore } from "../auth/useTokenStore";
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

    useEffect(() => {
        if (!conn && !isConnecting.current) {
            isConnecting.current = true;
            connect(wsUrl)
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