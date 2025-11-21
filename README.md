# pyxis-faqchatbot-frontend-react

소상공인 지원을 위한 챗봇 웹페이지의 프론트엔드 파트입니다.

## 빌드 전 실행 시 참고해야할 점
1. gitignore로 설정된 node_modules 생성필요
 - 외부 경로를 통해 node.js를 설치
 - 터미널에서 'npm install' 명령어를 통해 package에 지정된 라이브러리 다운로드

2. gitignore로 설정된 '.env'의 개별작성 필요
 - src/ 경로에 파일명 '.env' 생성
 - 파일내에 VITE_API_BASE_URL= (백엔드url 주소) 작성

3. 개발서버 실행은 'npm run dev'로 실행