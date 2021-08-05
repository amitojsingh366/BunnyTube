import create from "zustand";
import { combine } from "zustand/middleware";
import { isServer } from "../../lib/constants";

const tokenKey = "@auth/token";
const usernameKey = "@auth/username";

const getDefaultValues = () => {
    if (!isServer) {
        try {
            return {
                token: localStorage.getItem(tokenKey) || "",
                username: localStorage.getItem(usernameKey) || "",
            };
        } catch { }
    }

    return {
        token: "",
        username: ""
    };
};

export const useAuthStore = create(
    combine(getDefaultValues(), (set) => ({
        setToken: (x: { token: string, }) => {
            try {
                localStorage.setItem(tokenKey, x.token);
            } catch { }

            set(x);
        },
        setUsername: (x: { username: string }) => {
            try {
                localStorage.setItem(usernameKey, x.username);
            } catch { }

            set(x);
        },
        setAuth: (x: { token: string, username: string }) => {
            try {
                localStorage.setItem(tokenKey, x.token);
                localStorage.setItem(usernameKey, x.username);
            } catch { }

            set(x);
        },
    }))
);