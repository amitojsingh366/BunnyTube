export const isServer = typeof window === "undefined";
export const wsUrl = process.env.WS_URL || "ws://bunnytube.amitoj.net:8443"