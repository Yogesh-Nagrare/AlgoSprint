import {Routes, Route ,Navigate} from "react-router";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail"
import VerifyNotice from "./pages/VerifyNotice";
import Homepage from "./pages/Homepage";
import Profile from "./pages/Profile";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminUpdate from "./components/AdminUpdate"
import AdminDelete from "./components/AdminDelete"
import AdminVideo from "./components/AdminVideo"
import AdminUpload from "./components/AdminUpload";
import { LeaderboardCard } from './components/Leaderboard';
import { ContestCard } from './components/Contest';
import AuthCallback from "./pages/AuthCallback";
import LandingPage from "./pages/LandingPage";
import TopicSheet from "./pages/TopicSheet";
import AdminSheet from "./components/AdminSheet";
import ManageSheets from "./components/ManageSheets";
import SheetForm from "./pages/SheetForm";
import Problems from "./pages/Problem";
import LoadingScreen from "./components/LoadingScreen"; // Import it here

function App(){
  
  const dispatch = useDispatch();
  const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);

  // check initial authentication
  useEffect(() => {
    // verify-email page pe auth check mat karo
    if (window.location.pathname.startsWith("/verify-email")) return;

    dispatch(checkAuth());
  }, [dispatch]);
  const isVerifyPage = window.location.pathname.startsWith("/verify-email");
  if (loading && !isVerifyPage) {
    return <LoadingScreen />;
  }

  return(
  <>
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* MODIFIED ROOT ROUTE */}
      <Route path="/problems" element={<Problems />} />
      <Route 
          path="/" 
          element={isAuthenticated ? <Homepage /> : <LandingPage />} 
        />
      <Route path="/sheet/:sheetId" element={isAuthenticated ? <TopicSheet /> : <Navigate to="/login" />} />
      <Route path="/leaderboard" element={isAuthenticated ? <LeaderboardCard /> : <Navigate to="/signup" />} />
      <Route path="/contests" element={isAuthenticated ? <ContestCard /> : <Navigate to="/signup" />} />  
      {/* <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route> */}
      <Route 
        path="/profile" 
        element={isAuthenticated ? <Profile /> : <Navigate to="/" />} 
      />
      <Route path="/login" element={isAuthenticated && user?.isEmailVerified? <Navigate to="/" />: <Login />}/>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/signup" element={isAuthenticated && user?.isEmailVerified? <Navigate to="/" />: <Signup />}/>
      <Route path="/verify-notice" element={<VerifyNotice />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/" />} />
      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route 
        path="/admin/sheet" 
        element={isAuthenticated && user?.role === 'admin' ? <AdminSheet /> : <Navigate to="/" />} 
      />
      <Route path="/admin/sheets/manage" element={<ManageSheets />} />
<Route path="/admin/sheet/create" element={<SheetForm />} />
<Route path="/admin/sheet/edit/:sheetId" element={<SheetForm />} />
    </Routes>
  </>
  )
}

export default App;