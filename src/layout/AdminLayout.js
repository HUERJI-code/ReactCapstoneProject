import { Outlet } from 'react-router-dom';
import AdminSideBar from "../Components/AdminSideBar";

const AdminLayout = ({  }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <AdminSideBar/>
            <main className="flex-grow-1">
                <Outlet/>
            </main>
        </div>
    );
}

export default AdminLayout;