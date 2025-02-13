import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/register/register.css";

const Register = () => {
  const [form, setForm] = useState({ user_id: "", user_pwd: "", confirm_pwd: "", user_nickname: "", email: "" });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "user_id") setIsIdChecked(false);
    if (e.target.name === "user_nickname") setIsNicknameChecked(false);
    if (e.target.name === "email") setIsEmailChecked(false);
  };

  // ✅ 아이디 중복 확인
  const checkUserId = async () => {
    if (!form.user_id) return setMessage("❌ 아이디를 입력하세요.");
    try {
      const response = await axios.get("http://localhost:3000/register/check-id", { params: { user_id: form.user_id } });
      response.data.success ? setMessage("✅ 사용 가능한 아이디입니다.") : setMessage("❌ 이미 사용 중인 아이디입니다.");
      setIsIdChecked(response.data.success);
    } catch {
      setMessage("❌ 아이디 중복 확인 중 오류 발생");
    }
  };

  // ✅ 닉네임 중복 확인
  const checkNickname = async () => {
    if (!form.user_nickname) return setMessage("❌ 닉네임을 입력하세요.");
    try {
      const response = await axios.get("http://localhost:3000/register/check-nickname", { params: { user_nickname: form.user_nickname } });
      response.data.success ? setMessage("✅ 사용 가능한 닉네임입니다.") : setMessage("❌ 이미 사용 중인 닉네임입니다.");
      setIsNicknameChecked(response.data.success);
    } catch {
      setMessage("❌ 닉네임 중복 확인 중 오류 발생");
    }
  };

  // ✅ 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.user_pwd !== form.confirm_pwd) return setMessage("❌ 비밀번호가 일치하지 않습니다.");
    if (!isIdChecked) return setMessage("❌ 아이디 중복 확인을 해주세요.");
    if (!isNicknameChecked) return setMessage("❌ 닉네임 중복 확인을 해주세요.");
    try {
      const response = await axios.post("http://localhost:3000/register", form, { withCredentials: true });
      setMessage(response.data.message);
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ 회원가입 실패");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">회원가입</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        {/* 아이디 입력 및 중복 확인 */}
        <div className="input-group">
          <input type="text" className="input-field" name="user_id" placeholder="아이디" value={form.user_id} onChange={handleChange} required />
          <button type="button" className="check-button" onClick={checkUserId} disabled={isIdChecked}>중복 확인</button>
        </div>

        {/* 비밀번호 입력 */}
        <input type="password" className="input-field" name="user_pwd" placeholder="비밀번호" value={form.user_pwd} onChange={handleChange} required />
        <input type="password" className="input-field" name="confirm_pwd" placeholder="비밀번호 확인" value={form.confirm_pwd} onChange={handleChange} required />

        {/* 닉네임 입력 및 중복 확인 */}
        <div className="input-group">
          <input type="text" className="input-field" name="user_nickname" placeholder="닉네임" value={form.user_nickname} onChange={handleChange} required />
          <button type="button" className="check-button" onClick={checkNickname} disabled={isNicknameChecked}>중복 확인</button>
        </div>

        {/* ✅ 이메일 입력 */}
        <div className="input-group">
          <input type="email" className="input-field" name="email" placeholder="이메일" value={form.email} onChange={handleChange} required />
        </div>

        <button type="submit" className="submit-button" disabled={isSuccess}>가입하기</button>
      </form>

      {message && <p className={isSuccess ? "success-message" : "error-message"}>{message}</p>}
      {isSuccess && <p className="redirect-message">✅ 2초 후 로그인 페이지로 이동합니다...</p>}

      <button className="login-button" onClick={() => navigate("/")} disabled={isSuccess}>로그인 페이지로 이동</button>
    </div>
  );
};

export default Register;
