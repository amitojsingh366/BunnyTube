import create from "zustand";
import { combine } from "zustand/middleware";
import { isServer } from "../../lib/constants";

const usernameKey = "@auth/username";

const getDefaultValues = () => {
    if (!isServer) {
        try {
            return {
                username: localStorage.getItem(usernameKey) || "",
            };
        } catch { }
    }

    return {
        username: "",
    };
};

export const useUsernameStore = create(
    combine(getDefaultValues(), (set) => ({
        setUsername: (x: { username: string }) => {
            try {
                localStorage.setItem(usernameKey, x.username);
            } catch { }

            set(x);
        },
    }))
);