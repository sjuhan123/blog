---
title: tmux에서 멈춘 nvim
excerpt: nvim이 죽은 원인 특정까지의 기록
publishDate: 'Aug 18 2026'
tags:
  - Tech
  - tmux
  - Neovim
seo:
  description: tmux pane 위 nvim이 멈춘 원인을 ps, sample 같은 macOS 도구로 추적해 kiro-cli 셸 통합 프록시(figterm 계열)가 원인이었음을 밝혀낸 트러블슈팅 기록
---

평소처럼 아이패드에서 tmux와 tailscale로 맥북 tmux에 붙어서 nvim으로 파일을 고치고 있었는데, 어느 순간 화면이 그대로 멈췄다. 다른 tmux 창으로 넘어갔다가 다시 돌아와도 그대로였다.

nvim이 멈추는 원인으로 흔히 꼽히는 것들이 있다. 터미널 플로우 컨트롤이 걸려서 화면 출력 자체가 정지되는 경우(`Ctrl-S`), tmux copy mode에 실수로 들어간 경우, 아니면 블로킹되는 플러그인이나 LSP가 붙잡고 있는 경우. 이 셋을 순서대로 시도했다 — `Ctrl-Q`로 플로우 컨트롤 해제, copy mode 탈출, `Ctrl-C`로 인터럽트. 전부 반응이 없었다.

## 프로세스는 멀쩡했다

원격 pane 안에서는 더 해볼 게 없어서, tmux 다른 window에서 프로세스 상태를 확인했다.

```bash
pgrep -fl nvim
ps -o pid,ppid,stat,%cpu,%mem,etime,command -p <PID>
```

STAT 컬럼[^1]이 `D`(디스크 I/O 대기)라면 강제종료도 안 먹히는 진짜 행이고, `T`라면 어딘가에서 정지 시그널을 받은 거고, `R`에 CPU가 튀면 무한루프다. 그런데 결과는 전부 `S`/`Ss`/`S+`로 그냥 입력을 기다리는 정상 상태였다. CPU도 0%. OS 레벨에서는 이 프로세스가 멈췄다는 증거가 전혀 없었다.

여기서 처음엔 헷갈렸다. 화면은 분명히 멈춰 있는데, 프로세스는 아무 이상이 없다는 게 말이 안 됐다. 게다가 tmux pane과 실제 프로세스를 연결해보려니 `tmux list-panes`가 보여주는 pane의 현재 명령어가 `zsh`였다. nvim이 아니라. 화면엔 nvim이 떠 있는데 tmux는 그 pane에서 지금 zsh가 돌고 있다고 말하는 상황.

## tmux한테 직접 물어보기

여기서부터는 Blink 화면을 믿지 않고, tmux 서버가 실제로 들고 있는 상태를 하나씩 조회했다.

먼저 서버가 그 pane에 대해 들고 있는 화면 내용 자체를 그대로 꺼내봤다.

```bash
tmux capture-pane -t main:0.0 -p -S -20
```

결과는 nvim의 상태줄(`NORMAL .tmux.conf 19`)까지 포함한 완전한 nvim 화면이었다. 클라이언트 쪽 렌더링 문제가 아니라 서버 자체가 이 화면을 들고 있다는 뜻이었다.

다음으로, 서버 쪽에서 원래는 키보드로 직접 입력하는 행위를 그 pane에 꽂아보고 화면 반응을 봤다.

```bash
tmux send-keys -t main:0.0 j
```

`j`(커서 아래로)가 화면에 먹히질 않았다.

## 범인 특정: zsh의 탈을 쓴 프로세스

그래서 뭔가가 이 pane과 실제 zsh 사이에 끼어서 입출력을 막고 있다는 생각이 들었다. `ps`로 그 pane의 pid를 다시 들여다보니 명령어 이름이 그냥 `zsh`가 아니라 `zsh (kiro-cli-term)`이었다.

macOS의 `sample`로 이 프로세스의 실제 콜스택을 확인해봤다.

```bash
sample <PID> 1 -mayDie
```

나온 스택을 보다가 익숙한 이름 하나가 눈에 띄었다. `figterm`. Fig는 예전에 cli 자동완성 도구로 써본 적 있는 툴인데, 셸이 동작할 때 중간에 끼워들어서 동작하고 있어 보였다.

그래서 zsh config 파일인 `.zshrc`, `.zprofile`을 보니 Fig 관련 내용이 있었다.

```bash
# Kiro CLI pre block. Keep at the top of this file.
[[ -f "${HOME}/Library/Application Support/kiro-cli/shell/zshrc.pre.zsh" ]] && builtin source ...
# Kiro CLI post block. Keep at the bottom of this file.
[[ -f "${HOME}/Library/Application Support/kiro-cli/shell/zshrc.post.zsh" ]] && builtin source ...
```

Kiro CLI를 설치할 때 셸 rc 파일에 자동으로 심어지는 훅이다. 이 훅은 셸을 열 때마다 진짜 셸을 감싸는 `kiro-cli-term` 프록시를 하나 띄운다. 이 프록시가 인라인 자동완성과 명령어 컨텍스트 추적(AI 채팅 기능용)을 맡는다. 프로세스 트리로 그려보면 이랬다.

```
tmux pane (ttys005)
  └─ kiro-cli-term 프록시 (멈춘 지점)
       └─ 진짜 /bin/zsh (다른 pty, ttys006)
            └─ nvim (완전히 정상, CPU 0%로 얌전히 대기 중)
```

nvim은 처음부터 끝까지 멀쩡했다. 문제는 tmux pane과 진짜 셸 사이에 끼어 있던 이 프록시 때문이었다.

웹으로 치면 클라이언트와 서버 사이에 WebSocket 중계 서버가 하나 껴 있는 구조와 비슷하다. 이 프록시가 바깥쪽(tmux pane)에서 들어오는 입력을 받아 안쪽(진짜 zsh)으로 넘기고, 안쪽에서 나오는 출력을 다시 바깥으로 돌려주는 역할을 한다. 그런데 이 중계 서버 안에서 "안쪽에 새 데이터 오면 읽어서 넘겨줘" 하고 등록해둔 리스너 콜백 하나가 멈춰 있었다. 클라이언트(tmux pane)도 멀쩡하고, 서버(진짜 zsh와 그 안의 nvim)도 멀쩡한데, 둘을 이어주던 리스너 하나가 멎어버리니 양쪽 다 서로한테 아예 도달을 못 하게 된 것이다.

nvim은 정상이었지만, 그 앞에 잊고 있었던 kiro가 정상이 아니었다.

## 해결

멈춘 프록시부터 정리했다. 어차피 변경사항이 없었기 때문에 kill 해도 상관없었다.

```bash
kill <kiro-cli-term PID>
```

이 프록시가 죽으면서 안쪽 진짜 셸에 `SIGHUP`이 전파됐고, tmux pane은 루트 프로세스가 사라지며 자동으로 닫혔다. 다만 nvim의 실제 편집 프로세스(`nvim --embed`)는 부모가 죽은 뒤에도 launchd(PID 1)에 재입양되어 고아 프로세스로 살아남아 있었다. 그래서 `kill -9`로 마저 정리했다.

재발 방지를 위해 셸 통합 자체를 껐다. Kiro CLI에는 내장 제거 명령이 있다.

```bash
kiro-cli integrations uninstall dotfiles
```

"Uninstalled!"라고 떴지만 실제로 `~/Library/Application Support/kiro-cli/shell/` 안을 확인해보니 `zshrc.pre.zsh`, `zshrc.post.zsh`, `zprofile.pre.zsh`, `zprofile.post.zsh` 네 개는 그대로 남아 있었다(bash 계열 훅만 지워진 걸 보면 zsh 쪽 처리에 빠진 버그로 보인다). `.zshrc`, `.zprofile`에서 해당 훅 블록 네 곳을 직접 지우고 나서야 새로 여는 셸이 더는 프록시를 거치지 않는 걸 확인할 수 있었다.

## 정리

셸 자동완성이나 AI 통합처럼 터미널 세션 전체를 감싸는 도구는 편의 기능 하나를 위해 모든 입출력의 병목 지점이 하나 더 생긴다는 뜻이기도 하다. 그 지점이 죽으면 뒤에 있는 멀쩡한 프로세스까지 통째로 도달 불가능해진다는 걸 겪었다.

처음 화면이 멈추고 멈춘 원인을 찾는 과정에서 claude 도움이 없었으면... 아마 tmux 위에 돌고 있는 nvim을 탓하고 있었을탠데 해결해서 다행이다.

[^1]: 유닉스 `ps` 명령어가 보여주는 프로세스의 실행 상태값. `D`=디스크·네트워크 I/O 대기(강제종료도 안 먹힘), `T`=정지 신호 받음, `R`=실행 중(무한루프면 CPU 급등), `S`=정상 대기 등을 나타낸다.
