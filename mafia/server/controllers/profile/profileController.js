const uploadDir = "uploads/profile_images/users"; // ✅ users 폴더로 수정
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ✅ 프로필 이미지 변경 API (PUT 방식)
export const updateProfileImage = async (req, res) => {
  try {
    upload.single("profile_img")(req, res, async (err) => {
      if (err) return res.status(400).json({ success: false, message: '❌ 파일 업로드 실패' });

      const { user_id } = req.body;
      if (!user_id) return res.status(400).json({ success: false, message: "❌ 유저 ID가 필요합니다." });

      const oldProfileImage = await getUserProfileImage(user_id);

      if (!req.file) {
        return res.status(400).json({ success: false, message: "❌ 새 프로필 이미지를 업로드하세요." });
      }

      // ✅ users 폴더에 저장된 이미지 URL 생성
      const newProfileImage = `/uploads/profile_images/users/${req.file.filename}`;

      if (oldProfileImage && oldProfileImage !== "/uploads/profile_images/profile_default/default.png") {
        const oldImagePath = path.join(process.cwd(), oldProfileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      await updateUserProfileImage(user_id, newProfileImage);

      return res.status(200).json({ success: true, message: "✅ 프로필 이미지가 변경되었습니다.", profile_img: newProfileImage });
    });
  } catch (error) {
    console.error("❌ 프로필 이미지 변경 오류:", error);
    return res.status(500).json({ success: false, message: "❌ 서버 오류 발생", error: error.message });
  }
};
