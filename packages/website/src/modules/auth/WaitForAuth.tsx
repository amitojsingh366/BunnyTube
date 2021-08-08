import { FC } from "react"
import { Spinner } from "../../components/Spinner";
import { useConnContext } from "../../hooks/useConn"

export const WaitForAuth: FC = ({ children }) => {
    const connContext = useConnContext();

    if (!connContext.conn) return (
        <div>
            <p>Loading</p>
            <Spinner />
        </div>
    )

    if (!connContext.authed) return (
        <div>
            <p>Loading</p>
            <Spinner />
        </div>
    );

    return (
        <div className="w-full h-full" >
            {children}
        </div>
    )
}
