# 배포 오류 수정 안내

이 버전에서 수정한 것:

1. `package.json`
   - 기존: `"@netlify/database": "^0.1.0"`
   - 수정: `"@netlify/database": "latest"`

2. `netlify.toml`
   - 기존 build command가 `npm install`이라 Netlify dependency install 이후 또 npm install을 실행했음
   - 수정: `echo "static html app"`

Netlify 공식 문서는 `npm install @netlify/database` 설치 방식을 안내하고 있어서,
특정 존재하지 않는 버전으로 고정하면 ETARGET 오류가 발생할 수 있어.
