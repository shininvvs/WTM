import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // ✅ 페이지 이동을 위한 useNavigate 추가
import axios from "axios";
import "../../styles/find/resetPasswordRequest.css";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();  // ✅ useNavigate 설정

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/find/request-reset-password", { email });
      setMessage(response.data.message);

      // ✅ 인증 코드 요청 성공 시, 인증 코드 입력 페이지로 이동 (이메일 정보 전달)
      if (response.data.success) {
        setTimeout(() => navigate(`/reset-password?email=${email}`), 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ 이메일 전송 실패");
    }
  };

  return (
    <div className="reset-password-container">
      <h2>비밀번호 재설정 요청</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="이메일을 입력하세요" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">인증 코드 요청</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ResetPasswordRequest;
