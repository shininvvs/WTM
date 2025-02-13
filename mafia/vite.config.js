import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".", // 프로젝트 루트 (index.html 위치 기준)
  base: "/", // 기본 빌드 경로
  publicDir: "./public", // 정적 파일 경로
  build: {
    outDir: "./dist", // 빌드 결과물 저장 위치
    rollupOptions: {
      input: "index.html", // index.html 참조 경로
    },
  },
  server: {
    port: 1227, // 개발 서버 포트
    host: true, // 네트워크 접근 허용
    open: true, // 서버 시작 시 브라우저 자동 열기
    strictPort: true, // 포트가 사용 중이면 에러 발생
    historyApiFallback: true, // SPA 라우팅 지원
    proxy: {
      "/api": {
        target: "http://localhost:1227", // 백엔드 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [react()], // React 플러그인 사용
  resolve: {
    alias: {
      "@": "/client/src", // 별칭으로 client/src 폴더 접근
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"], // React 및 React-DOM 미리 번들링
  },
});
