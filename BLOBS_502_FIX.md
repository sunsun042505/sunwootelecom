# 502 수정

수정 이유:

Netlify Blobs를 `export async function handler(event)` 형태의 Lambda-compatible Function에서 사용할 때는
`connectLambda(event)`를 먼저 호출해야 함.

수정 내용:

```js
import { getStore, connectLambda } from "@netlify/blobs";

export async function handler(event) {
  connectLambda(event);
  const store = getStore(STORE_NAME);
}
```

또한 `getStore()`를 전역에서 만들지 않고, handler 내부에서 생성하도록 변경함.
