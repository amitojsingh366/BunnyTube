import { useEffect, useState } from "react";
import { useWrappedConn } from "../hooks/useConn";
import { useTokenStore } from "../modules/auth/useTokenStore";
import { useUsernameStore } from "../modules/auth/useUsernameStore";

export default function Login() {
    const wrapper = useWrappedConn();
    const accessToken = useTokenStore.getState().accessToken;
    const uName = useUsernameStore.getState().username;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        const token = await wrapper.query.user.auth(username, password);
        useTokenStore.getState().setTokens({ accessToken: token })
        useUsernameStore.getState().setUsername({ username });
    }

    useEffect(() => {
        if (!wrapper.connection) return;
        if (!accessToken || !uName) return;
        wrapper.query.user.auth(uName, undefined, accessToken).then((newToken) => {
            useTokenStore.getState().setTokens({ accessToken: newToken })
        })
        console.log(3)
    }, [wrapper.connection, uName])

    return (
        <div>
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={login}>Submit</button>
        </div>
    );
}
