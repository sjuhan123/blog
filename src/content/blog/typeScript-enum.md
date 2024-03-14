---
title: enum 타입
excerpt: 스터디 중 타입스크립트 enum 타입에 대해 대화한 내용을 정리한 글입니다.
publishDate: 'Nov 10 2023'
tags:
  - TypeScript
seo:
  image:
    src: '/post-2.jpg'
    alt: TypeScript enum 타입
---

## Tree-shaking?

- 사용하지 않는 코드를 삭제하는 기능
- 아무 데서도 import하지 않은 모듈이나 사용하지 않는 코드를 삭제해서 번들 크기를 줄여 페이지가 표시되는 시간을 단축할 수 있다.

tree-shaking 이름과 개념은 Rollup에 의해 대중화되었다고 한다.
Rollup 문서에서 tree-shaking 부분을 살펴보면 rollup은 ES 모듈을 사용할 수 있게 해줄 뿐만 아니라 가져오는 코드를 정적으로 분석하고 최적화해서 실제로 사용되지 않는 것은 제외해준다. 그래서 종속성을 추가하거나 프로젝트의 크기를 늘리지 않고도 기존 도구와 모듈을 기반으로 빌드할 수 있다.~~(마지막 문장이 좀 이해가 되지 않는다)~~

예를 들어서, CommonJS는 의존성을 import할 때, 의존성 전부를 import하게 된다.

반면, ES module에서는 아래 예시로 보면 "node:utils" 모듈을 전부 import하지 않고 ajax 함수만 import 할 수 있다.

```js
// import the ajax function with an ES import statement
import { ajax } from 'node:utils';
var query = 'Rollup';
// call the ajax function
ajax('https://api.example.com?search=' + query).then(handleResponse);
```

## enum 사용시 tree-shaking 여부

다시 돌아와서 enum에 대해 알아보면,

- 멤버라 불리는 명명된 값의 집합을 이루는 자료형으로 기억하기 어려운 숫자 대신 친숙한 이름으로 접근/사용하기 위해 활용할 수 있다.
- 열거된 각 멤버는 별도의 값이 설정되지 않은 경우 기본적으로 0부터 시작한다.

```ts
enum Team {
  Manager, // 0
  Planner, // 1
  Developer, // 2
  Designer // 3
}

let sarha: number = Team.Designer;
```

enum의 기능만 보면 편리해보인다. 하지만 enum은 치명적인 단점이 있다.

```ts
var Team;
(function (Team) {
  Team[(Team['Manager'] = 101)] = 'Manager';
  Team[(Team['Planner'] = 208)] = 'Planner';
  Team[(Team['Developer'] = 302)] = 'Developer';
  Team[(Team['Designer'] = 303)] = 'Designer';
})(Team || (Team = {}));

var yamoo9 = Team.Manager;
var sarha = Team.Designer;
```

위 코드는 첫 번째 예시를 컴파일한 코드인데, enum의 경우 JavaScript에 존재하지 않는 것을 구현하기 위해 TypeScript 컴파일러는 IIFE(즉시 실행 함수)를 포함한 코드를 생성한다.

그런데 Rollup과 같은 번들러는 즉시실행함수의 경우 "사용하지 않는 코드"라고 판단할 수 없어서 Tree-shaking이 되지 않는다.

## 참고

- https://yamoo9.gitbook.io/typescript/types/enum
- https://engineering.linecorp.com/ko/blog/typescript-enum-tree-shaking
