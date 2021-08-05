import {
    FC,
    DetailedHTMLProps,
    InputHTMLAttributes,
} from "react"


export type InputProps = DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;

export const Input: FC<InputProps> = ({
    className = "",
    placeholder,
    type,
    onChange
}) => {
    return (
        <input type={type} placeholder={placeholder} onChange={onChange}
            className={`flex focus:ring-4 focus:ring-blue-300 rounded-md p-2 
        transition ease-in-out duration-200
        font-bold items-center justify-center ${className} border-gray-500 text-black border-2`} />

    )
}