import { useRouter } from "next/router";
export default function Home() {
  const { replace } = useRouter();
  const login = () => {
    replace("/login");
  }
  return (
    <div>
      <button onClick={login}>Login</button>
    </div>
  );
}
