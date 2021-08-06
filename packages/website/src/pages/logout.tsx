import { useAuthStore } from "../modules/auth/useAuthStore";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
    const { replace } = useRouter();

    useEffect(() => {
        useAuthStore.getState().setAuth({ username: '', token: '' });
        replace("/")
    }, [])


    return (
        <div className="w-full h-full">
        </div>
    );
}
