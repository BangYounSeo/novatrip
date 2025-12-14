// src/App.js
import { Routes, Route } from 'react-router-dom';
import React, { useState } from "react";
import Main from './components/main/Main';
import ChangeInfo from "./components/login/ChangeInfo";
import Login from "./components/login/Login";
import Event from './components/info/Event';
import ReviewWrite from './components/community/ReviewWrite';
import Community from './components/community/Community';
import BoardProvider from './components/community/BoardContext';
import SignUp_Email from './components/login/SignUp_Email';
import SignUp_User from './components/login/SignUp_User';
import CompleteSign from './components/login/CompleteSign';
import MyInfo from './components/login/MyInfo';
import SeoulMap from './components/main/SeoulMap';
import Board from './components/community/Board';
import EventDetail from './components/info/EventDetail';
import LoginAlertModal from './components/login/LoginAlertModal';
import Admin from './components/admin/Admin';
import CompleteDelete from './components/login/CompleteDelete';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <BoardProvider>
      <Routes>
        <Route path="/" element={<Main setToken={setToken} />}>
          <Route index element={<Board />} />
          <Route path="community" element={<Board />} />
          <Route path="community/:numBrd" element={<Community />} />
          <Route path="review/write" element={<ReviewWrite />} />
          <Route path="event" element={<Event />} />
          <Route path="map/*" element={<SeoulMap />} />
          <Route path="myInfo" element={<MyInfo />} />
          {/* ✅ 상세 라우트 파라미터화 */}
          <Route path="event/detail/:contentId" element={<EventDetail />} />
        </Route>

        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/changePwd" element={<ChangeInfo setToken={setToken} />} />
        <Route path="/signup/email" element={<SignUp_Email setToken={setToken} />} />
        <Route path="/signup/user" element={<SignUp_User token={token} setToken={setToken} />} />
        <Route path="/signup/complete" element={<CompleteSign />} />
        <Route path="/delete/complete" element={<CompleteDelete />} />
        <Route path="/profile" element={<MyInfo />} />
        <Route path="/admin" element={<Admin setToken={setToken} />} />
      </Routes>
    </BoardProvider>
  );
}

export default App;
