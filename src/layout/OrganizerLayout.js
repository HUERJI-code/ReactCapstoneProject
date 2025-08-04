import { Outlet } from 'react-router-dom';
import SideBar from "../Components/SideBar";

const OrganizerLayout = ({  }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <SideBar/>
            <main className="flex-grow-1">
                <Outlet/>
            </main>
        </div>
    );
};

export default OrganizerLayout;