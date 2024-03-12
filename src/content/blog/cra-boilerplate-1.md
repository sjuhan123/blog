---
title: 나만의 CLI 기반 CRA 제작기 1, 구현 및 배포
excerpt: CRA(create-react-app) 대체제 제작기
publishDate: 'Aug 20 2023'
tags:
  - React
seo:
  image:
    src: '/post-1.jpg'
    alt: 나만의 CLI 기반 CRA 제작기 1, 구현 및 배포
---

## boilerplate?

지금까지 React 프로젝트를 시작할 때는 항상 CRA(create-react-app)을 사용하여 시작했습니다.
CRA를 설치한 후, 각 프로젝트마다 필요하거나 요구되는 조건에 맞게 각종 의존성을 설치하고... 설치되는 의존성에 따라 필요한 설정 파일들과 내용을 상황에 맞게 구성하고... 의존성 간 버전 충돌이 생기면 열심히 브라우저 검색해서 해결하고... 그러다보면 어느새 몇 시간이 사라지는 반복되는 개발 일상을 살아왔습니다. 혹시 여러분도 그런 경험 있으신가요?

매번 답답함을 느끼던 어느 날, 개발 동료로부터 'boilerplate'라는 단어를 들었는데, 찾아보니 boilerplate code가 새로운 프로젝트를 시작할 때 환경 설정 시간을 크게 단축시켜줄 것 같아 boilerplate 설치 패키지를 제작하기로 결심했습니다.

> boilerplate code가 뭘까?  
> 보일러플레이트 코드(boilerplate code)란 최소한의 변경으로 여러곳에서 재사용되며, 반복적으로 비슷한 형태를 띄는 코드를 말합니다. 여기 참고!

## 그럼 어떻게 구현할까?

### 첫 번째 방법

1. boilerplate를 제작하고, github에 올린다.
2. boilerplate가 필요할 때, 로컬에 clone 한다.
3. npm install 명령어로 지정된 의존성을 설치한다.
4. clone을 받았기 때문에 자동으로 git remote origin이 보일러플레이트 git repo 주소를 가르키게되서, 이 연결을 끊는다.
   프로젝트를 시작한다.

첫 번째 방법은 사용할 때마다 git clone-의존성 설치- git repo 연결 끊기를 반복해야 되는 번거러움이 있다. 단, 빠르게 구현할 수 있다.

### 두 번째 방법

1. boilerplate를 제작하고 github에 올린다.
2. github에 올라간 boilerplate를 clone해서 패키지를 자동으로 설치하는 프로젝트를 제작하고, npm에 배포한다.
3. npx create-react-den my-app 실행한다.
4. 프로젝트를 시작한다.

두 번째 방법은 boilerplate 코드와 boilerplate 설치 패키지를 따로 제작하고 관리해야 된다.

### 세 번째 방법

1. boilerplate를 동적으로 생성하는 boilerplate 설치 프로젝트를 제작하고 npm에 배포한다.
2. npx create-react-den my-app 명령어로 실행한다.
3. CLI에 대화형 프롬프트가 실행되면, 사용자가 원하는 기술스택을 선택한다.
4. 선택된 기술스택들로 구성된 React 프로젝트가 동적으로 생성된다.
5. 프로젝트를 시작한다.

세 번째 방법은 하나의 프로젝트로 boilerplate를 동적으로 생성하고, 패키지 설치 및 프로젝트 생성을 한번에 할 수 있다. 그리고 하나의 프로젝트만 만들면 되기 때문에, 유지 보수 및 관리하기 편하다. 거기에 boilerplate를 동적으로 생성하게 되면, 사용자의 상황에 맞게 boilerplate code를 설치할 수 있도록 하는 대화형 프롬프트만 만들 수 있다면 패키지의 범용성이 더 좋아진다. 단, 개발하는데 시간이 오래 걸릴 것 같다.

첫 번째와 두 번째 방법에 비해 세 번째 방법이 개발이 더 어려울 수 있지만 세 번째 방법으로 프로젝트를 구현하면, 사용자는 프로젝트 상황에 맞게 npx create-react-app 명령어 하나만으로 프로젝트 환경구성을 완료할 수 있어서 범용성도 좋다고 판단되어 세 번째 방법으로 boilerplate 프로젝트를 제작하기로 했습니다.

그럼 같이 개발해볼까요? 글에 부정확한 정보가 있을 수 있으니, 피드백은 언제나 환영입니다.

## 개발 시작!

우선 본격적인 개발을 시작하기 전에, 위에서 언급한 세 번째 방법의 내용을 토대로 개발 feature를 정리해봅시다.

1. **"사용자의 상황에 맞게 boilerplate code를 설치할 수 있도록 하는 CLI 도구"**  
   1-1. 사용자가 CLI에 입력한 명령어를 파싱하고 검사해야 된다.  
   1-2. 사용자가 어떤 패키지를 설치하고 싶은지 질문해야 된다.  
   1-2-1. 대화형 프롬프트를 생성해야 된다.  
   1-2-2. 질문List를 작성해서 프롬프트에 반영해야 된다.  
   1-3. 사용자가 원하는 디렉토리에 프로젝트를 생성해야 된다.
2. **"boilerplate를 동적으로 생성하고"**  
   2-1. 사용자의 답변을 바탕으로, boilerplate code를 동적으로 실행하고 의존성을 설치해야 된다.  
   2-2. 실행 후 설치된 의존성들를 생성된 프로젝트 폴더에 생성해야 된다.
3. **"npm에 배포한다 && npx create-react-den my-app 명령어로 실행한다"**  
   3-1. npm 배포해야 된다.  
   3-2. 사용자 로컬 환경에서 npx로 실행할 수 있게 만들어야 한다.  
   3-3. 배포한 코드 버전관리

### 사용할 라이브러리 결정

사실 대부분의 라이브러리들은 라이브러리를 사용하지 않고도 여러 언어들을 이용해서 직접 구현할 수 있습니다.(말은 쉽지만...)
하지만, 라이브러리들이 제공하는 기능들을 직접 구현을 하게 되면 당연히 그만큼 개발 리소스를 많이 투입해야 됩니다.
시간적 여유가 있다면, 라이브러리를 사용하지 않고 직접 구현해서 사용 해보면 좋지만, 현실적인 한계(시간 여유 등)가 있어 여러 라이브러리의 도움을 받기로 결정했습니다.

### commander - 사용자 입력 명령어 분석 라이브러리

**사용자가 입력한 명령어 파싱하기**를 어떻게 구현할까 고민하던 중, [create-react-app 소스코드](https://github.dev/facebook/create-react-app/blob/main/packages/react-scripts/scripts/init.js)를 뜯어보다가 힌트를 얻었습니다.

사용자가 `npm create-react-app my-app` 명령어를 입력 했을 때 처리되는 로직을 보면,

```js
(...생략)
const chalk = require('chalk');
const commander = require('commander');
(...)
const fs = require('fs-extra');
(...)
const path = require('path');
(...)

const packageJson = require('./package.json');

function isUsingYarn() {
  return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
}

let projectName;

function init() {
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
      projectName = name;
    })
    .option('--verbose', 'print additional logs')

		(...)
```

우선 'commander' 라는 라이브러리의 commander를 이용해서,

1. 사용자가 `npm create-react-app my-app` 를 입력했을 때, `packageJson.name`(create-react-app 내 package.json 파일의 객체 "name"의 "value"값은 create-react-app)과 동일한 이름의 패키지를 Command 객체에 넘겨준다.
2. `.arguments('<project-directory>')` 가 사용자의 명령어 중 3번째 인자인 프로젝트 디렉토리명을 받는다.
3. `.action(name => (생략) )` 에서 프로젝트 디렉토리명을 name으로 받아서, projectName에 할당하고 사용자가 원하는 디렉토리에 프로젝트가 생성되도록 구현되어 있다.

이번 프로젝트에서 필요로 하는 기능들을 commander 라이브러리가 제공하고 있다는 것을 알 수 있습니다.

### inquirer - 대화형 프롬프트 지원 라이브러리

사용자에게 지정된 기술스택만을 제공할까 했지만, `eslint -init` 명령어를 입력했을 때 출력되는 대화형 프롬프트를 보고 좀 더 유연한 프로젝트를 개발해보고 싶다는 생각을 하게 됐습니다.

```bash
// eslint -init 입력시 나오는 질문들
# CRA로 리액트 프로젝트 시작
yarn create react-app . --template typescript

# eslint --init 으로 eslint 세팅
yarn eslint --init
√ How would you like to use ESLint? · style
√ What type of modules does your project use? · esm
√ Which framework does your project use? · react
√ Does your project use TypeScript? · Yes
√ Where does your code run? · browser
√ How would you like to define a style for your project? · guide
√ Which style guide do you want to follow? · airbnb
√ What format do you want your config file to be in? · JSON
√ Would you like to install them now with npm? · No
```

위와 같이 CLI에서 대화형 프롬프트를 생성해주는 라이버러리를 찾다가, inquirer를 발견했습니다. inquirer는 Node.js 환경에서 사용자와 상호작용하는 명령줄 인터페이스를 생성하는데 사용되는 라이브러리입니다.

inquirer 기능들,

- 사용자에게 여러 종류의 질문을 할 수 있는 다양한 질문 유형을 지원한다 (리스트 선택, 텍스트 입력, 확인, 스케일 등).
- 답변을 받을 때 비동기적으로 처리할 수 있는 프로미스 기반 구조를 제공한다.
- 질문마다 유효성 검사를 수행할 수 있다.
- 질문의 스타일 및 외관을 커스터마이징할 수 있다.
- 답변을 객체로 수집하여 다양한 처리를 할 수 있다.

대화형 프롬프트를 직접 구현 안해도 되고, 대화형 프롬프트를 구현하기 위해 필요한 다양한 기능들을 제공해서 이 라이브러리를 사용하기로 결정했습니다.

### shelljs - 쉘 명령어를 Node.js에서 실행하도록 도와주는 라이브러리

개발 feature 2-1을 보면 **사용자가 질문에 답변한 내용을 바탕으로 동적으로 필요한 의존성들을 설치하는 로직**을 구현해야 됩니다. 이를 구현하기 위해 쉘 명령어를 Node.js에서 실행하기 위해서 Node.js에 내장되어 있는 `child_process`, `spawn` 등을 사용해도 됩니다. 하지만 이 모듈들은 개인적으로 가독성이 떨어지는 등의 이유로 배제했습니다.(`exec`, `echo` 등등)(핑계..)

그래서 선택한게 shelljs 입니다. shelljs는 외부 의존성 없이 Node.js 자체의 모듈만으로 작동되서 추가적인 설치나 설정 없이 사용할 수 있습니다.
그리고 제공하는 메소드들의 가독성 또한 좋다고 판단(네,.?)해서, 사용하기로 결정했습니다.(~~shelljs에도 exec 메서드가 있는건 비밀~~)

### chalk - 사용자향 터미널 메시지 꾸며주는 라이브러리

chalk의 경우 혹은 CLI을 꾸미고 싶을 때, 사용할 수 있는 라이브러리 입니다.

![](https://velog.velcdn.com/images/sjuhan123/post/ee2c6b30-36a2-4562-8a28-82376446bc3a/image.png)

> chalk를 사용해 "Your App is ready" 메시지를 초록초록하게 만들었다.

CLI 꾸미기는 개발 feature에 포함되어 있지 않아서 chalk를 굳이 사용할 필요가 없지만, 사용자에게 터미널에서 중요한 메시지나 강조하고 싶은 메시지를 보여주고 싶을 때 유용하게 사용할 수 있을 것 같아서 사용하기로 했습니다.

그럼 이제 프로젝트 환경 구성을 해보겠습니다.

## 환경 구성하기

우선 프로젝트를 시작해야 되니 프로젝트를 시작할 디렉토리로 이동하고 아래 명령어 입력!

### NPM

`npm init -y`

- y 옵션은 npm init시 물어보는 질문들을 모두 yes처리한다.
- 구체적인 정보를 입력하려면 -y를 생략하고 물어오는 질문에 맞춰 작성하면 된다.

### 의존성 설치

`npm install commander shelljs chalk@4.1.1 inquirer@8.2.4`

- 4개의 의존성 모두 이 프로젝트의 핵심인 CLI와 관련되어 있는 라이브러리이기 때문에, dependency로 설치한다.
- chalk와 inquirer는 특정 버전을 설치하게 됐는데, 이유는 [다음 글](https://velog.io/@sjuhan123/%EB%82%98%EB%A7%8C%EC%9D%98-CLI-%EA%B8%B0%EB%B0%98-CRA-%EC%A0%9C%EC%9E%91%EA%B8%B0-%EC%97%90%EB%9F%AC-%EB%8C%80%EC%9D%91) 참고!

### 폴더 구조

```
├── bin
|   └── create-custom-app.js
├── node_modules
├── package-lock.json
├── package.json
└── README.md
```

폴더 구조를 보면, 스크립트를 bin 폴더 하위에 생성했다.

### package.json

npm 배포를 위해 필요한 내용들로 package.json을 구성했습니다. 구성 방법은 [여기 글 참고!](https://heropy.blog/2019/01/31/node-js-npm-module-publish/)

```json
{
  "name": "create-custom-app",
  "version": "1.0.0",
  "description": "Create custom app based on command line tool with Node.js",
  "bin": {
    "create-custom-app": "./bin/create-custom-app.js"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["cli", "command", "line", "tool", "cra", "create", "react", "app", "custom", "custom-app"],
  "homepage": "https://github.com/sjuhan123/create-custom-app",
  "bugs": {
    "url": "https://github.com/sjuhan123/create-custom-app",
    "email": "sjuhan123@gmail.com"
  },
  "license": "MIT",
  "author": {
    "name": "SeungJu Han",
    "email": "sjuhan123@gmail.com",
    "url": "https://github.com/sjuhan123"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/sjuhan123/create-custom-app.git"
  },
  "dependencies": {
    "chalk": "^4.1.1",
    "commander": "^11.0.0",
    "inquirer": "^8.2.4",
    "shelljs": "^0.8.5"
  }
}
```

### bin 속성과 bin 폴더를 사용한 이유?

- `package.json` 파일의 bin 속성을 사용해서 프로젝트 내부의 스크립트 파일을 글로벌 명령어로 사용할 수 있게 한다.
- npm에 프로젝트를 배포하고, 사용자가 해당 패키지를 사용할 때 `npx create-custom-app my-app` 명령어를 실행하면 `npx`는 `create-cumstom-app` 패키지를 찾고, 해당 패키지의 package.json에 정의된 bin 필드의 스크립트 파일을 실행하게 된다.([bin과 npx에 대한 참고 문서](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#bin))

드이어 환경 구성이 끝났습니다. 이제 라이브러리를 활용해서 구현을 시작해보아요!

## 구현하기 - create-custom-app.js

### 필요한 모듈 불러오기

```js
const fs = require('fs');
const path = require('path');

const commander = require('commander');
const chalk = require('chalk');
const shell = require('shelljs');
const inquirer = require('inquirer');

const packageJson = require('../package.json');
```

- fs 모듈(Node.js 내장 모듈): 파일 읽기, 생성, 쓰기, 삭제 등 조작 작업을 위함
- path 모듈(Node.js 내장 모듈): 파일 경로 생성, 조작, 추출 등의 작업을 위함
- package.json JSON 객체 모듈: package.json 파일의 필드 값들을 가져와서 사용하기 위함

### 사용자 입력 명령어 파싱하고 검사하기

`create-react-app` 에서 착안해서, 사용자가 3가지 명령어를 입력했을 때 대응할 수 있도록 구현해보겠습니다.

```bash
// 1. working directory 명시하지 않으면 현재 위치에 프로젝트를 생성한다.
> npx create-custom-app
// 2. working directory를 "."으로 입력하면 현재 위치에 프로젝트를 생성한다.
> npx create-custom-app
// 3. working directory를 명시하면, 명시한 이름으로 폴더명을 생성하고 하위에 프로젝트를 생성한다.
> npx create-custom-app my-app
```

> 여기서 부터 코드들은 전부 이어집니다. 빠른 구현을 위해 하드코딩된 부분이 많고, 코드 분리가 되어 있지 않아서 가독성이 떨어집니다. ([전체 코드](https://www.npmjs.com/package/create-customized-app/v/1.0.0?activeTab=code)) 이후 버전업을 통해서 리팩토링을 진행할 예정입니다.

```js
const program = new commander.Command();

program
  .description(packageJson.name)  // 프로젝트 이름
  .version(packageJson.version)   // 프로젝트 버전
  .arguments("[folderName]")      // 명령어의 인자를 설정.
  .usage(`${chalk.green("[folderName]")} [options]`) // 도구의 사용법
  .action((folderName = ".") => {
    // 사용자가 입력한 폴더 이름 반영
    const projectName = folderName;
    const projectPath = path.join(process.cwd(), projectName);
```

- `commander` 라이브러리를 사용해서 `program` 객체를 생성하고, 이 객체에 CLI 도구의 기본 정보를 설정합니다.
- 명령어의 세번째 인자로 `folderName`을 선택적으로 입력받는다.
  - `.action` 콜백함수의 매개변수 `folderName` 의 기본값을 "."으로 설정해서, 사용자가 폴더명을 명시하지 않았거나, "."으로 입력 했을때 대응한다.

### 프로젝트 root 폴더 생성

```js
const projectName = folderName;
const projectPath = path.join(process.cwd(), projectName);

if (projectName !== '.') {
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath);
  } else {
    console.log(`The folder ${chalk.red(folderName)} already exist in the current directory, please give it another name.`);
    process.exit(1);
  }
}

process.chdir(projectPath);
```

- 사용자가 입력한 `folderName`이 "." 이 아니고 폴더명을 명시했을 때,
  - 사용자가 입력한 폴더이름이 현재 디렉토리에 존재하지 않는다면, 해당 이름으로 폴더를 생성합니다. 이때, 이미 동일한 폴더명이 존재한다면, 경고문 노출과 함께 process를 종료합니다.
- 사용자가 입력한 `folderName`이 "." 이거나 아예 명시하지 않았을 때, 현재 작업 디렉토리를 `projectPath`로 변경합니다.
  - `process.chdir(projectPath)`: 현재 작업 디렉토리를 `projectPath`로 변경

### 대화형 프롬프트 실행

대화형 프롬프트를 구현하기 전에, 사용자에게 어떤 질문을 하면 좋을지 고민해보면... 사용자가 다양한 기술스택을 선택할 있도록 하면 좋겠지만, 이 프로젝트의 취지는 create-custom-app 을 설치하고 실행하면 바로 프로젝트 개발을 시작할 수 있게 환경을 세팅해주는 것입니다.

그러면 기술스택의 config들도 동적으로 생성해줘야 되는데, 제가 사용해보지 않았거나 거의 사용해본적 없는 기술스택의 경우 구현하기 어렵다고 판단해서 익숙한 기술스택을 질문 List에 포함했습니다.

> 사용자가 다양한 기술스택들을 선택할 수 있도록 버전업을 할 예정

1. react + js, ts + react 조합 중 1개 선택
2. react-router-dom 사용 여부 선택
3. eslint + prettier 사용 여부 선택
4. 스타일 라이브러리 선택: style-components, emotion 혹은 none

위 질문 List를 바탕으로, inquirer 라이브러리를 사용해서 구현해보면,

```js
inquirer.prompt([
  {
    type: 'list',
    name: 'reactEnvironment',
    message: 'Select the react environment:',
    choices: ['React + JavaScript', 'React + TypeScript']
  },
  {
    type: 'list',
    name: 'useReactRouterDom',
    message: 'Use React Router Dom?',
    choices: ['Yes', 'No']
  },
  {
    type: 'list',
    name: 'styleLibrary',
    message: 'Select a style library:',
    choices: ['styled-components', 'emotion', 'none']
  },
  {
    type: 'list',
    name: 'usePrettierEslint',
    message: 'Use Prettier and ESLint?',
    choices: ['Yes', 'No']
  }
]);
```

코드 가독성도 좋고 정말 쉽습니다. 코드를 보면 type에 list만 사용했는데, list 뿐만 아니라 input, confirm, checkbox, rawlist, password 등 정말 다양한 type을 제공하니까 상황에 맞게 적용하면 됩니다.

### 사용자의 답변을 코드에 받아오기

```js
inquirer
      .prompt([{
          type: "list",
          name: "reactEnvironment",
          message: "Select the react environment:",
          choices: ["React + JavaScript", "React + TypeScript"],
        },
	      (...생략)
      ])
      .then((answers) => {
        // 사용자의 답변이 answers에 담겨있다.
        const {
          reactEnvironment,
          useReactRouterDom,
          styleLibrary,
          usePrettierEslint,
        } = answers;
```

코드를 큰 틀에서 보면 `inquirer.prompt().then((answer) => {})` 의 순서로 동작된 다는 것을 알 수 있습니다.
`fetch.then()` 과 정말 유사해보이는데, 실제로도 동일하게 동작합니다.
`prompt()` 를 실행해서 받은 사용자의 응답을 비동기로 받아서 then 콜백함수의 매개변수로 전달해줍니다.
`answer` 매개변수는 `prompt` 배열 객체의 `name` 값과 동일한 변수를 가지고 있는데, 이 변수에 사용자의 응답이 할당되어 있습니다.

### 받아온 답변에 따라 의존성 설치하기

```js
      .then((answers) => {
        // 사용자가 입력한 값에 따라 dependency 및 devDependency 설치
        const {
          reactEnvironment,
          useReactRouterDom,
          styleLibrary,
          usePrettierEslint,
        } = answers;

        const installPackages = ["react", "react-dom", "react-scripts"];
        const devPackages = [
          "@babel/plugin-proposal-private-property-in-object",
        ];

        if (reactEnvironment === "React + TypeScript") {
          installPackages.push("typescript");
          devPackages.push("@types/react", "@types/react-dom");
        }

        (...생략...) // 반복 로직

        shell.exec(`npm init -y`);
        console.log(chalk.green("Downloading files and packages..."));
        shell.exec(`npm install ${installPackages.join(" ")}`);
        shell.exec(`npm install ${devPackages.join(" ")} --save-dev`);
```

dependency 패키지들을 담은 배열 변수와 devdependency를 담은 배열 변수를 각각 선언합니다.
그리고 `answers` 객체에 있는 각각의 변수 값(사용자의 답변)들을 검사하면서, 검사 결과에 맞는 의존성들을 각각의 배열에 맞게 넣어줍니다.
다 넣어주고 나서, shell 라이브러리를 이용해서 의존성들을 설치해줍니다.

### 의존성에 필요한 config 파일 생성 후 내용 넣어주기

```js
        // 사용자가 입력한 값에 따라 config 파일 생성
		// 원하는 설정을 넣어주면 됩니다.
        if (reactEnvironment === "React + TypeScript") {
          const tsconfig = {
            compilerOptions: {
              target: "ES6",
              lib: ["dom", "dom.iterable", "esnext"],
              allowJs: true,
              skipLibCheck: true,
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              strict: true,
              forceConsistentCasingInFileNames: true,
              noFallthroughCasesInSwitch: true,
              module: "ESNext",
              moduleResolution: "node",
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
              jsx: "react",
              outDir: "./dist",
            },
            include: ["src"],
          };
          fs.writeFileSync("tsconfig.json", JSON.stringify(tsconfig, null, 2));
        }
			(...생략...) // 반복되는 config 생성 로직 생략
```

사용자가 "React + TypeScript"를 선택했다면, fs 모듈을 이용해 "tsconfig.json" 파일을 생성하고, option 값들을 가진 객체를 생성해서 넣어줍니다. config가 필요한 다른 의존성들도 동일하게 필요한 파일을 생성하고 원하는 옵션들을 넣어서 구현해주세요!

### 자동으로 생성되는 package.json 파일 내용 수정하기

```js
const packageJsonPath = 'package.json';
const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonContent);

packageJson.name = projectName;
packageJson.scripts = {
  start: 'react-scripts start',
  build: 'react-scripts build',
  test: 'react-scripts test',
  eject: 'react-scripts eject'
};
packageJson.eslintConfig = {
  extends: ['react-app']
};
packageJson.browserslist = {
  production: ['>0.2%', 'not dead', 'not op_mini all'],
  development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version']
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
```

JSON 객체의 각 속성에서 수정 혹은 추가해야 되는 부분들을 동적으로 실행해주는 로직을 구현합니다. 따로 package.json의 내용을 수정하지 않고 바로 프로젝트를 시작할 수 있도록 내용을 구성해줍니다.

### 기타 프로젝트에 필요한 폴더와 파일 생성하기

cra를 실행하면 생성되는 폴더 및 파일들이 있습니다.
예를 들어서, public, src 폴더 및 하위 파일들을 생성해줘야 됩니다.
그리고 필수는 아니지만, .gitignore와 src 하위에 폴더 구조 및 파일 등등 다양한 폴더와 파일들을 각자의 입맛에 맞게 동적으로 생성되도록 로직을 구현해주면 됩니다.

```js
        (...생략...)

				// 하드코딩...! 리팩토링 해야지~
        fs.mkdirSync("src");
        fs.mkdirSync("src/components");
        fs.mkdirSync("src/pages");
        fs.mkdirSync("src/hooks");
        fs.mkdirSync("src/utils");
        fs.mkdirSync("src/types");
        fs.mkdirSync("src/constants");
        fs.mkdirSync("src/context");
        fs.mkdirSync("src/styles");

        if (
          reactEnvironment === "React + JavaScript" ||
          reactEnvironment === "React + TypeScript"
        ) {
          const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

          const appContent = `import React from 'react';

const App = () => {
  return <div>Hello!</div>;
};

export default App;
`;

          if (reactEnvironment === "React + JavaScript") {
            fs.writeFileSync("src/index.jsx", indexContent);
            fs.writeFileSync("src/App.jsx", appContent);
          } else {
            fs.writeFileSync("src/index.tsx", indexContent);
            fs.writeFileSync("src/App.tsx", appContent);
          }
        }

	    (...생략...)
```

> 혹시 눈치채셨을까요?! 지금까지의 코드들을 보면 비동기로 처리되는 로직들이 병렬로 처리가 되도록 구현되어 있지 않습니다. 이로 인해서 패키지 실행시 완료되기까지 긴 시간이 소요 됩니다. 그래서 다음 버전업 때 Promise.All 등을 활용해서 리팩토링을 해 성능 개선을 시도해볼 예정입니다.

### 정의한 명령어와 옵션을 파싱하고 실행하기

```js
				(...생략...)

        console.log(chalk.green("Your App is ready!"));
      });
  });

program.parse(process.argv);
```

`program.parse(process.argv)`는 `commander`를 사용하여 정의한 명령어와 옵션을 process.argv를 기반으로 파싱하고 실행하는 역할을 해줍니다.

## 구현 끝!

이제 로컬에서 `npx create-custom-app` 을 입력하면

- create-custom-app.js 스크립트가 실행된 후, 사용자의 명령어를 검사하고
- 대화형 프롬프트를 실행해서, 사용자의 답변을 받고
- 답변을 검사해서 필요한 의존성들과 config 파일 및 폴더들을 생성 한 후
- 사용자가 지정한 디렉토리에 프로젝트가 생성
  됩니다.

그럼 이제 마지막 개별 feature인 npm에 배포를 해봅시다!

## npm에 배포하기

- NPM에 가입되어 있지 않다면, [NPM 홈페이지](https://www.npmjs.com/signup)에서 가입하기
- 가입했다면 아래 명령어 따라하기

```
npm login // npm 아이디로 로그인
npm version // 프로젝트 버전 관리
npm publish --access public // npm에 최초 배포
npm publish // 최초 배포이후에 배포시
```

## 제작 후기

- 리팩토링
  - 글 중간 중간 주석에도 언급 했는데, 초기 구현된 코드가 리팩토링을 거치지 않은 야생의 코드입니다. 이 글을 보시고 실제로 제작하시는 분이 있다면, 이 글은 참고만 해주시고 코드 리팩토링이 완료되면 추가 글을 통해 정리보겠습니다.
- 의존성들의 버전
  - 현재 코드를 보면 의존성들을 동적으로 설치할 때 최신 버전으로 설치되는 의존성들이 있고 그렇지 않은 의존성이 있습니다. 의존성 충돌을 방지하기 위해서 임시로 이렇게 구현했는데, 서로 충돌되지 않게 어떻게 버전관리를 할까 고민 중입니다.
  - create-react-app의 코드를 보면, 설치되는 의존성의 버전을 동적으로 [검사하는 부분](https://github.dev/facebook/create-react-app/blob/main/packages/react-scripts/scripts/init.js)이 있습니다.이 코드를 응용해서 개선할 수 있을까 고민 중입니다.

다음 글은 이 프로젝트를 진행하면서 만났던 에러에 어떻게 대응했는지를 정리한 글을 포스팅하겠습니다.

감사합니다.

## 설치 및 실행 영상

- `npx create-custumized-app 폴더이름`을 입력하면 실행가능합니다.

![create-customized-app demo](https://velog.velcdn.com/images/sjuhan123/post/cd01867b-df9b-43da-b8cd-469d034a617c/image.gif)

![create-customized-app test](https://velog.velcdn.com/images/sjuhan123/post/28cfa533-76f1-4d13-bc88-1bbe097c283f/image.gif)

## 패키지 버전 관리

- [1.0.0](https://www.npmjs.com/package/create-customized-app/v/1.0.0?activeTab=code): 이 글에서 활용한 버전
- [1.0.2](https://www.npmjs.com/package/create-customized-app/v/1.0.0?activeTab=versions): 리팩토링 - 스크립트 코드 분리
- [1.1.0](https://www.npmjs.com/package/create-customized-app?activeTab=readme): 성능 최적화, 리팩토링 - 관심사 분리

## 참고 글

- npx와 bin 관련 블로그 글: https://gist.github.com/casamia918/aa8c986504d942223379e0af0c15644f
- boilerplate 제작기 참고 블로그: https://velog.io/@jjunyjjuny/React-TS-boilerplate-%EC%A0%9C%EC%9E%91%EA%B8%B0-%ED%99%98%EA%B2%BD-%EA%B5%AC%EC%84%B1
- npm 배포 관련 글: https://heropy.blog/2019/01/31/node-js-npm-module-publish/
- CRA 소스코드 : https://github.dev/facebook/create-react-app/blob/main/packages/react-scripts/scripts/init.js
- Eslint 소스코드: https://github.dev/eslint/eslint
- Eslint -init 관련 글: https://chinsun9.github.io/2021/11/20/eslint-init/
