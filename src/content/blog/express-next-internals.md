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

Express에서 `router.get(path, handler)`처럼 미들웨어나 라우트를 등록하면, Express는 그 핸들러 함수를 `Layer`라는 객체로 감싸서 라우터 내부의 `stack`이라는 배열에 넣는다.

```js
function Layer(path, options, fn) {
  this.handle = fn; // 등록한 핸들러 함수 자체를 저장
  this.regexp = pathRegexp(path, ...); // path 매칭용 정규식
}
```

라우터 하나는 `stack = [Layer1, Layer2, Layer3, ...]` 형태의 배열로 이루어져 있고, 요청이 들어오면 이 배열을 순서대로 순회하면서 각 Layer 안의 핸들러를 실행한다. 이 배열을 순회하는 역할을 하는 게 `next`다.

## next 기본 동작

`express/lib/router/index.js`를 보면, 라우터 하나당 `next`라는 함수가 정의되어 있다. 이 함수는 `idx`(지금 몇 번째 Layer까지 진행했는지), `stack`(그 라우터의 Layer 배열), `req`, `res`를 클로저로 붙잡고 있다.

```js
var idx = 0;
var stack = self.stack; // Layer 객체들이 담긴 배열

function next(err) {
  var layer = stack[idx++]; // idx를 하나 올리고 그 위치의 Layer를 꺼낸다
  layer.handle_request(req, res, next); // 꺼낸 Layer에 "같은" next를 다시 넘긴다
}
```

미들웨어 A 안에서 부르는 `next`와 미들웨어 B가 받는 `next`는 서로 다른 함수가 아니라 동일한 함수를 참조한다. 요청 하나당 생성된 이 클로저 하나가 체인 전체에 계속 전달되면서 `idx`만 증가시킨다. `next()`를 호출한다는 건, 이 클로저 안의 `idx`를 1 늘리고 `stack[idx]`에 있는 Layer를 꺼내서 실행한다고 볼 수 있다.

## 에러 상황에서의 동작

`next(error)`처럼 인자를 넘기면 일반 미들웨어를 건너뛰고 에러 핸들러로 바로 넘어간다. 이걸 가능하게 하는 게 `handle_error`다.

```js
Layer.prototype.handle_error = function (error, req, res, next) {
  var fn = this.handle;         // Layer 생성자에서 저장해 둔 핸들러 함수
  if (fn.length !== 4) {        // 선언된 매개변수 개수가 4개가 아니면
    return next(error);         // 이 Layer는 건너뛰고 next를 다시 호출해 다음 Layer로
  }
  fn(error, req, res, next);    // 4개면 에러 핸들러로 실행
};
```

`next(error)`로 에러가 전파되는 중에, `next`가 `stack`을 순회하며 `fn.length !== 4`인 Layer를 계속 건너뛰다가 4개짜리를 만나면 멈춰서 그 핸들러를 실행한다. 반대로 에러가 없는 정상 흐름에서는 `handle_request`가 `fn.length > 3`인 Layer를 건너뛴다. 4개짜리 함수는 에러 핸들러로 간주해서 정상 흐름에서는 아예 호출하지 않는다.

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

정리하면, Express는 등록된 핸들러를 Layer라는 객체로 감싸 배열에 저장하고, `next`는 그 배열의 인덱스를 증가시키며 순회하는 클로저다. 에러가 전파되는 중인지 아닌지는 함수의 선언된 매개변수 개수(`.length`)로 구분한다.
