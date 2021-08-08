import { WaitForAuth } from "../modules/auth/WaitForAuth";
import DashboardPage from "../modules/dash/dash-page";

export default function Dash() {
    return (
        <WaitForAuth>
            <DashboardPage />
        </WaitForAuth>
    );
}
