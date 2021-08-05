import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { useWrappedConn } from "../hooks/useConn";
import { useAuthStore } from "../modules/auth/useAuthStore";
import { Input } from "../components/Input";

export default function Home() {
  const wrapper = useWrappedConn();

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
      useAuthStore.getState().setAuth({ token: resp.token, username })
    }
  }

  useEffect(() => { console.log(loading) }, [loading])

  return (
    <div className="w-full h-full">
      <div className="flex flex-col content-center justify-center p-10 gap-2">
        <Input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <Button loading={loading} onClick={login}>Login</Button>
      </div>
    </div>
  );
}
