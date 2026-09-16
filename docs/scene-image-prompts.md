# 설야장 — 현장 이미지 생성 프롬프트

8개 장소를 한 채의 집처럼 보이게 만들기 위한 지침과 방별 프롬프트.

**원칙 하나**: 그림은 **1단(한눈에 보이는 것)만** 담는다. 해석과 세부(휜 분침, 장화 속 신문지 같은 것)는
텍스트가 맡는다. 그림에 억지로 넣으려 하면 반드시 어긋난다.

**원칙 둘**: 개수를 지킨다. 잔이 둘이면 둘이어야 한다. 셋으로 그려지면 그림이 어색한 게 아니라
**추리가 깨진다.** 생성 후 반드시 아래 검수표로 대조할 것.

---

## 0. 공통 스타일 (모든 프롬프트 앞에 붙인다)

작업 순서: **작업실을 먼저 만들어 마음에 드는 한 장을 확정하고**, 그 이미지를 스타일 참조로
걸어 나머지를 뽑는다. 같은 시드/스타일 참조를 쓰지 않으면 여덟 장이 각각 다른 집이 된다.

```
Dark painterly illustration, digital gouache with visible brushwork, slightly rough
and unpolished. Muted palette: deep navy-blue shadows, cold blue-white light from
snow outside, small warm amber pools from old lamps. Winter dawn, low weak sun,
overcast. A mountain lodge in Korea, 1990s construction, dark stained wood, worn
but well kept. Cold, still, hushed. Nobody is in the room. Eye-level view from the
doorway, wide angle, the whole room readable at a glance. No text, no labels,
no signage, no people, no faces.
```

**네거티브 프롬프트**

```
photorealistic, photograph, 3D render, glossy, HDR, lens flare, anime, cartoon,
chibi, bright saturated colors, neon, modern minimalist interior, IKEA, clutter
spam, people, faces, hands, text, letters, watermark, signature, blood splatter,
gore
```

**기술 사양**

| 항목 | 값 |
|---|---|
| 비율 | 16:9 (모바일에서 세로를 덜 먹는다) |
| 해상도 | 1600×900 이상 |
| 최종 포맷 | WebP, 장당 150–300KB로 압축 |
| 파일명 | `study.webp` / `hall.webp` / `living.webp` / `kitchen.webp` / `entrance.webp` / `yard.webp` / `boiler.webp` |

---

## 1. 2층 작업실 `study` ★ 먼저 만들 것

가장 볼 게 많고 시각적 보상이 가장 큰 방. 여기 한 장이 잘 나오면 나머지 기준이 된다.

```
An artist's studio on the second floor of a snowbound mountain lodge, early winter
morning. Wide view from the open doorway.

A heavy wooden desk in the middle, turned three-quarters to the viewer. On the desk:
exactly two drinking glasses, one tall and clear, one short tumbler. A closed desk
drawer. Papers.

On the wall beside the desk hangs one old dark-wood wall clock with a round face,
its glass broken. Scattered glints of broken glass lie on the desk surface, not on
the floor beneath the clock.

One tall window stands wide open. Snow has blown in and lies in a pale drift across
the floorboards beneath it. Cold blue light floods from that window; the rest of the
room is dim.

Against the walls: easels, stacked stretched canvases facing away, jars of brushes,
tubes of paint. A sketchbook lies on the floor half under the desk. A small dark
bronze figurine sits on the desk edge, out of place among the paint things.

An empty wooden chair is pushed back from the desk at an angle, as if someone left
in a hurry.
```

**시신 처리** — 두 안이 있다. 취향대로 고르되 둘 중 하나로 통일할 것.

- **권장 · 부재로 암시**: 위 프롬프트 그대로. 의자만 비어 있고 시신은 프레임 밖. 취향을 타지 않고
  이미지 생성 실패율이 낮다. `c_body` 핫스팟은 **의자와 책상 앞자리**에 건다.
- **직접 묘사**: 마지막 문단을 이걸로 교체. 얼굴이 절대 보이면 안 된다.
  ```
  A figure slumped forward over the desk, seen from behind, face hidden, in dark
  clothes. Rendered as a dark silhouette with no detail. No blood.
  ```

**반드시 보여야 할 것 (핫스팟 후보)**

| 물건 | 걸리는 단서 |
|---|---|
| 책상 앞 의자 / 엎드린 자리 | 시신 |
| 벽시계 | 멈춘 벽시계 → *(2단)* |
| 책상 위 잔 두 개 | 두 개의 잔 |
| 책상 서랍 | 휴대폰 |
| 열린 창 + 들이친 눈 | 창문 |
| 바닥의 스케치북 | 스케치북 |
| 청동 조각상 | 흉기 |

**절대 넣지 말 것**: 잔 세 개 이상, 시계 두 개, 창문이 여러 개 열린 상태, 깨진 유리가 시계 바로 아래 바닥에 있는 구도.

---

## 2. 정원과 진입로 `yard` ★ 먼저 만들 것

두 번째로 만들 장면. 실내 일곱 장 사이에서 **유일한 야외**라 대비 효과가 크다.

```
Exterior of a mountain lodge at dawn after a blizzard, seen from the side yard.
Knee-deep untouched snow everywhere, blue in the shadow.

The west wall of the main building rises on the left. High on that wall, one
second-floor window stands open, dark inside.

In the snow directly beneath that open window, a single line of boot prints leads
away from the building toward the viewer. The snow around them is otherwise smooth
and unbroken.

Far to the right, one narrow lane has been cleared through the deep snow down the
driveway, the cut edges sharp. A small walk-behind snow blower sits parked at the
end of it beside a low garage.

Bare birches, heavy grey sky, no sun disc. Very cold light.
```

**핫스팟**: 창 아래 발자국 / 제설된 진입로와 제설기 / 열린 2층 창(멀리)

**절대 넣지 말 것**: 발자국이 여러 줄, 발자국이 건물 쪽으로도 나 있는 그림, 사람, 차량 바퀴 자국.

---

## 3. 1층 거실 `living`

```
The main hall of a mountain lodge, early morning, lamps off. High ceiling, exposed
dark beams.

A large stone fireplace dominates one wall, cold ash heaped inside. On the mantel
above it, a bare marble pedestal stands empty — the dust around it wiped clean, a
clean rectangular mark on the stone where something used to sit.

A long sofa faces the fireplace, a blanket crumpled at one end. On the low table
beside it: one empty whisky bottle and exactly two glasses, one drained, one still
nearly full.

Through a glass partition on the far side, a kitchen is visible. Cold snow-light
from tall windows. Nobody here.
```

**핫스팟**: 벽난로 위 빈 받침대 / 벽난로 재 / 소파 옆 술병과 잔

---

## 4. 주방 `kitchen`

```
A lodge kitchen at dawn, connected to the main hall by a large glass partition
through which a sofa and a stone fireplace are clearly visible.

A small dining table by the window. On it, exactly two used teacups: one fine white
bone-china cup, one heavy mug with a chip out of its handle. Teabags still in them.

Through the window, deep snow and a single cleared lane running down the driveway.
Open shelves, a kettle, a cupboard of matching good cups left untouched.
```

**핫스팟**: 찻잔 두 개 / 거실이 보이는 통유리 창

**중요**: 통유리 너머로 **소파와 벽난로가 함께 보여야 한다.** 이 구조 자체가 단서다.

---

## 5. 현관과 신발장 `entrance`

```
The entrance hall of a mountain lodge. A low wooden shoe rack against the wall,
holding exactly five pairs of shoes, each arranged differently: one pair of polished
dress shoes squared perfectly toe-to-wall; a pair of sneakers with the heels crushed
down, kicked off carelessly; a pair of flat women's shoes pushed into the lowest,
most awkward shelf; two other pairs in between.

In the corner, one pair of tall black rubber work boots, old and worn, still wet.
A coat rack. The front door closed, snow packed against its base. No footprints on
the floor.
```

**핫스팟**: 신발 다섯 켤레 / 구석의 장화

---

## 6. 2층 복도와 계단 `hall`

```
A narrow upstairs corridor in a wooden lodge. Four closed guest-room doors along one
side, a fifth door at the far end standing ajar. Old worn floorboards, the centre
polished smooth from years of walking.

A heavy wooden staircase descends at the near end toward a dim hall below.

Pinned to the wall with a thumbtack, a single small handwritten note or chart,
too far to read.

Faint dried water marks trail along the very edge of the floorboards, hugging the
wall, not down the middle.
```

**핫스팟**: 벽의 손글씨 종이 / 가장자리 물자국 / 계단

---

## 7. 별관 보일러실 `boiler`

```
A cramped boiler room in an outbuilding. An old oil boiler with exposed pipes, one
section wrapped in insulation. A bare bulb. Oil-stained concrete floor.

Hand tools scattered on the floor where someone was working, a spill of antifreeze
not yet dry. A worn notebook lies open on a crate, pages dense with pencil writing,
unreadable at this distance.

Shelves of accumulated junk along one wall, decades of it, a few old newspapers
among the boxes.
```

**핫스팟**: 펼쳐진 노트 / 선반의 낡은 신문 뭉치 / 공구와 보일러

---

## 8. 객실 구역 `rooms`

이 장소만 성격이 다르다 — 방 네 개가 한 화면에 들어가야 해서 무리다.
**이미지 없이 지금의 목록 UI로 두는 것을 권한다.** 굳이 만든다면 복도에서 본 열린 문 네 개 정도.

---

## 생성 후 검수표

한 장 나올 때마다 이것부터 확인한다. 하나라도 어긋나면 **다시 뽑는다.**

- [ ] 개수가 맞는가 — 잔 2개, 찻잔 2개, 신발 5켤레, 발자국 1줄, 시계 1개
- [ ] 여덟 장이 같은 집으로 보이는가 — 목재 색, 벽 마감, 조명 톤
- [ ] 시간대가 같은가 — 전부 겨울 아침, 해 낮고 흐림
- [ ] 사람이 없는가 (작업실에서 시신 직접 묘사를 택한 경우만 예외)
- [ ] 글자·간판·워터마크가 없는가
- [ ] 핫스팟으로 걸 물건이 **충분히 크게** 찍혔는가 — 390px 폭에서 손가락으로 누를 수 있어야 한다
- [ ] 텍스트와 모순되는 것이 없는가 (예: 깨진 유리가 시계 바로 아래 바닥에 흩어져 있으면 안 된다)

## 핫스팟 좌표 잡는 법

이미지가 확정되면 좌표는 **퍼센트**로 잡는다. 픽셀로 잡으면 반응형에서 어긋난다.

```js
{ id: "c_clock", x: 62, y: 28, w: 9, h: 14 }   // 이미지 폭/높이 대비 %
```

모바일 기준으로 **최소 44×44px에 해당하는 크기**를 확보할 것. 390px 폭 이미지라면
가로 12% 이상이어야 손가락으로 누를 만하다. 그보다 작게 찍힌 물건은 핫스팟으로 쓰지 말고
큰 물건 안에 묶는다 (예: 작은 스케치북 → '책상 아래' 영역으로).
