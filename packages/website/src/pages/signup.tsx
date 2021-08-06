import { useState } from "react";
import { Button } from "../components/Button";
import { useWrappedConn } from "../hooks/useConn";
import { useAuthStore } from "../modules/auth/useAuthStore";
import { Input } from "../components/Input";
import { useRouter } from "next/router";

export default function Home() {
    const wrapper = useWrappedConn();
    const { replace } = useRouter();


    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoding] = useState(false);

    const signup = async () => {
        setLoding(true);
        const resp = await wrapper.mutation.user.create(username, name, password, email !== "" ? email : undefined);
        setLoding(false);
        if (!resp.success) console.error(resp.error)
        if (resp.success) {
            useAuthStore.getState().setAuth({ token: resp.token, username });
            replace("/");
        }
    }


    return (
        <div className="flex w-full h-full content-center justify-center">
            <div className="flex flex-col p-10 gap-2 shadow-md w-1/4 h-3/6 rounded-md mt-44">
                <Input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
                <Input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                <Input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <Button loading={loading} onClick={signup}>Sign Up</Button>
            </div>
        </div>
    );
}
