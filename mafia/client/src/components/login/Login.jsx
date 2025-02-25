import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import '../../styles/login/login.css';

// ✅ Google & Kakao Client ID 하드코딩
const GOOGLE_CLIENT_ID = "289962664160-r6gs8liuposd1kieb1q67mjkm6838rfg.apps.googleusercontent.com";
const KAKAO_JAVASCRIPT_KEY = "6cb0d4a8b4e9113b778ff0cf92a5217f"; 

const Login = () => {
  const [form, setForm] = useState({ user_id: '', user_pwd: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      navigate('/lobby');
    }

    // ✅ 카카오 SDK 초기화 (중복 실행 방지)
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
    }
  }, [navigate]);

  // ✅ 로그인 입력값 변경 핸들러
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ 일반 로그인 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3000/login', form, { withCredentials: true });

      if (response.data.success) {
        localStorage.setItem("user_id", response.data.user.user_id);
        localStorage.setItem("user_nickname", response.data.user.user_nickname || '');
        localStorage.setItem("user_email", response.data.user.email || '');

        setMessage(`✅ 로그인 성공! ${response.data.user.user_nickname || ''}님 환영합니다!`);
        setTimeout(() => navigate('/lobby'), 1500);
      }
    } catch (error) {
      console.error("❌ 로그인 실패:", error);
      setMessage(error.response?.data?.message || '❌ 로그인 실패. 다시 시도해주세요.');
      setForm({ user_id: '', user_pwd: '' });
    }
  };

  // ✅ Google 로그인 핸들러
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const response = await axios.post('http://localhost:3000/auth/google', {
        google_id: decoded.sub,
        email: decoded.email,
        name: decoded.name
      }, { withCredentials: true });

      if (response.data.success) {
        localStorage.setItem("user_id", response.data.user.user_id);
        localStorage.setItem("user_nickname", response.data.user.user_nickname || '');
        localStorage.setItem("user_email", response.data.user.email || '');

        setMessage(`✅ Google 로그인 성공! ${response.data.user.user_nickname || ''}님 환영합니다!`);
        setTimeout(() => navigate('/lobby'), 1500);
      }
    } catch (error) {
      console.error("❌ Google 로그인 실패:", error);
      setMessage(error.response?.data?.message || '❌ Google 로그인 실패. 다시 시도해주세요.');
    }
  };

  // ✅ 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
  if (!window.Kakao) {
    console.error("❌ Kakao SDK가 로드되지 않았습니다.");
    setMessage("❌ 카카오 로그인 실패: SDK가 로드되지 않음.");
    return;
  }

  window.Kakao.Auth.login({
    scope: 'profile_nickname',
    success: async (authObj) => {

      // 🔥 1️⃣ 로그인 성공 후 액세스 토큰 저장
      const accessToken = window.Kakao.Auth.getAccessToken();
      localStorage.setItem("kakao_access_token", accessToken); // 🔹 토큰을 localStorage에 저장

      // 🔥 2️⃣ 카카오 사용자 정보 요청
      window.Kakao.API.request({
        url: '/v2/user/me',
        success: async (res) => {

          try {
            const response = await axios.post('http://localhost:3000/auth/kakao', {
              kakao_id: res.id,
              name: res.properties.nickname
            }, { withCredentials: true });

            if (response.data.success) {
              localStorage.setItem("user_id", response.data.user.user_id);
              localStorage.setItem("user_nickname", response.data.user.user_nickname || '');

              setMessage(`✅ 카카오 로그인 성공! ${response.data.user.user_nickname || ''}님 환영합니다!`);
              setTimeout(() => navigate('/lobby'), 1500);
            }
          } catch (error) {
            console.error("❌ 카카오 로그인 실패:", error);
            setMessage(error.response?.data?.message || '❌ 카카오 로그인 실패. 다시 시도해주세요.');
          }
        },
        fail: (err) => {
          console.error("❌ 카카오 사용자 정보 요청 실패:", err);
          setMessage("❌ 카카오 사용자 정보 요청 실패");
        }
      });
    },
    fail: (err) => {
      console.error("❌ 카카오 로그인 실패:", err);
      setMessage("❌ 카카오 로그인 실패. 다시 시도해주세요.");
    }
  });
};


  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-container">
        <h2 className="login-title">Who's the Mafia?</h2>

        {/* 일반 로그인 폼 */}
        <form className="login-form" onSubmit={handleSubmit}>
          <input 
            type="text" className="input-field"
            name="user_id" placeholder="아이디" 
            value={form.user_id} onChange={handleChange} required 
          />
          <input 
            type="password" className="input-field"
            name="user_pwd" placeholder="비밀번호" 
            value={form.user_pwd} onChange={handleChange} required 
          />
          <button type="submit" className="login-button">로그인</button>
        </form>

        {/* 로그인 메시지 출력 */}
        {message && (
          <p className={message.includes('✅') ? "success-message" : "error-message"}>
            {message}
          </p>
        )}

        {/* 회원가입 및 아이디/비밀번호 찾기 */}
        <div className="login-actions">
          <button className="register-button" onClick={() => navigate('/register')}>회원가입</button>
          <button className="find-id-button" onClick={() => navigate('/find-id')}>아이디 찾기</button>
          <button className="find-password-button" onClick={() => navigate('/reset-password-request')}>비밀번호 찾기</button>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="oauth-login">
          <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => setMessage('❌ Google 로그인 실패. 다시 시도해주세요.')} />
          <button className="kakao-login-button" onClick={handleKakaoLogin}>카카오 로그인</button>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
