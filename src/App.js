import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import OrganizerLogin from "./Pages/OrganizerLogin";
import OrganizerRegister from "./Pages/OrganizerRegister";
import Dashboard from "./Pages/Dashboard";
import OrganizerLayout from "./layout/OrganizerLayout";
import Inbox from "./Components/Inbox";
import CreateActivity from "./Components/CreateActivity";
import ManageActivities from "./Components/ManageActivities";

const App = () => {
  return (
      <Router>
        <MainApp/>
      </Router>
  );
};

const MainApp = () => {
  // const location = useLocation(); // Get current routing information

  // Check the current path
  // const isLoginPage = location.pathname === '/login';
  // const isSignUpPage = location.pathname === '/register';
  // const isChangePasswordPage = location.pathname === '/changePasswordWithoutLogin';
  // const isCartPage = location.pathname === '/findShoppingCart';


  return (
      <div className="d-flex flex-column min-vh-100">

        {/* Only render Navbar when not on the login, register, forgot password, or cart pages */}
        {/*{!isLoginPage && !isSignUpPage && !isChangePasswordPage && !isCartPage && <NavbarComponent/>}*/}

        <main className="flex-grow-1">
          <Routes>
            {/*<Route path="/" element={<HomePage/>}/>*/}
              <Route path="/" element={<OrganizerLogin/>}/>
              <Route path="/OrganizerSignUp" element={<OrganizerRegister/>}/>
              {/*<Route path="/Dashboard" element={<Dashboard/>}/>*/}
                <Route path="/" element={<OrganizerLayout/>}>
                    <Route path="/Dashboard" element={<Dashboard/>}/>
                    <Route path="/Inbox" element={<Inbox/>}/>
                    <Route path="/CreateActivity" element={<CreateActivity/>}/>
                    <Route path="/ManageActivities" element={<ManageActivities/>}/>
                </Route>
            </Routes>
        </main>

        {/* Only render Footer when not on the login, register, forgot password pages */}
        {/*{!isLoginPage && !isSignUpPage && !isChangePasswordPage && <FooterComponent/>}*/}
      </div>
  );
};

export default App;
