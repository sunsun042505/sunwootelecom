# admincs 폴더 구조 적용

변경된 구조:

```text
neverlab-telecom/
├─ index.html
├─ admincs/
│  ├─ login.html
│  ├─ signup.html
│  └─ dashboard.html
├─ netlify/
│  └─ functions/
│     ├─ api.js
│     └─ _db.js
├─ package.json
├─ netlify.toml
└─ README.md
```

접속 주소:

- `/admincs/signup.html`
- `/admincs/login.html`
- `/admincs/dashboard.html`

루트 `/`로 접속하면 `/admincs/login.html`로 자동 이동하게 해놨어.
