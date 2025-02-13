import { checkUserIdService, checkUserNicknameService, checkUserEmailService, saveUserToDatabase } from '../../services/register/registerService.js';
import bcrypt from 'bcrypt';

// ✅ 아이디 중복 체크 API (GET 방식)
export const checkUserId = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ success: false, message: '❌ 아이디를 입력하세요.' });
    }

    const isDuplicate = await checkUserIdService(user_id);
    if (isDuplicate) {
      return res.status(200).json({ success: false, message: '❌ 이미 사용 중인 아이디입니다.' });
    }

    return res.status(200).json({ success: true, message: '✅ 사용 가능한 아이디입니다.' });
  } catch (error) {
    console.error('❌ 아이디 중복 확인 오류:', error);
    return res.status(500).json({ success: false, message: '❌ 서버 오류 발생', error: error.message });
  }
};

// ✅ 닉네임 중복 체크 API (GET 방식)
export const checkUserNickname = async (req, res) => {
  try {
    const { user_nickname } = req.query;
    if (!user_nickname) {
      return res.status(400).json({ success: false, message: '❌ 닉네임을 입력하세요.' });
    }

    const isDuplicate = await checkUserNicknameService(user_nickname);
    if (isDuplicate) {
      return res.status(200).json({ success: false, message: '❌ 이미 사용 중인 닉네임입니다.' });
    }

    return res.status(200).json({ success: true, message: '✅ 사용 가능한 닉네임입니다.' });
  } catch (error) {
    console.error('❌ 닉네임 중복 확인 오류:', error);
    return res.status(500).json({ success: false, message: '❌ 서버 오류 발생', error: error.message });
  }
};

// ✅ 이메일 중복 체크 API (GET 방식)
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: '❌ 이메일을 입력하세요.' });
    }

    const isDuplicate = await checkUserEmailService(email);
    if (isDuplicate) {
      return res.status(200).json({ success: false, message: '❌ 이미 등록된 이메일입니다.' });
    }

    return res.status(200).json({ success: true, message: '✅ 사용 가능한 이메일입니다.' });
  } catch (error) {
    console.error('❌ 이메일 중복 확인 오류:', error);
    return res.status(500).json({ success: false, message: '❌ 서버 오류 발생', error: error.message });
  }
};

// ✅ 회원가입 API (POST 방식)
export const register = async (req, res) => {
  try {
    const { user_id, user_pwd, user_nickname, email } = req.body;

    if (!user_id || !user_pwd || !user_nickname || !email) {
      return res.status(400).json({ success: false, message: '❌ 모든 필드를 입력하세요.' });
    }

    // ✅ 아이디 중복 체크
    const isDuplicateId = await checkUserIdService(user_id);
    if (isDuplicateId) {
      return res.status(400).json({ success: false, message: '❌ 이미 존재하는 아이디입니다.' });
    }

    // ✅ 닉네임 중복 체크
    const isDuplicateNickname = await checkUserNicknameService(user_nickname);
    if (isDuplicateNickname) {
      return res.status(400).json({ success: false, message: '❌ 이미 존재하는 닉네임입니다.' });
    }

    // ✅ 이메일 중복 체크
    const isDuplicateEmail = await checkUserEmailService(email);
    if (isDuplicateEmail) {
      return res.status(400).json({ success: false, message: '❌ 이미 존재하는 이메일입니다.' });
    }

    // ✅ 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(user_pwd, 10);

    // ✅ DB에 저장
    const saveResult = await saveUserToDatabase(user_id, hashedPassword, user_nickname, email);
    if (!saveResult) {
      return res.status(500).json({ success: false, message: '❌ 회원가입 실패: 데이터 저장 오류' });
    }

    return res.status(201).json({ success: true, message: '✅ 회원가입 성공!' });

  } catch (error) {
    console.error('❌ 회원가입 오류:', error);
    return res.status(500).json({ success: false, message: '❌ 서버 오류 발생', error: error.message });
  }
};
