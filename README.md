# 네버랩텔레콤 CS 프로그램 - Netlify Blobs 버전

Netlify Database가 계정 권한 문제로 막힐 때 쓰는 버전이야.

## 구조

```text
neverlab-telecom/
├─ index.html
├─ admincs/
│  ├─ login.html
│  ├─ signup.html
│  └─ dashboard.html
├─ netlify/
│  └─ functions/
│     └─ api.js
├─ package.json
└─ netlify.toml
```

## 접속 주소

- `/admincs/signup.html`
- `/admincs/login.html`
- `/admincs/dashboard.html`

루트 `/` 접속 시 `/admincs/login.html`로 자동 이동해.

## 저장 방식

- Netlify Functions에서 `@netlify/blobs`를 사용함
- 데이터는 `neverlab-telecom-cs` store의 `main` key에 JSON으로 저장됨
- 지점, 직원, 세션, 고객, 로그가 모두 이 JSON 안에 들어감

## 주의

이건 프로토타입용이야.
Netlify Blobs는 공식 문서상 key/value store나 basic database처럼 쓸 수 있지만,
자주 쓰는 대규모 DB보다는 읽기 많고 쓰기 적은 데이터에 더 맞아.
실서비스로 키우려면 Neon, PlanetScale, Firebase, Railway 같은 외부 DB가 더 적합해.


## 번호이동 기능 추가

- 대시보드에 `번호이동` 메뉴 추가
- `/admincs/mobilesignup.html` 추가
- 사전 확인 항목:
  - 약정여부
  - 요금제
  - 복지할인여부
  - 현역병여부
- 가입신청서 항목:
  - 제목
  - 이름
  - 주민번호 앞 7자리
  - 전화번호
  - 기존 통신사
- 신분증 촬영 단계
- 서명 단계
- 완료 화면


## 요금제 100개 추가

다음 화면의 요금제 선택 목록을 100개로 확장함.

- 대시보드 > 번호이동 사전 확인
- 대시보드 > 신규가입 사전 확인
- 기기변경 신청서 > 요금제 선택

백엔드 `planPrices`에도 동일한 100개 요금제를 추가해서 신규가입/번호이동 완료 시 회선 등록이 정상 동작함.

목록 파일:
- `admincs/PLAN_CATALOG_100.md`
- `admincs/plan-catalog.js`
