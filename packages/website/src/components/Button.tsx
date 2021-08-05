import {
    FC, ButtonHTMLAttributes,
    DetailedHTMLProps,
    ReactNode,
} from "react"

import { Spinner } from "./Spinner";

export type ButtonProps = DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
    loading?: boolean;
    icon?: ReactNode;
};

export const Button: FC<ButtonProps> = ({
    children,
    className = "",
    loading,
    icon,
    onClick,
}) => {
    return (
        <button onClick={onClick}
            className={`flex focus:ring-4 focus:ring-blue-300 
        bg-blue-500 rounded-md p-2 
        transition ease-in-out duration-200
        font-bold items-center justify-center ${className} text-white`}>
            <span className={loading ? "opacity-0" : `flex items-center`}>
                {icon ? <span className={`mr-2 items-center`}>{icon}</span> : null}
                {children}
            </span>
            {loading ? (
                <span className={`absolute`}>
                    <Spinner size={"4"} />
                </span>
            ) : null}
        </button>
    )
}