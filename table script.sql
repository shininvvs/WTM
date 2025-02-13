-- 데이터베이스 선택
USE mafia;

-- 기존 테이블 삭제 (존재할 경우)
DROP TABLE IF EXISTS tb_user;
DROP TABLE IF EXISTS rooms;

-- ✅ 사용자 테이블 생성
CREATE TABLE tb_user (
    user_id VARCHAR(255) PRIMARY KEY,      -- 사용자 ID (고유값, 기본키)
    user_pwd VARCHAR(255) NULL,            -- 비밀번호 (암호화 저장) (소셜 로그인 사용자는 NULL 가능)
    user_nickname VARCHAR(255) NOT NULL UNIQUE, -- 닉네임 (고유값)
    email VARCHAR(255) UNIQUE NOT NULL,    -- 이메일 (고유값, 중복 방지)
    total_games INT DEFAULT 0,             -- 총 게임 수 (기본값 0)
    wins INT DEFAULT 0,                     -- 승리 횟수 (기본값 0)
    loses INT DEFAULT 0,                    -- 패배 횟수 (기본값 0)
    enroll_date DATETIME DEFAULT CURRENT_TIMESTAMP, -- 가입 날짜
    user_status VARCHAR(1) DEFAULT 'Y' CHECK (user_status IN ('Y', 'N')), -- 상태 (Y: 활성, N: 차단)
    
    -- ✅ 소셜 로그인 관련 컬럼 추가
    social_type VARCHAR(10) NULL CHECK (social_type IN ('google', 'kakao', NULL)), -- 로그인 타입 (google, kakao, 일반 로그인)
    social_id VARCHAR(255) NULL UNIQUE,  -- 소셜 로그인 ID (google_id, kakao_id)
    profile_image VARCHAR(255) NULL,     -- 소셜 로그인 프로필 이미지
    
    -- ✅ 비밀번호 재설정 관련 컬럼 (일반 로그인 전용)
    reset_token VARCHAR(255) NULL,       -- 비밀번호 재설정 인증 코드
    reset_token_expiry DATETIME NULL     -- 토큰 만료 시간
);

-- ✅ 사용자 샘플 데이터 추가 (일반 로그인)
INSERT INTO tb_user (user_id, user_pwd, user_nickname, email, total_games, wins, loses, enroll_date, user_status)
VALUES ('user123', 'password123', 'nickname1', 'user123@example.com', DEFAULT, DEFAULT, DEFAULT, NOW(), DEFAULT);

-- ✅ 사용자 샘플 데이터 추가 (구글 로그인 사용자)
INSERT INTO tb_user (user_id, user_pwd, user_nickname, email, social_type, social_id, profile_image, enroll_date, user_status)
VALUES ('google_456', NULL, 'googleUser', 'googleuser@example.com', 'google', '123456789', 'https://lh3.googleusercontent.com/a/default-user.jpg', NOW(), DEFAULT);

-- ✅ 사용자 샘플 데이터 추가 (카카오 로그인 사용자)
INSERT INTO tb_user (user_id, user_pwd, user_nickname, email, social_type, social_id, profile_image, enroll_date, user_status)
VALUES ('kakao_789', NULL, 'kakaoUser', 'kakaouser@example.com', 'kakao', '987654321', 'https://k.kakaocdn.net/dn/default-profile.jpg', NOW(), DEFAULT);

-- ✅ 사용자 데이터 확인
SELECT * FROM tb_user;


-- ✅ 방 테이블 생성
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY, -- 방 ID (자동 증가)
    room_name VARCHAR(255) NOT NULL,        -- 방 이름
    room_pwd VARCHAR(20),                   -- 방 비밀번호 (옵션)
    current_users INT DEFAULT 1             -- 현재 방에 있는 사용자 수 (기본값 1)
);

-- ✅ 방 샘플 데이터 추가
INSERT INTO rooms (room_name, room_pwd) VALUES ('놀자', '1234');
INSERT INTO rooms (room_name) VALUES ('마피아 할 사람');

-- ✅ 방 데이터 확인
SELECT * FROM rooms;
