# 네버랩텔레콤 CS 프로그램

Netlify Database + Netlify Functions 기반 지점 CS 프로그램이야.

## 포함 파일

- `login.html` 로그인
- `signup.html` 지점/직원 가입
- `dashboard.html` 고객조회, 개통/해지, 요금관리, 사용량, 로그
- `netlify/functions/api.js` 백엔드 API
- `netlify/functions/_db.js` DB 연결/테이블 생성/공통 함수

## GitHub + Netlify 배포

1. 이 ZIP 압축 풀기
2. GitHub 새 저장소 만들기
3. 파일 전체 업로드
4. Netlify에서 GitHub 저장소 연결
5. Netlify Database 활성화
6. Deploy
7. 사이트 주소에서 `/signup.html` 접속
8. 지점 가입 → 직원 가입 → 로그인

## 로컬 테스트

Netlify Database는 Netlify 환경에서 가장 잘 동작해.
로컬에서 테스트하려면 Netlify CLI 로그인 및 사이트 연결이 필요해.

```bash
npm install
npx netlify dev
```

## 주의

이 버전은 재미/프로토타입용이야.
비밀번호는 서버에서 PBKDF2 해시로 저장하지만, 실서비스 수준으로 가려면
비밀번호 재설정, 권한 세분화, 세션 만료, 감사 로그, HTTPS 강제 정책을 더 붙이는 게 좋아.
