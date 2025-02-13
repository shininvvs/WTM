import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/find/find.css";

const FindID = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post("http://localhost:3000/find/find-id", { email });

      if (response.data.success) {
        setMessage(`✅ 아이디: ${response.data.user_id}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ 아이디 찾기 실패");
    }
  };

  return (
    <div className="find-container">
      <h2>아이디 찾기</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="가입한 이메일 입력" 
          required 
        />
        <button type="submit">아이디 찾기</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate("/")}>로그인 페이지로 이동</button>
    </div>
  );
};

export default FindID;
