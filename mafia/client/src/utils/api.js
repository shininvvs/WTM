import axios from "axios";

export const loginUser = async (formData) => {
  try {
    const res = await axios.post("http://localhost:1227/login", formData);
    return res.data;
  } catch (error) {
    throw new Error("로그인 실패");
  }
};
