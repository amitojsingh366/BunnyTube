export const isServer = typeof window === "undefined";
export const wsUrl = process.env.WS_URL || "ws://localhost:8443"