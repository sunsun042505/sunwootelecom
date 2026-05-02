# Netlify Blobs 버전

이 버전은 Netlify Database 권한 오류를 피하기 위해 Netlify Blobs로 저장소를 변경한 버전이야.

기존 오류:
`database feature not available for this account`

해결:
- `@netlify/database` 제거
- `@netlify/blobs` 사용
- API 주소는 그대로 `/.netlify/functions/api`
- 화면 경로는 그대로 `/admincs/...`
