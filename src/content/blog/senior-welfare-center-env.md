---
title: Github Actions, Docker 사용시 Vite 환경변수 주입받기
excerpt: migration 이후 고장난 카카오 로그인 살리자
publishDate: 'Apr 13 2024'
tags:
  - Senior Welfare Center
seo:
  image:
    src: '/post-2.jpg'
    alt: Github Actions, Docker 사용시 Vite 환경변수 주입받기
---

환경변수 주입 방법에 대해 설명하기 이전에, 먼저 현재 프로젝트 구조랑 배포 Flow에 대해서 간단하게 설명드리겠습니다.

```bash
// yarn berry workspace 모노레포 환경

📦root
 ┣ 📂 .github
 ┃ ┣ 📂 workflows
 ┃ ┃ ┗ release-client-app.yml
 ┣ 📂 package
 ┃ ┣ 📂 client // Vite + React
 ┃ ┣ 📂 server // Node.js + Express.js
 ┃ ┗ ...
 ┃
 ┣ Dockerfile.client
 ┃ ... 기타 프로젝트 config
```

위와 같은 구조로 구성되어 있는 main 브랜치에 Pull Request Merge가 되면, 변경사항이 있는 프로젝트(`client` 프로젝트가 변경되면 `client` 프로젝트 배포 시작)가 크게 보면 아래의 순서로 배포가 됩니다.

```bash
release-client-app.yml workflow trigger
-> docker build
-> vite build
-> docker run
-> docker push to Docker Hub
-> ssh into EC2
-> docker pull
-> docker run
```

모노레포 환경을 구축하고 나서 더욱 복잡해진 배포 flow에 적용한 환경변수 주입 방식을 정리해보겠습니다.

## Github Secrets 이용 방식

Github Actions에서 제공하는 Secrets를 이용해서 환경변수를 주입받는 방법입니다.

```
// Github Actions 등록
VITE_KAKAO_API_KEY=YOUR_KAKAO_API_KEY
... 기타 생략 ...
```

우선 Vite에 주입해줄 환경변수를 Github Secrets에 등록합니다. VITE 환경변수 형식은 `VITE_`로 시작해서 동일한게 등록하겠습니다.

```yaml
// 많은 부분이 생략 됐습니다.
name: Release Client App Docker

// 변경 감지
on:
  pull_request:
    paths:
      - 'packages/client/**'
    types:
      - closed

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      // Docker Hub 로그인
      - name: Login to Docker Hub
        uses: docker/login-action@v2

      // Docker 이미지 빌드 및 push
      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          file: ./Dockerfile.client
          build-args: |
            VITE_KAKAO_API_KEY=${{ secrets.VITE_KAKAO_API_KEY }}

      - name: SSH into EC2 and run Docker container

      ... 생략 ...
```

저의 경우 Docker 이미지 빌드 및 Push시 `docker/build-push-action@v2`를 사용했는데, 이 Action은 빌드변수인 `build-args`를 통해서 `docker build`시 실행되는 Dockerfile.client에 환경변수를 주입할 수 있습니다.

환경변수를 주입받은 Dockerfile에서는 아래와 같이 사용할 수 있습니다.

```Dockerfile.client
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /app

... 생략 ...

// 환경변수 주입
ARG VITE_KAKAO_API_KEY
ARG VITE_KAKAO_REDIRECT_URI
ARG VITE_ADDRESS_API_KEY

// 환경변수 사용
ENV VITE_KAKAO_API_KEY=$VITE_KAKAO_API_KEY
ENV VITE_KAKAO_REDIRECT_URI=$VITE_KAKAO_REDIRECT_URI
ENV VITE_ADDRESS_API_KEY=$VITE_ADDRESS_API_KEY

RUN yarn install --immutable \
    && yarn client:build

... 생략 ...
```

이렇게 동적으로 주입받은 환경변수는, VITE 프로젝트 내에서 `import.meta.env.VITE_`로 사용할 수 있게 됩니다.

한 가지 주의할 점은, 위에서 설명드린 과정을 적용할 때 각 프로젝트 환경에 맞게 환경변수 주입을 **언제 해줄지** 고민해봐야 합니다. 변수가 동적으로 주입되기 때문에, 잘못된 시점에 환경변수 로직이 실행되면 의도와 다르게 주입이 되지 않을 수 있습니다.

## 마치며

ec2 docker image에 주입한 환경변수가 잘 주입되었는지 확인해보고 싶었습니다. 그래서 여러가지 ec2 cli 명령어로 확인해봤지만, 확인이 되지 않아 혹시 확인 방법을 아시는 분이 계시다면 댓글로 알려주시면 감사하겠습니다.(추후에 방법을 알아내면 다시 업데이트 하겠습니다.)

```bash
// ec2 cli
docker inspect [image id]

// 출력되는 image 정보 중 Config.Env에 환경변수가 출력될 줄 알았는데, 출력되지 않았습니다.
```

## 참고

- [Github Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vite 환경변수](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Build Args](https://docs.docker.com/engine/reference/builder/#arg)
