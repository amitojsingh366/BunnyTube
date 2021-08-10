import { RoomUser, RoomUserRole } from "@bunnytube/wrapper";
import { ChangeEvent, FC, useEffect, useState } from "react"
import { useWrappedConn } from "../hooks/useConn";

export const RoomUserComponent: FC<{ user: RoomUser, currentUser: RoomUser | undefined }> = ({
    user,
    currentUser
}) => {
    const [role, setRole] = useState<RoomUserRole>(RoomUserRole.USER);
    const [showAdminOptions, setShowAdminOptions] = useState(false);
    const wrapper = useWrappedConn();

    useEffect(() => {
        if (!currentUser) return;
        if (currentUser.role === RoomUserRole.ADMINISTRATOR) setShowAdminOptions(true);
    }, [currentUser]);

    useEffect(() => { setRole(user.role as RoomUserRole); }, [user])

    const changeRole = async (e: ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as RoomUserRole;
        setRole(newRole);
        await wrapper.mutation.user.changeRole(user.id, newRole, true).then(console.log)
    }

    return (
        <div className="inline-flex">
            {user.username} Role
            {showAdminOptions && role !== RoomUserRole.ADMINISTRATOR ? <>: <select onChange={changeRole}>
                <option value={RoomUserRole.USER} selected={role === RoomUserRole.USER}>User</option>
                <option value={RoomUserRole.MODERATOR} selected={role === RoomUserRole.MODERATOR}>Moderator</option>
            </select> </> : <p>: {user.role[0] + user.role.slice(1).toLowerCase()}</p>}
        </div>
    )
}