import { DetailedHTMLProps, FC, IframeHTMLAttributes, useEffect, useRef, useState } from "react"
import Plyr from "plyr";
import 'plyr/dist/plyr.css';
import { RoomUser } from "@bunnytube/wrapper";
import { useWrappedConn } from "../hooks/useConn";

export type IframeProps = DetailedHTMLProps<
    IframeHTMLAttributes<HTMLIFrameElement>,
    HTMLIFrameElement
> & {
    roomUser: RoomUser | undefined
};

export const VideoPlayer: FC<IframeProps> = ({
    roomUser,
}) => {
    const wrapper = useWrappedConn();
    const ytRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const [player, setPlayer] = useState<Plyr>()
    let lastStatus = 0;
    const ref = useRef<HTMLDivElement>(null);

    const sendStatus = () => {
        if (!player) return;

        let match = typeof player.source === "string" ? (player.source as string).match(ytRegex) : undefined;
        wrapper.mutation.playback.sendStatus({
            source: 'YOUTUBE',
            isPlaying: player.playing,
            paused: player.paused,
            videoUrl: match ? match[1] : undefined,
            currentTime: player.currentTime ? player.currentTime : 0
        });
    }

    const sendRateLimitedStatus = () => {
        if (Date.now() - lastStatus < 2500) return;
        lastStatus = Date.now();
        sendStatus();
    }

    useEffect(() => {
        console.log(Plyr)
        if (!player) if (ref.current) setPlayer(new Plyr(ref.current || ""));
        if (!wrapper.connection || !player) return;
        wrapper.subscribe.playback.status((status) => {
            if (status.data.isPlaying) {
                if (!player.playing && !player.paused) {
                    if (status.data.source == "YOUTUBE") player.source = {
                        type: 'video',
                        sources: [{
                            src: status.data.videoUrl ? `https://www.youtube.com/embed/${status.data.videoUrl}?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1` : "",
                            provider: 'youtube'
                        }]
                    }
                    player.play();
                }
                let currentSourceMatch = (player.source as unknown as string).match(ytRegex);
                if (currentSourceMatch && currentSourceMatch[1] !== status.data.videoUrl) {
                    if (status.data.source == "YOUTUBE") player.source = {
                        type: 'video',
                        sources: [{
                            src: status.data.videoUrl ? `https://www.youtube.com/embed/${status.data.videoUrl}?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1` : "",
                            provider: 'youtube'
                        }]
                    }
                    player.play();
                }
                if ((status.data.currentTime - 3 > player.currentTime) || (status.data.currentTime + 3 < player.currentTime)) player.currentTime = status.data.currentTime;
                if (player.paused && !status.data.paused) player.play();
            }
            if (status.data.paused) player.pause();
        })

    }, [wrapper.connection, player]);

    useEffect(() => {
        if (!wrapper.connection || !wrapper.connection.authed || !player || !roomUser) return;
        player.on('play', sendStatus)
        player.on('pause', sendStatus);
        player.on('seeked', sendRateLimitedStatus);

        setInterval(() => {
            if (roomUser && (roomUser.role == "ADMINISTRATOR" || roomUser.role == "MODERATOR")) {
                sendStatus();
            }
        }, 3000);

    }, [(wrapper.connection ? wrapper.connection.authed : wrapper.connection), player, roomUser]);

    return (

        <div ref={ref} className="plyr__video-embed" id="player">
            <iframe
                src="https://www.youtube.com/embed/bTqVqk7FSmY?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1"
                allowFullScreen
                allowTransparency
                allow="autoplay"
            ></iframe>
        </div>



    )
}
