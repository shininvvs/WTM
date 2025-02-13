import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login/Login.jsx";
import Register from "./components/register/Register.jsx";
import MyPage from "./components/user/MyPage.jsx";
import FindID from './components/find/FindID';
import ResetPasswordRequest from './components/find/ResetPasswordRequest';
import ResetPassword from './components/find/ResetPassword';
import RoomSetting from "./components/roomSetting/RoomSetting.jsx";
import LobbyPage from "./components/lobby/LobbyPage.jsx";
import RoomDetail from "./components/lobby/RoomDetail.jsx";
import UserManagement from "./components/admin/UserManagement.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/find-id" element={<FindID />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path='/RoomSetting' element={<RoomSetting/>} />
        <Route path="/lobby" element={<LobbyPage/>}/>
        <Route path="/room/:roomId" element={<RoomDetail />} /> {/* 방 상세 페이지 */}
        <Route path="/users" element={<UserManagement/>}/>
      </Routes>
    </Router>
  );
};

export default App;
