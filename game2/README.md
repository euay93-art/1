# 침선계 (針線契)

경성 1934. 바느질 계로 위장한 여섯 해. 물건을 나르던 열일곱 살이 붙들려 나흘 만에 죽었다.
계주는 정보를 넷으로 쪼개 나눠 줬는데, 순사는 넷을 다 쥐고 그 길목에 서 있었다.

쪼갠 것이 한 자리에 모였다. 그 자리가 누구 머릿속인지 찾는 게임이다.

## 어떻게 푸는가

알리바이가 아니라 **지식**으로 푼다. 가로 여섯(계원), 세로 넷(순사가 쥔 조각).
스물네 칸짜리 격자를 채우면 넷을 다 쥔 사람이 한 명 남는다.

칸은 손으로 채우는 것이 아니다. 근거를 손에 넣으면 저절로 채워지고,
근거 없이 채워지는 일은 없다.

## 실행

```bash
npm start          # http://localhost:4173 — 일곱 인물을 Claude가 연기한다
```

Claude Code 로그인(구독)을 그대로 쓴다. API 키가 필요 없다.
서버 없이 파일 하나로 돌리려면:

```bash
npm run build      # dist/chimseonkye.html
```

Artifact 로 올리면 페이지가 직접 Claude에게 묻는다. 그것도 없으면 각본 모드로 돌아간다 —
준비된 문답만으로도 끝까지 풀린다.

## 검사

```bash
npm run verify            # 격자가 서는가 + 끝까지 풀리는가
node test/playthrough.mjs # 사람이 하듯 끝까지 눌러본다
MODE=wrong node test/playthrough.mjs   # full·thin·doubt·wrong·silence
```

검증기는 **이름을 가린 채** 돌아간다. 결과를 봐도 답이 새지 않는다.
실명으로 보려면 `--spoil`.

## 파일

| | |
|---|---|
| `server/knowledge.js` | 지식 격자. **정답이 들어 있다.** 서버 전용 |
| `server/truth.js` | 실제로 일어난 일. 모든 단서가 여기서 나온다 |
| `server/characters.js` | 일곱 사람의 인격·기억·입 |
| `js/case.js` | 장소·증거·문답. 정답은 없다 |
| `js/sealed.js` | 봉인된 정답. `build/seal.mjs` 가 격자에서 찍어낸다 |
| `build/verify-*.mjs` | 논리가 서는가 / 손으로 풀리는가 |

`js/sealed.js` 는 손으로 고치지 않는다. 격자를 고치고 `npm run seal` 을 돌린다.
