---
title: 아이패드로 맥북에 원격 접속해서 개발하기
excerpt: Blink Shell, Tailscale, tmux, nvim으로 아이패드/아이폰에서 집 맥북에 원격 접속해 개발하는 환경을 구축한 기록
publishDate: 'Aug 17 2026'
tags:
  - Tech
  - tmux
  - Neovim
seo:
  description: Blink Shell과 Tailscale, tmux, nvim을 조합해 아이패드에서 맥북에 원격 접속해 개발하는 환경을 구축한 과정과 실사용 후기
---

요즘 근무 환경과 생활 패턴 상 아이패드를 들고 다니면서 집에 있는 맥북에 원격으로 붙어서 개발하는 일이 많아졌다. 처음엔 GitHub Desktop이나 VS Code 웹 버전으로 아이패드에서 바로 작업해보려 했는데, 파일 시스템 접근이 제한적이고 터미널 조작이 부자연스러운 데다 확장 기능도 데스크톱 버전만큼 자유롭지 못했다. 그래서 Blink Shell + Tailscale + tmux + nvim 조합으로 아이폰과 아이패드, 그리고 맥북에서 공간 제약 없이 개발하고 싶을 때 하는 중이다.

## 왜 이 조합인가

**Tailscale**은 WireGuard 기반의 개인용 VPN이다. 공유기 포트포워딩이나 고정 IP 없이도 같은 계정으로 로그인한 기기들끼리 사설 IP(또는 MagicDNS 이름)로 서로를 바로 찾을 수 있다. 집 밖에서 맥북에 붙는 게 목적이라면 별도 서버나 리버스 프록시를 두는 것보다 훨씬 설정이 간단하다.

**Blink Shell**은 iOS/iPadOS용 터미널 앱이다. SSH뿐 아니라 mosh도 지원하고 무엇보다 진짜 터미널이라 tmux/nvim을 포함해 평소 맥북에서 쓰던 CLI 도구를 그대로 쓸 수 있다. 웹 기반 IDE(code-server 등)를 켜서 붙는 방식도 고려했지만 그건 결국 브라우저 안에 또 다른 에디터 환경을 하나 더 두는 셈이라 맥북에서 쓰는 설정/플러그인/단축키를 그대로 못 가져간다는 단점이 있었다. 터미널로 붙으면 맥북 로컬에서 개발하는 것과 100% 같은 환경이라는 게 제일 큰 이유였다.

**tmux**는 원격 접속이 끊겨도 작업 상태를 그대로 보존해준다. 세션을 백그라운드에 둔 채로(`detach`) 아이패드를 덮고 나중에 다시 붙어도(`attach`) 실행 중이던 프로세스와 화면 배치가 그대로 남아있다. 작업 연속성 유지해줘 너무 잘 쓰고 있다.

**nvim**은 CLI 안에서 완결되는 에디터라서 별도의 GUI나 브라우저 렌더링 없이 SSH 세션 하나로 편집/탐색/git/LSP까지 전부 처리된다. CLI에서 동작하기 때문에 어느 디바이스에서나 에디터로 활용할 수 있어서 좋다.

## 실제로 붙는 흐름

먼저 맥북에서 `시스템 설정 → 일반 → 공유 → 원격 로그인`을 켜두고, 맥북과 아이패드 둘 다 같은 Tailscale 계정으로 로그인한다. 그다음 Blink Shell에 맥북을 host로 등록하는데, Tailscale hostname이나 할당된 사설 IP를 쓰면 되고 SSH 키는 Blink 자체 키 관리 화면에서 생성하고 등록하면 된다. 접속한 뒤에는 `tmux attach`로(세션이 없으면 `tmux new -s 이름`으로) 기존 작업을 그대로 이어간다.

네트워크가 자주 바뀌는 환경(와이파이↔셀룰러, 화면 잠금 등)에서는 순수 SSH보다 mosh 쪽이 연결이 잘 안 끊겨서 지금은 mosh를 사용 중이다.

특히 아이폰에서는 mosh가 필수다. ssh로는 아이폰에서 Blink Shell SSH로 맥북에 붙어서 작업하다가 다른 앱으로 이동하거나 화면이 잠기면 SSH가 바로 끊어져서 너무 불편하다.

## tmux 세팅

tmux는 window와 pane으로 화면을 나눠 쓰는 구조인데, 자주 쓰는 조합을 아예 역할별 window로 미리 세팅해두고 쓴다.

![tmux window 목록](/blog/ipad-remote-dev-environment/windows-overview.png)

하나는 obsidian 관리용 window다. vault를 편집하는 nvim pane과 Claude Code pane을 나란히 띄워둔다.

![obsidian 관리용 window](/blog/ipad-remote-dev-environment/obsidian-window.png)

개인 문서·기록 도구로는 Notion 대신 obsidian을 쓰고 있다. 아이폰/아이패드용 앱도 따로 있지만 거기서 직접 글을 쓰는 건 불편해서 뷰어 용도로만 가끔 켠다. Claude Code와 같이 작업하려면 결국 터미널이 필요해서, obsidian도 nvim으로 열어 tmux 위에서 편집하는 쪽을 택했다.

블로그 관리용 window도 따로 있다. 블로그 프로젝트를 여는 nvim pane, Claude Code pane, npm 개발 서버를 띄워두는 pane까지 세 개를 한 window에 배치했다.

![블로그 관리용 window](/blog/ipad-remote-dev-environment/blog-window.png)

여러 설정 파일을 만질 때 쓰는 config용 window도 있다. config 디렉토리를 여는 nvim pane과 Claude Code pane 둘로 구성했다.

![config 관리용 window](/blog/ipad-remote-dev-environment/config-window.png)

이렇게 역할별로 window를 나눠두면 지금 뭘 하고 있었는지 매번 다시 찾을 필요 없이 바로 이어서 작업할 수 있다.

## 브라우저에서 실시간으로 확인하기

Blink는 터미널 앱이라 브라우저가 없다. 대신 Tailscale이 두 기기를 같은 네트워크에 올려주기 때문에, 맥북에서 띄운 dev 서버(예: Vite `npm run dev`)를 `0.0.0.0`으로 바인딩해두면 아이패드 Safari에서 `http://<tailscale-hostname>:5173` 같은 주소로 바로 접속된다. iPadOS 스플릿뷰로 왼쪽엔 Blink(터미널), 오른쪽엔 Safari(개발 서버 화면)를 띄워두면 nvim에서 저장할 때마다 핫리로드된 화면을 바로 옆에서 확인하면서 디버깅할 수 있다.

## 아직 남아있는 어려움

물론 아직 불편한 점들도 있다. nvim 자체가 알 수 없는 지점에서 멈추는 경우가 종종 있다. 버퍼 전환 로직 중간에서 멎어 콜스택을 떠서 확인해보니 treesitter의 fold 계산 관련 코드 경로로 추정됐는데, 정확한 재현 조건은 아직 못 찾았다. 이외에도 nvim에 아직 적응하지 못 해서 느끼는 불편함들이 많다.

그래도 이 조합을 앞으로 계속 유지할 생각이다. 이유는 카페든 이동 중이든 아이폰이나 아이패드 하나만 있으면 맥북에서 하던 작업을 그대로 이어갈 수 있어서 너무 편하다.
