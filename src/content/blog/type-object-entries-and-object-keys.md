---
title: Object.entries, Object.keys 타입추론
excerpt: 프로젝트 진행 중 Object.entries 할 때 타입 추론이 되지 않아서 정리한 글입니다.
publishDate: 'Mar 15 2024'
tags:
  - TypeScript
seo:
  image:
    src: '/post-2.jpg'
    alt: Object.entries, Object.keys 타입추론
---

서버에서 받아온 데이터를 Object.entries / Object.keys 사용해서 가공할 때 타입 추론이 의도대로 되지 않아 불편할 때가 있습니다. 아래의 객체 데이터를 가지고 불편한 부분과 해결 방법을 정리해보겠습니다.

```ts
const post = {
  id: 1,
  status: true,
  data: {
    date: '2021-01-01',
    content: '오늘 글의 주제는 Object.entries()와 Object.keys()'
  }
} as const;
```

## Object.keys

```ts
const keys = Object.keys(post);
//    ^? const keys: string[]
```

`readonly`로 타입을 지정했기 때문에 `Object.keys`를 사용하면 `("id" | "status" | "data")[]` 타입으로 추론될 것 같지만, 실제로는 `string[]` 타입으로 추론됩니다.

`("id" | "status" | "data")[]`로 추론하고 싶은 경우가 생긴다면 어떻게 하면 될까요?

```ts
const keys = Object.keys(post) as (keyof typeof post)[];
//    ^? const keys: ("id" | "status" | "data")[]
```

`keyof` 연산자를 사용해서 타입을 추출하고, 타입 단언을 사용해서 타입을 지정해주면 됩니다. 만약 프로젝트에서 `Object.keys`를 사용하는 경우가 많다면, 아래와 같이 유틸함수를 만들어서 사용할 수도 있습니다.

```ts
function keysFromObject<T extends object>(object: T): (keyof T)[] {
  return Object.keys(object) as (keyof T)[];
}

const keys = Object.keys(post) as (keyof typeof post)[];
//    ^? const keys: ("id" | "status" | "data")[]
```

## Object.entries

Object.entries를 사용할 때도 비슷한 문제가 발생합니다. 반환 값에서 `value`는 정상적으로 추론되지만 `key`는 string으로 추론됩니다.

```ts
const date = Object.entries(posts).map(([key, value]) => [key, value]);
//                                       ^? (parameter): (string)[]
```

`key`의 타입을 추론하고 싶다면 어떻게 해야할까요? `Object.keys`와 마찬가지로 `keyof` 연산자를 사용해서 타입을 추출하고, 타입 단언을 사용해서 타입을 지정해주면 됩니다. 다만, `Object.entries`의 경우에는 `Object.keys`보다 좀 더 복잡해서, 내부 동작을 이해하고 사용하는 것이 좋습니다.

```js
// MDN Object.entries polyfill

if (!Object.entries)
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      // 배열의 길이 결정
      resArray = new Array(i);

    // !! 이부분이 중요합니다.
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
```

위에서 !! 표시한 부분을 고려해서 `Entries` 타입을 정의해주면 됩니다.

```ts
type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

const posts = (Object.entries(post) as Entries<typeof post>).map(
  ([key, value]) => [key, value]
  // ^? (parameter) key: "id" | "status" | "data"
);
```

하지만, polyfill을 보고 선언한 타입 `Entries`를 봐도 이해하기가 어려워...(저만 그런가요?) 하나씩 타입을 뜯어보면서 이해해보겠습니다.

```ts
// 예시 코드
type MyObj = {
  name: string;
  age: number;
};

type Keys = keyof MyObj; // "name" | "age"

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
};

type Result = A<MyObj>;
// Result: { name: [ "name", string ], age: [ "age", number ] }
```

우선, `Entries`는 `T` 타입의 키와 값으로 이루어진 튜플의 배열을 반환하는 타입입니다. 이를 위해, 맵 타입(Mapped Type)인 `{ [K in keyof T]: [K, T[K]] }`를 사용합니다.

```ts
type Entries<T> = {
  [K in keyof T]: [K, T[K]]; // 각 속성을 [K, T[K]] 형태의 튜플로 매핑
}[keyof T]; // T의 모든 속성에 대한 배열을 얻음

type Result = Entries<MyObj>;
// Result: ["name", string] | ["age", number] | ["isAdmin", boolean]]
```

그리고 인덱스 타입(Index Type)을 활용한 `[keyof T]`를 사용해서 `Entries` 타입을 정의하면 됩니다. `[keyof T]`를 사용하면 T 타입의 모든 속성 키의 유니온 타입을 얻을 수 있습니다.

그리고 최종적으로 배열로 감싸주면 `Entries` 타입이 완성됩니다.

`Object.entries`도 마찬가지로 유틸함수를 만들어서 사용할 수 있습니다.

```ts
function entriesFromObject<T extends object>(object: T): Entries<T> {
  return Object.entries(object) as Entries<T>;
}

const posts = entriesFromObject(post).map(
  ([key, value]) => [key, value]
  // ^? (parameter) key: "id" | "status" | "data"
);
```

## 참고

- [MDN Object.entries](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
