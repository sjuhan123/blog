---
title: 나만의 CLI 기반 CRA 제작기 2, 에러 대응
excerpt: CRA(create-react-app) 대체제 구현 중 만난 에러 대응하기
publishDate: 'Sep 5 2023'
tags:
  - React
seo:
  image:
    src: '/post-2.jpg'
    alt: 나만의 CLI 기반 CRA 제작기 2, 에러 대응
---

[1편 - 나만의 CLI 기반 CRA 제작기 - 구현 및 배포](https://den-eight.vercel.app/blog/cra-boilerplate-1/)

1편의 코드를 살펴보면, CommonJS Module 시스템을 사용하고 있다는 점을 확인할 수 있습니다. 이전 글에서는 언급하지 않았지만, 사실 프로젝트를 처음 구현할 때는 ES Module 시스템을 선택하여 시작했습니다. 그런데 구현 중 오류를 마주하게 되었고, 이에 대한 해결을 위해 시스템을 전환하게 되었습니다. 이번 포스팅에서는 이러한 전환의 배경과 이유에 대해 다뤄보겠습니다.

# JavaScript에서의 JSON 모듈

Node.js는 `import` 구문을 사용했을 때 기본적으로 자바스크립트 코드가 넘어올 것을 예상합니다.
그래서 프로젝트 package.json 파일을 JS로 import해서 `name`과 `version` 필드를 사용하려고 하면, `Json` 객체를 `import` 할 수 없으니 `assertion of type "json"` 사용을 요청하는 에러 문구가 출력됩니다.

`TypeError [ERR_IMPORT_ASSERTION_TYPE_MISSING]: Module "file:///Users/hanseungju/create-den-app/package.json" needs an import assertion of type "json"`

```js
import packageJson from '../package.json'; // 에러!

const program = new Command();

program.description(packageJson.name).version(packageJson.version);
```

## JSON 모듈 제안

[JSON 모듈 제안](https://github.com/tc39/proposal-json-modules)의 핵심은 일반 `import` 구문을 사용하여 JSON 데이터를 ES 모듈로 가져오는 것을 가능하게끔 만들어 줍니다.
이 제안에서는 가져오기 선언(`import assertion`)을 사용해서 JSON 객체 타입을 ES모듈로 가져올 것을 제안합니다.

```js
import packageJson from '../package.json' assert { type: 'json' };
```

근데 JSON 모듈은 아직 [experimental 스펙](https://nodejs.org/api/esm.html#esm_experimental_json_modules)이기 때문에, 명령어를 통해 JSON 모듈을 활성화해야지 사용할 수 있습니다.

```js
node --experimental-json-modules index.js
```

하지만, 이 명령어를 입력하고 나서 프로젝트를 실행해도 여전히 JSON modules는 experimental 스펙이라는 경고문이 뜹니다.

```js
❯ node --experimental-json-modules create-den-app.js
(node:135) ExperimentalWarning: Importing JSON modules is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
```

사용자가 애플리케이션을 실행했는데 저런 문구를 보여지기를 원치 않는데...
그래서 다른 대안들을 찾아봤지만, 마땅히 눈에 들어오는 해결책이 없었고..

결국, ES Module 시스템이 아닌 JSON 가져오기를 지원하는 CommonJS Module 시스템으로 변경하기로 했습니다.
사실 이번 프로젝트는 Node.js 환경에서만 실행되고, 브라우저에서 실행하는 프로젝트가 아니기 때문에, 변경이 크게 문제가 없다고 판단되기도 해서, 변경을 결정하게 됐습니다.

하지만, 변경 후에 또다른 문제가 발생했는데...

## CommonJS Module 시스템을 지원하지 않는 라이브러리들

```js
❯ ./bin/create-den-app.js my-app
/Users/hanseungju/create-den-app/bin/create-den-app.js:4
const inquirer = require("inquirer");
                 ^
Error [ERR_REQUIRE_ESM]: require() of ES Module (...) not supported.
Instead change the require of inquirer.js in (...) to a dynamic import() which is available in all CommonJS modules.
```

"inquirer 라이브러리와 chalk 라이브러리는 ES Module 만 지원되니 CommonJS Module을 사용한다면 `dynamic import()` 를 사용해보세요." 라며 에러가 발생했습니다.

그래서 에러의 원인을 찾기 위해 각각의 라이브러리 소스코드를 뜯어보니,

- 대화형 프롬프트를 지원하는 Inquirer 라이브러리는 8.2.4버전에서 [9.0.0 버전](https://www.npmjs.com/package/inquirer/v/9.0.0?activeTab=code)으로 업데이트하면서 CommonJS 모듈 시스템이 아닌 ES Module 시스템으로 변경됐다.
- 터미널에 색상과 스타일을 추가하는 chalk 라이브러리는 4.1.1버전에서 [5.0.0버전](https://www.npmjs.com/package/chalk/v/5.0.0?activeTab=code)으로 업데이트하면서 CommonJS 모듈 시스템이 아닌 ES Module 시스템으로 변경됐다.

두 라이브러리의 공통점은 제일 최근에 했던 메이저 업데이트에서 모듈 시스템을 변경했고, 이로 인해 최신 버전에서 `require` 을 이용해 모듈을 가져오는 것이 불가능해졌습니다.

그래서 각각 메이져 업데이트가 되기 전 버전으로 라이브러리를 다시 설치했더니 정상적으로 애플리케이션이 실행됐습니다.

사실 그동안 npm 패키지를 설치할 때 항상 최신 버전으로 설치했고, 패키지들의 버전이나 의존성을 크게 신경 쓰지 않았습니다. 이번 프로젝트를 할 때도 마찬가지였는데, 에러를 해결하는 과정에서 처음으로 패키지 버전에 대한 중요성을 조금이나마 알게됐습니다.

## 끝!

사실 프로젝트를 진행함에 있어서, 이미 결정한 모듈 시스템을 다른 문제 해결 방안이 있을 수도 있는 상황에서 변경하는 것은 좋지 않은 결정이라는 생각이 듭니다. 하지만, 초기에 프로젝트를 설계한 부분까지는 빠른 시간내에 NPM에 배포하는 것이 목표였고, 에러 대응 당시에 더 나은 해결 방법이 떠오르지 않아서 변경을 하게 됐습니다.

다음 글 부터는, NPM에 배포한 프로젝트를 버전업할 때 어떤 기준으로 프로젝트를 개선 혹은 리팩토링을 했고, 기능을 추가하게 되면 추가된 기능에 대해 설명하는 글을 포스팅해보겠습니다.

감사합니다.

## 추가 학습 point

- 에러메시지에서 에러를 해결하기 위한 방법으로 `dynamic import`을 추천했는데, 학습 필요!
- CommonJS와 ES module을 함께 사용하는 방법은 없을까?

## 참조

- JSON 모듈관련 글
  - https://ui.toast.com/posts/ko_20211209
- Babel 관련 카카오테크 블로그 글
  - https://tech.kakao.com/2020/12/01/frontend-growth-02/
