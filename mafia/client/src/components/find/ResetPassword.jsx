import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";  // ✅ useLocation 추가
import axios from "axios";
import "../../styles/find/resetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();  // ✅ 현재 URL에서 email 가져오기
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get("email");

  const [form, setForm] = useState({
    email: emailFromQuery || "",  // ✅ URL에서 이메일을 자동으로 가져옴
    token: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!emailFromQuery) {
      setMessage("❌ 이메일 정보가 없습니다. 다시 인증을 진행하세요.");
    }
  }, [emailFromQuery]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return setMessage("❌ 비밀번호가 일치하지 않습니다.");
    }

    try {
      const response = await axios.post("http://localhost:3000/find/reset-password", form);
      setMessage(response.data.message);
      if (response.data.success) {
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ 비밀번호 변경 실패");
    }
  };

  return (
    <div className="reset-password-container">
      <h2>비밀번호 재설정</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} required readOnly />
        <input type="text" name="token" placeholder="이메일로 받은 인증 코드" value={form.token} onChange={handleChange} required />
        <input type="password" name="newPassword" placeholder="새 비밀번호" value={form.newPassword} onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="새 비밀번호 확인" value={form.confirmPassword} onChange={handleChange} required />
        <button type="submit">비밀번호 변경</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ResetPassword;
