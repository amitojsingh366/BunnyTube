import React from "react";
import { WaitForAuth } from "../../modules/auth/WaitForAuth";
import RoomPage from "../../modules/room/room-page";

export default function Room() {
    return (
        <WaitForAuth>
            <RoomPage />
        </WaitForAuth>
    );
}
