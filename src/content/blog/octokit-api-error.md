---
title: Octokit API 에러 대응
excerpt: Github 레포의 Issue 목록 불러오기 중 만난 에러 대응하기
publishDate: 'Oct 8 2023'
tags:
  - React
seo:
  image:
    src: '/post-2.jpg'
    alt: Octokit API 에러 대응
---

### 문제 상황

원티드 인턴십 과제로 GithubAPI를 활용해서 Github 특정 레포의 Issue 목록을 불러와서 화면에 렌더링하는 과제를 구현하고 있었습니다.

서버 통신 진행 중에는 사용자에게 로딩 UI/UX를, 통신 중 에러가 발생하면 에러 화면을 렌더링해야 됐습니다. 그래서 서버 통신 로직 분리의 필요성을 느끼고 서버 통신 대기, 응답, 에러 상태 그리고 에러메시지 상태를 가지고 있는 `useFetch` 커스텀훅을 구현해, 각 컴포넌트에서 이 훅에서 반환한 상태에 따라 뷰를 렌더링 할 수 있도록 설계했습니다.

한가지 특이한 점은, GitHub API만 사용하면 되는 과제였기 때문에 항상 사용하던 `fetch` 등과 같은 API를 사용하지 않고 Github API와 통신하는데 도움을 주는 octokit.js 라이브러리를 사용했습니다.

그 동안 개발할 때는 주로 `fetch` API를 사용했는데, `fetch` API는 HTTP status code를 알 수 있는 `Response` 객체의 인스턴스 속성인 `status`를 제공해줍니다. 그래서 그동안은 응답 `status`의 코드를 활용해서 에러 대응 로직을 구현했었습니다.

이번에도 비슷한 로직 흐름으로 `fetch` API를 사용했던 부분만 `octokit.request`으로 바꿔서 사용하고, 반환하는 응답 코드에 따라서 분기처리를 시도했습니다.

```javascript
import { useEffect, useState } from 'react';
import { ERROR_MESSAGE } from '../constants';
import { Octokit } from 'octokit';
import { RequestParameters } from '@octokit/types';

const useOctokit = <T>(endpoint?: string, body?: RequestParameters, isGetData?: boolean) => {
  const [data, setData] = useState<T>();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  // GithubAPI auth 인증
  const oktokit = new Octokit({
	auth: process.env.REACT_APP_GITHUB_TOKEN,
  });

  const requestOctokit = async ({
  	(... 생략 ...)
  }) => {
    try {
      if (!endpoint) return;

      setStatus('loading');

      // GithubAPI 요청
      const res = await oktokit.request(endpoint, body);

      // 응답 상태에 따른 분기 처리
      // console.log로 res 값 확인
      console.log(res)
      if (res.status === 404) {  }

      (... 생략...)

      setStatus('success');
    } catch (error) {
      (... 생략...)
    }
  };

  useEffect(() => {
    requestOctokit(( ... 생략 ... ));
  }, []);

  return { data, status, requestOctokit };
};

export default useOctokit;
```

에러 대응 로직을 구현하기 위해서 의도적으로 `oktokit.request`가 404 에러를 반환하도록 하고, `oktokit.request`의 응답값을 `res` 변수에 할당해서 `res`에 응답 데이터가 제대로 들어오는지 확인 해봤는데,

![](https://velog.velcdn.com/images/sjuhan123/post/27df1d75-c706-4e67-9c64-5f4d6ff50a04/image.png)

`console.log(res)`가 찍히기도 전에 내가 `throw` 하지 않은 Error 메시지가 크롬의 콘솔창에 찍혔습니다.

그래서 어디서 에러 메시지가 `throw` 되고 있는지 확인하기 위해서 위 이미지에 나와 있는 에러메시지의 출처 코드가 있는 `index.js:36`을 눌러서 확인했습니다.

![](https://velog.velcdn.com/images/sjuhan123/post/33fefe70-ㄴd003-4d76-b98e-cc89fc8eb1c9/image.gif)

사용하고 있는 `octokit` 라이브러리 내부에서 내가 의도적으로 발생시킨 Error를 catch하고 `RequestError` 인스턴스를 throw 해서, 내가 찍은 `console.log(res)`는 무시되고 즉시 콘솔창에 인스턴스의 메시지가 출력하고 있었습니다.

> 어찌보면 사용하고 있는 라이브러리에서 여러 에러 시나리오에 대해서 대응 로직을 구축하는 것은 당연한건데, 이를 프로젝트 구현 당시 생각을 못했습니다.

이제 원인을 파악했으니, `octokit` 라이브러리가 throw 하는 에러 인스턴스를 내 프로젝트 코드에서 catch하고 이 에러 인스턴스가 가지고 있는 `status`에 따라서 대응 로직을 구현해보겠습니다.

try-catch문에서 catch문의 `exceptionVar`는 기본적으로 `unknown`을 가르킵니다.

![](https://velog.velcdn.com/images/sjuhan123/post/a87a4b81-ecd0-44fb-84e6-cd4757085471/image.png)

catch문의 `exceptionVar`인 `error`는 언제, 어떤 형태의 에러가 자기한테 올지 모릅니다.

![](https://velog.velcdn.com/images/sjuhan123/post/9ca15fd9-d30d-4ecc-97f9-a5480955dad6/image.png)

그래서 `instanceof`를 이용해 `error`한테 `new RequestError` 인스턴스가 온다는 것을 알려줍니다.

```js
catch (error) {
	if (error instanceof RequestError) {
	console.error(error.status);
}
```

![](https://velog.velcdn.com/images/sjuhan123/post/a1646910-e182-442d-899e-0af74b478bae/image.png)

드디어 `octokit`이 던진 에러 인스턴스의 `status` 속성에 접근해서 HTTP 응답 코드를 프로젝트에 받아오는데 성공했습니다.

이제 Github API가 반환하는 에러 코드를 공식문서에서 확인해 그에 따른 에러 대응 로직을 구현하면 됩니다.

```js
import { RequestError } from '@octokit/request-error'; // RequestError 인스턴스를 @octokit/request-error 패키지에서 가져왔다.

try {
  (...생략...)
} catch (error) {
  setStatus(STATUS.ERROR);
  if (error instanceof RequestError) {
    if (error.status === 404 || error.status === 422) {
      setErrorMessage(ERROR_MESSAGE.USER[error.status]); // 개발자에게 보여줄 에러 메시지
      console.error(ERROR_MESSAGE.DEV[error.status]); // 사용자에게 보여줄 에러 메시지
    }
  } else {
    // 500 에러 혹은 알 수 없는 에러
    setErrorMessage(ERROR_MESSAGE.USER.default);
    console.error(ERROR_MESSAGE.DEV.default);
  }
}
```

Github API의 각 API들은 상황별로 정말 다양한 에러 코드를 활용해서 사용자에게 반환합니다. 모든 에러 코드에 대한 대응 로직을 구현하면 좋겠지만, 일단 이 과제를 구현하고 나서 발생할 수 있는 에러 코드에 대해서만 대응 로직을 구축하고, 분기처리 하지 않은 나머지 에러들에 대해서는 사용자 그리고 개발자에게 전달할 default errorMessage를 정해서 대응 하기로 했습니다.

### 마치며

문제 상황 열심히 해결하고 나서, 쉬고 있다가 심심해서 octokit.js의 npm 홈페이지에 다시 들어가보니 라이브러리 사용시 에러 핸들링하는 방식에 대해서 친절히 설명해주고 있었습니다.(^\_\_^)(https://www.npmjs.com/package/octokit)

앞으로 프로젝트 구현에 급급하다고 사용하는 라이브러리의 공식문서도 제대로 읽어보지 않고 사용하지 말아야겠다는 교훈을 얻었습니다. 그래도 그동안 개념이 애매했던 `try-catch`문, 에러버블링 등 에 대해서 학습할 수 있어서 좋았습니다.

> 팀 프로젝트 소스코드  
> https://github.com/wanted-internship-team/pre-onboarding-12th-2-2/blob/main/src/hooks/useFetch.tsx

**추가 학습 Point**

- React에서의 에러 핸들링?
  - react-router-dom의 errorElement와 loader
  - ErrorBoundary와 Suspence
  - 전역 에러 핸들링과 지역 에러 핸들링
  - 리액트를 다루는 현업에서는 어떻게 에러 핸들링을 할까?
- console.error vs Error 인스턴스의 활용법

**참조**

- MDN
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
  - https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/instanceof
- octokit.js npm 페이지
  - https://www.npmjs.com/package/octokit
