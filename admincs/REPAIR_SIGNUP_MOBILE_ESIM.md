# 수리 내역

- 신규가입 `telecomsignup.html` 전체 재작성
- 번호이동 `mobilesignup.html` 전체 재작성
- `phone` 같은 전역 충돌 가능성이 있는 id/변수명 제거
- 번호이동에도 USIM/eSIM 선택 단계 추가
- 카메라 테스트가 어려운 환경을 위해 임시 촬영 처리 버튼 추가

배포 후 브라우저 캐시 때문에 예전 파일이 보이면:
- Netlify에서 Clear cache and deploy site
- 브라우저 강력 새로고침
- `/admincs/telecomsignup.html?v=repair1`
- `/admincs/mobilesignup.html?v=repair1`
