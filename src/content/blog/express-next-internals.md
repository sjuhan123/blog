---
title: Express next는 어떻게 동작할까?
excerpt: Express의 next()가 어떻게 체인을 순회하고 에러 핸들링을 하는지 간단히 알아보자.
publishDate: 'Oct 24 2026'
tags:
  - Tech
  - JavaScript
seo:
  description: Express의 next()가 Layer 배열을 순회하는 클로저라는 점과, 에러 핸들러 판별에 함수의 선언된 매개변수 개수(length)가 쓰이는 이유를 소스코드로 확인했다.
---

Express의 `next()`는 미들웨어 체인에서 다음 함수로 제어를 넘기는 함수다. 예를 들어 이런 라우트 등록 코드가 있다.

```js
router.get('/:id', authenticateToken, requireAdmin, getResource);
```

이 라우트로 요청이 오면 `authenticateToken`, `requireAdmin`, `getResource` 세 함수가 순서대로 실행된다. 각 함수는 `(req, res, next)`를 받고, 자기 할 일을 끝내면 `next()`를 호출해서 다음 함수로 넘긴다.

```js
const authenticateToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  req.user = await verifyToken(token);
  next();
};
```

토큰이 없으면 `next()`를 안 부르고 바로 응답을 끝내고, 있으면 검증 후 `next()`를 불러서 다음 함수로 넘어간다. 그런데 이 `next()`는 내부적으로 어떻게 동작할까?

## next 기본 동작

Express에서 `router.get(path, handler)`처럼 미들웨어나 라우트를 등록하면, Express는 그 핸들러 함수를 `Layer`라는 객체로 감싸서 라우터 내부의 `stack`이라는 배열에 넣는다.

```js
function Layer(path, options, fn) {
  this.handle = fn; // 등록한 핸들러 함수 자체를 저장
  this.regexp = pathRegexp(path, ...); // path 매칭용 정규식
}
```

라우터 하나는 `stack = [Layer1, Layer2, Layer3, ...]` 형태의 배열로 이루어져 있고, 요청이 들어오면 이 배열을 순서대로 순회하면서 각 Layer 안의 핸들러를 실행한다. 이 배열을 순회하는 역할을 하는 게 `next`다.

`express/lib/router/index.js`[^1]를 보면, 라우터 하나당 `next`라는 함수가 정의되어 있다. 이 함수는 `idx`(지금 몇 번째 Layer까지 진행했는지), `stack`(그 라우터의 Layer 배열), `req`, `res`를 클로저로 붙잡고 있다.

```js
var idx = 0;
var stack = self.stack; // Layer 객체들이 담긴 배열

function next(err) {
  var layer = stack[idx++]; // idx를 하나 올리고 그 위치의 Layer를 꺼낸다
  layer.handle_request(req, res, next); // 꺼낸 Layer에 "같은" next를 다시 넘긴다
}
```

미들웨어 A 안에서 부르는 `next`와 미들웨어 B가 받는 `next`는 서로 다른 함수가 아니라 동일한 함수를 참조한다. 요청 하나당 생성된 이 클로저 하나가 체인 전체에 계속 전달되면서 `idx`만 증가시킨다. `next()`를 호출한다는 건, 이 클로저 안의 `idx`를 1 늘리고 `stack[idx]`에 있는 Layer를 꺼내서 실행한다고 볼 수 있다.

## next(error)의 동작

위 `authenticateToken`에서 직접 에러 응답을 만드는 대신 `next(error)`로 넘기면 이렇게 쓸 수 있다.

```js
const authenticateToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return next({ status: 401, message: 'Unauthorized' }); // highlight-line

  req.user = await verifyToken(token);
  next();
};

router.get('/:id', authenticateToken, handler);

// 모든 라우터를 등록한 뒤, 맨 마지막에 추가하는 에러 핸들러
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});
```

앞서 본 `next`는 `err`를 받아도 그냥 무시하고 `handle_request`만 호출했다. 실제로는 `err`가 있으면 `handle_error`를, 없으면 `handle_request`를 호출한다.

```js
function next(err) {
  var layerError = err;
  var layer = stack[idx++];

  if (layerError) {
    layer.handle_error(layerError, req, res, next); // 있으면 handle_error로
  } else {
    layer.handle_request(req, res, next); // 없으면 handle_request로
  }
}
```

`authenticateToken`이 `next(error)`를 호출하면, 이 분기에 따라 다음 Layer의 `handle_error`가 호출된다.

```js
Layer.prototype.handle_error = function (error, req, res, next) {
  var fn = this.handle;         // Layer 생성자에서 저장해 둔 핸들러 함수
  if (fn.length !== 4) {        // 선언된 매개변수 개수가 4개가 아니면
    return next(error);         // 이 Layer는 건너뛰고 next를 다시 호출해 다음 Layer로
  }
  fn(error, req, res, next);    // 4개면 에러 핸들러로 실행
};
```

에러가 전파되는 동안 `handle_error`는 `fn.length !== 4`인 Layer마다 `next(error)`를 다시 불러 건너뛰다가, 4개짜리 핸들러를 만나면 멈춰서 실행한다. 반대로 에러가 없는 정상 흐름에서는 `handle_request`가 `fn.length > 3`인 Layer를 건너뛴다. 4개짜리 함수는 에러 핸들러로 간주해서 정상 흐름에서는 아예 호출하지 않는다.

```js
// 핸들러 예시
function a(req, res, next) {}
function b(err, req, res, next) {}
function c(req, res = {}, next) {}

a.length; // 3
b.length; // 4 -> 4개면 에러 핸들러로 실행
c.length; // 1 -> 기본값 있는 매개변수를 만나면 거기서 세기를 멈춘다
```

<details>
<summary><span class="mdx-note-tag">참고</span><span class="mdx-note-title">length는 왜 기본값 있는 매개변수에서 멈추는가</span></summary>

`function c(req, res = {}, next) {}`의 `length`가 1인 이유는, `Function.prototype.length`가 이 함수를 호출할 때 **반드시** 줘야 하는 인자의 개수를 나타내도록 스펙에 정의돼 있기 때문이다. 기본값이 있는 매개변수는 정의상 생략 가능한 매개변수라서, 그 뒤에 일반 매개변수가 더 있어도 필수 인자로 셀 수 없다. 기본값을 만나는 순간 그 뒤는 전부 선택적인 걸로 취급해서 카운트를 멈춘다. rest 파라미터(`...args`)도 같은 이유로 안 센다. 몇 개가 들어올지 애초에 정해져 있지 않으니 필수 개수에 포함시킬 수가 없다.

그래서 Express의 에러 핸들러 판별(`fn.length !== 4`)은 `(err, req, res, next)`처럼 넷 다 기본값 없이 선언했을 때만 정확히 동작한다. `(err, req, res, next = () => {})`처럼 중간에 기본값을 넣으면 `length`가 3으로 줄어들어서, 매개변수는 4개를 받게 작성했어도 Express는 이걸 에러 핸들러로 인식하지 못한다.

</details>

그래서 각 미들웨어는 에러 응답을 직접 처리할 필요 없이 `next(error)`만 호출하면 되고, 맨 끝의 에러 핸들러에서 에러 응답을 한 번에 처리하면 된다.

정리하면, Express는 등록된 핸들러를 Layer라는 객체로 감싸 배열에 저장하고, `next`는 그 배열의 인덱스를 증가시키며 순회하는 클로저다. 에러가 전파되는 중인지 아닌지는 `next`에 넘어온 값으로 구분하고, 지금 Layer가 그 에러를 처리할 자격이 있는지는 함수의 선언된 매개변수 개수(`.length`)로 구분한다.

[^1]: Express 4.19.2 버전 소스 참고. https://github.com/expressjs/express/blob/4.19.2/lib/router/index.js
