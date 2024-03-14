---
title: .env 파일 사용법과 고려사항
excerpt: 프로젝트 환경에 따라 .env 파일을 다변화하는 방법
publishDate: 'Oct 22 2023'
tags:
  - Tech
seo:
  image:
    src: '/post-2.jpg'
    alt: .env 파일 사용법과 고려사항
---

## .env 환경변수 관리의 중요성

지금까지 여러 프로젝트를 하면서 외부에 노출되면 안되는 중요한 환경변수들을 .env 파일 한 곳에서만 관리했다.  
근데 노인복지관 프로젝트를 진행하면서 프로젝트 실행 환경에 따라 환경변수의 value 수정이 필요했는데, 그 방식에 대해서 고민 하던 중 env 파일을 다변화하는 방법에 대해 알아보았다.

## 동적으로 환경변수 설정하기

```js
"scripts": {
  "start": "NODE_ENV=production PORT=80 node app", // NODE_ENV 환경변수를 production으로 PORT 환경변수를 80으로 하고 서버 실행
  "dev": "nodemon app",
},
```

npm start 혹은 npm run dev 등과 같이 스크립트 명령어를 실행할 때 환경변수를 변경하는 방식이다.
근데 환경변수가 늘어나거나, 외부에 노출되면 안되는 value가 있다면 적합하지 않아 보인다.

## .env 파일 다변화하기

**종류**

- .env: 기본값으로, 모든 환경에서 load 된다.
- .env.local: 테스트 환경을 제외한 모든 환경에서 load되는 값으로, 로컬에서 애플리케이션 실행 시에만 적용된다. 배포 시 적용되지 않음.
- .env.development | .env.test | .env.production: 특정 배포 환경 별 지정 파일을 설정한다.
- .env.development.local | .env.test.local | .env.production.local: 특정 배포 환경 별 환경 설정에서 개인 로컬에 맞게 커스텀하고 싶은 부분이 있는 경우 해당 부분을 오버라이드해 적용한다.

**우선순위**

- `npm run start`시 우선순위

```
.env.development.local > .env.development > .env.local > .env
```

- `npm run build`시 우선순위

```
.env.production .local > .env.production > .env.local > .env
```

- `npm run test`시 우선순위

```
.env.test.local > .env.test> .env.local > .env
```

다양한 환경에서 상항에 따라 파일을 관리하고 대응할 수 있어서 2번의 방식을 택했다.
