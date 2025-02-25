// 📁 mafia/client/src/components/register/Register.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/register/register.css";

const Register = () => {
  const [form, setForm] = useState({
    user_id: "",
    user_pwd: "",
    confirm_pwd: "",
    user_nickname: "",
    email: "",
    profile_img: null,
    user_gender: "male",
  });

  const [preview, setPreview] = useState("/uploads/profile_images/profile_default/default_m.png");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const navigate = useNavigate();

  // ✅ input 숨기고 이미지를 클릭하면 파일 선택창 열기 위해 Ref 사용
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "user_id") setIsIdChecked(false);
    if (e.target.name === "user_nickname") setIsNicknameChecked(false);
  };

  const handleGenderChange = (e) => {
    const gender = e.target.value;
    setForm({ ...form, user_gender: gender });

    if (!form.profile_img) {
      setPreview(gender === "female"
        ? "/uploads/profile_images/profile_default/default_f.png"
        : "/uploads/profile_images/profile_default/default_m.png"
      );
    }
  };

  // ✅ 프로필 이미지 선택 시 미리보기
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profile_img: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ 프로필 이미지 삭제
  const handleRemoveImage = () => {
    setForm({ ...form, profile_img: null });

    setPreview(form.user_gender === "female"
      ? "/uploads/profile_images/profile_default/default_f.png"
      : "/uploads/profile_images/profile_default/default_m.png"
    );
  };

  // ✅ 이미지 클릭 시 파일 선택 창 열기
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const checkUserId = async () => {
    if (!form.user_id) return setMessage("❌ 아이디를 입력하세요.");
    try {
      const response = await axios.get(`http://localhost:3000/register/check-id?user_id=${form.user_id}`);
      setMessage(response.data.message);
      setIsIdChecked(response.data.success);
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ 아이디 중복 확인 실패");
    }
  };

  const checkUserNickname = async () => {
    if (!form.user_nickname) return setMessage("❌ 닉네임을 입력하세요.");
    try {
      const response = await axios.get(`http://localhost:3000/register/check-nickname?user_nickname=${form.user_nickname}`);
      setMessage(response.data.message);
      setIsNicknameChecked(response.data.success);
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ 닉네임 중복 확인 실패");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.user_pwd !== form.confirm_pwd) return setMessage("❌ 비밀번호가 일치하지 않습니다.");
    if (!isIdChecked) return setMessage("❌ 아이디 중복 확인을 해주세요.");
    if (!isNicknameChecked) return setMessage("❌ 닉네임 중복 확인을 해주세요.");

    const formData = new FormData();
    formData.append("user_id", form.user_id);
    formData.append("user_pwd", form.user_pwd);
    formData.append("user_nickname", form.user_nickname);
    formData.append("email", form.email);
    formData.append("user_gender", form.user_gender);

    // ✅ 프로필 이미지 첨부
    if (form.profile_img) {
      formData.append("profile_img", form.profile_img);
    }

    try {
      const response = await axios.post("http://localhost:3000/register", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(response.data.message);
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("❌ 회원가입 요청 오류:", error);
      setMessage(error.response?.data?.message || "❌ 회원가입 실패");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">회원가입</h2>
      <form className="register-form" onSubmit={handleSubmit} encType="multipart/form-data">
        
        <div className="input-group">
          <input type="text" name="user_id" placeholder="아이디" value={form.user_id} onChange={handleChange} required />
          <button type="button" onClick={checkUserId} disabled={isIdChecked}>중복 확인</button>
        </div>

        <input type="password" name="user_pwd" placeholder="비밀번호" value={form.user_pwd} onChange={handleChange} required />
        <input type="password" name="confirm_pwd" placeholder="비밀번호 확인" value={form.confirm_pwd} onChange={handleChange} required />

        <div className="input-group">
          <input type="text" name="user_nickname" placeholder="닉네임" value={form.user_nickname} onChange={handleChange} required />
          <button type="button" onClick={checkUserNickname} disabled={isNicknameChecked}>중복 확인</button>
        </div>

        <input type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} required />

        <div className="gender-group">
          <input
            id="male"
            type="radio"
            name="user_gender"
            value="male"
            checked={form.user_gender === "male"}
            onChange={handleGenderChange}
          />
          <label htmlFor="male">남성</label>

          <input
            id="female"
            type="radio"
            name="user_gender"
            value="female"
            checked={form.user_gender === "female"}
            onChange={handleGenderChange}
          />
          <label htmlFor="female">여성</label>
        </div>       

        {/* ✅ 프로필 이미지 */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleFileChange} 
        />
        <img 
          src={preview}
          className="profile-preview" 
          onClick={handleImageClick} 
        />
        {preview && <button type="button" className="remove-img-button" onClick={handleRemoveImage}>삭제</button>}

        <button type="submit" disabled={isSuccess}>가입하기</button>
      </form>

      {message && <p className={isSuccess ? "success-message" : "error-message"}>{message}</p>}
      {isSuccess && <p>✅회원가입을 축하드립니다!</p>}
    </div>
  );
};

export default Register;
