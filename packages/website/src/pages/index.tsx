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
  const [password, setPassword] = useState("");
  const [loading, setLoding] = useState(false);

  const login = async () => {
    if (!username && !password) return;
    setLoding(true);
    const resp = await wrapper.query.user.auth(username, password);
    setLoding(false);
    if (!resp.success) console.error(resp.error)
    if (resp.success) {
      useAuthStore.getState().setAuth({ token: resp.token, username });
      replace("/dash");
    }
  }


  return (
    <div className="flex w-full h-full content-center justify-center">
      <div className="flex flex-col p-10 gap-2 shadow-md w-1/4 h-1/3 rounded-md mt-48">
        <Input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <Button loading={loading} onClick={login}>Login</Button>
      </div>
    </div>
  );
}
