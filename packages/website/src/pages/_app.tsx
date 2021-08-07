import "../styles/globals.css";

import { AppProps } from "next/app";
import React from "react";
import { WebSocketProvider } from "../modules/ws/WebSocketProvider";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WebSocketProvider >
      <Component {...pageProps} />
    </WebSocketProvider>)

}
