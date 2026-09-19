# 침선계 — 인물 초상 프롬프트

7명 × 표정 5개 + 사진 1장 = **36장**.

각 항목은 그대로 복사해 붙이면 되는 완성된 프롬프트다. 한 인물의 다섯 장은 **고정 블록이 글자 단위로 동일**하고 표정 문단만 다르다 — 그래야 다섯 장이 같은 사람으로 나온다.

> 이 파일은 `node prompts/make.mjs` 로 찍어낸다. 고치려면 `make.mjs` 를 고치고 다시 돌린다.

---

## 먼저 읽을 것

**결**: 어둡고 거친 그림이 아니라 **잘 만든 시대극 포스터**다. 빛은 따뜻하고 부드럽게, 살결은 맑게, 색은 깊되 탁하지 않게. 시대는 옷과 머리로 드러내고, 얼굴은 곱게 간다.

**순서**: 일곱 명의 `평상`부터 한 장씩 뽑아 나란히 놓고 **누가 누군지 바로 구별되는지** 본다. 통과하면 그 한 장을 **스타일 참조로 걸고** 나머지 네 표정을 뽑는다. 참조를 안 걸면 다섯 장이 다섯 사람이 된다.

**크롭**: 일곱 명 전부 같은 높이, 같은 거리, 가슴 위까지. 표정이 바뀔 때 얼굴 크기가 튀면 안 된다.

**한 인물 안에서는 옷·머리·조명이 완전히 고정**이다. 바뀌는 것은 얼굴뿐이다.

**비율 3:4 세로 · 800×1067 이상 · 최종 WebP 80~120KB**

### 네거티브 프롬프트 (전부 공통)

```
harsh lighting, grim, gritty, muddy or desaturated colours, rough unfinished brushwork,
wrinkles, blemishes, dirt, scars, gaunt or sickly face, unflattering angle, 3D render,
plastic or glossy skin, anime, cartoon, chibi, doll-like, HDR, neon, modern clothing,
modern hairstyle, Chinese hanfu, Japanese kimono, text, letters, watermark, signature,
extra fingers, deformed hands, multiple people, full body, busy background, clutter
```

---

# 기생

> 가장 화려하다. 일곱 중 눈에 먼저 들어와야 한다. 다섯 장 내내 옷·머리·빛은 그대로다. `gisaeng_평상.webp` 처럼 저장.

### 기생 평상

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A strikingly beautiful young Korean woman of twenty-three, with luminous porcelain skin, large clear dark eyes, and a small softly curved mouth painted deep rose. Glossy black hair dressed in a high traditional teureo-meori updo held by a slender silver binyeo pin; small jade earrings catching the light. Fine silk hanbok — a pale blush-pink jeogori with deep jade-green ties, over a jade-green skirt, the silk softly sheened. She is the most ornate and the most practised of the group.

Composed and still, looking straight at the viewer, lips closed in the faint shape of a smile that her eyes do not join. This is the face she wears at work.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 기생 슬픔

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A strikingly beautiful young Korean woman of twenty-three, with luminous porcelain skin, large clear dark eyes, and a small softly curved mouth painted deep rose. Glossy black hair dressed in a high traditional teureo-meori updo held by a slender silver binyeo pin; small jade earrings catching the light. Fine silk hanbok — a pale blush-pink jeogori with deep jade-green ties, over a jade-green skirt, the silk softly sheened. She is the most ornate and the most practised of the group.

The practised smile is gone. Her long lashes are lowered and wet, her gaze dropped softly to one side, her painted mouth pressed thin. She is not letting herself cry.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 기생 경계

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A strikingly beautiful young Korean woman of twenty-three, with luminous porcelain skin, large clear dark eyes, and a small softly curved mouth painted deep rose. Glossy black hair dressed in a high traditional teureo-meori updo held by a slender silver binyeo pin; small jade earrings catching the light. Fine silk hanbok — a pale blush-pink jeogori with deep jade-green ties, over a jade-green skirt, the silk softly sheened. She is the most ornate and the most practised of the group.

A warm, perfect smile — and behind it, eyes measuring the viewer coolly, without blinking. Chin very slightly lowered. Charm used as a closed door.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 기생 동요

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A strikingly beautiful young Korean woman of twenty-three, with luminous porcelain skin, large clear dark eyes, and a small softly curved mouth painted deep rose. Glossy black hair dressed in a high traditional teureo-meori updo held by a slender silver binyeo pin; small jade earrings catching the light. Fine silk hanbok — a pale blush-pink jeogori with deep jade-green ties, over a jade-green skirt, the silk softly sheened. She is the most ornate and the most practised of the group.

The smile slips a fraction too late. Her lips are parted, her eyes wide and bright, a single loose strand of hair fallen against her cheek.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 기생 속내

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A strikingly beautiful young Korean woman of twenty-three, with luminous porcelain skin, large clear dark eyes, and a small softly curved mouth painted deep rose. Glossy black hair dressed in a high traditional teureo-meori updo held by a slender silver binyeo pin; small jade earrings catching the light. Fine silk hanbok — a pale blush-pink jeogori with deep jade-green ties, over a jade-green skirt, the silk softly sheened. She is the most ornate and the most practised of the group.

The performance set down at last. She looks at the viewer plainly and softly, no ornament left in her expression — younger than she has looked all evening.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

---

# 전화교환수

> 가장 현대적으로 보이는 인물. 안경이 표식이다. 다섯 장 내내 옷·머리·빛은 그대로다. `operator_평상.webp` 처럼 저장.

### 전화교환수 평상

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A coolly elegant young Korean woman of twenty-five with clear pale skin, fine bones and calm almond eyes behind small round wire-rimmed spectacles. Glossy black hair in a neat chin-length bob with a soft finger wave, parted at the side. Modern Western dress of the period: a cream high-collared blouse buttoned to the throat under a well-cut dark charcoal vest. No ornament at all. She is the most modern-looking of the group — precise, immaculate, exact.

Perfectly still, head level, looking directly at the viewer through her spectacles. Neutral and unreadable — a face that gives nothing back.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 전화교환수 슬픔

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A coolly elegant young Korean woman of twenty-five with clear pale skin, fine bones and calm almond eyes behind small round wire-rimmed spectacles. Glossy black hair in a neat chin-length bob with a soft finger wave, parted at the side. Modern Western dress of the period: a cream high-collared blouse buttoned to the throat under a well-cut dark charcoal vest. No ornament at all. She is the most modern-looking of the group — precise, immaculate, exact.

Her eyes are glassy behind the lenses and she is blinking too often to stop it. Her mouth is held firmly straight and her chin stays up.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 전화교환수 경계

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A coolly elegant young Korean woman of twenty-five with clear pale skin, fine bones and calm almond eyes behind small round wire-rimmed spectacles. Glossy black hair in a neat chin-length bob with a soft finger wave, parted at the side. Modern Western dress of the period: a cream high-collared blouse buttoned to the throat under a well-cut dark charcoal vest. No ornament at all. She is the most modern-looking of the group — precise, immaculate, exact.

Her chin lifts a fraction and her gaze narrows behind the glass, sharp and appraising, one brow very slightly raised. She has already decided not to answer.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 전화교환수 동요

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A coolly elegant young Korean woman of twenty-five with clear pale skin, fine bones and calm almond eyes behind small round wire-rimmed spectacles. Glossy black hair in a neat chin-length bob with a soft finger wave, parted at the side. Modern Western dress of the period: a cream high-collared blouse buttoned to the throat under a well-cut dark charcoal vest. No ornament at all. She is the most modern-looking of the group — precise, immaculate, exact.

She has taken the spectacles off and holds them near her collar. Without them her eyes look startlingly young and uncertain, fixed on nothing.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 전화교환수 속내

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A coolly elegant young Korean woman of twenty-five with clear pale skin, fine bones and calm almond eyes behind small round wire-rimmed spectacles. Glossy black hair in a neat chin-length bob with a soft finger wave, parted at the side. Modern Western dress of the period: a cream high-collared blouse buttoned to the throat under a well-cut dark charcoal vest. No ornament at all. She is the most modern-looking of the group — precise, immaculate, exact.

The careful mask is down. She looks straight at the viewer with quiet, tired honesty, her face soft and open for the first time.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

---

# 침모

> 꾸미지 않았으나 고운 사람. 수수함이 아름다움을 가리면 안 된다. 다섯 장 내내 옷·머리·빛은 그대로다. `seamstress_평상.webp` 처럼 저장.

### 침모 평상

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A serenely beautiful Korean woman of twenty-eight with smooth clear skin, gentle downturned eyes and a delicate mouth. Her glossy black hair is drawn into a plain low bun with no ornament, a few soft strands loose at the temples. Undyed cotton hanbok in soft dove-grey and warm ivory — simple, spotless, beautifully draped, without a single decoration. A small brass thimble on one finger. Hers is a quiet beauty that asks to be overlooked.

Her eyes are lowered a little, as though to her hands below the frame. Calm and patient, entirely unremarkable — exactly as she intends to be.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 침모 슬픔

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A serenely beautiful Korean woman of twenty-eight with smooth clear skin, gentle downturned eyes and a delicate mouth. Her glossy black hair is drawn into a plain low bun with no ornament, a few soft strands loose at the temples. Undyed cotton hanbok in soft dove-grey and warm ivory — simple, spotless, beautifully draped, without a single decoration. A small brass thimble on one finger. Hers is a quiet beauty that asks to be overlooked.

Her eyes are closed, her brow faintly drawn together, and a single tear rests on her cheek. She has not moved to wipe it away.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 침모 경계

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A serenely beautiful Korean woman of twenty-eight with smooth clear skin, gentle downturned eyes and a delicate mouth. Her glossy black hair is drawn into a plain low bun with no ornament, a few soft strands loose at the temples. Undyed cotton hanbok in soft dove-grey and warm ivory — simple, spotless, beautifully draped, without a single decoration. A small brass thimble on one finger. Hers is a quiet beauty that asks to be overlooked.

She has gone very still and her gaze has come up, level and direct. Nothing in her face moves at all. Stillness used as a wall.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 침모 동요

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A serenely beautiful Korean woman of twenty-eight with smooth clear skin, gentle downturned eyes and a delicate mouth. Her glossy black hair is drawn into a plain low bun with no ornament, a few soft strands loose at the temples. Undyed cotton hanbok in soft dove-grey and warm ivory — simple, spotless, beautifully draped, without a single decoration. A small brass thimble on one finger. Hers is a quiet beauty that asks to be overlooked.

Her lips are parted on a caught breath, her eyes darting aside, one hand risen near her collar.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 침모 속내

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A serenely beautiful Korean woman of twenty-eight with smooth clear skin, gentle downturned eyes and a delicate mouth. Her glossy black hair is drawn into a plain low bun with no ornament, a few soft strands loose at the temples. Undyed cotton hanbok in soft dove-grey and warm ivory — simple, spotless, beautifully draped, without a single decoration. A small brass thimble on one finger. Hers is a quiet beauty that asks to be overlooked.

She meets the viewer's eyes at last, and her face is open with something she has carried a long time — gentle, exhausted, relieved.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

---

# 산파

> 곱게 나이 든 얼굴. 늙은 얼굴이 아니라 깊은 얼굴이다. 다섯 장 내내 옷·머리·빛은 그대로다. `midwife_평상.webp` 처럼 저장.

### 산파 평상

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A beautifully aged Korean woman of forty-one, the eldest of the six and still handsome — warm smooth skin, elegant strong cheekbones, calm deep eyes with only the faintest lines at their corners. Black hair pinned back smoothly with one fine streak of silver at the temple. Plain deep-indigo hanbok under a crisp white cotton apron, the soft leather strap of a midwife's bag across one shoulder. Her hands are large, clean and steady.

Steady and unhurried, looking straight at the viewer with the calm of someone who has seen both ends of a life many times over.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 산파 슬픔

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A beautifully aged Korean woman of forty-one, the eldest of the six and still handsome — warm smooth skin, elegant strong cheekbones, calm deep eyes with only the faintest lines at their corners. Black hair pinned back smoothly with one fine streak of silver at the temple. Plain deep-indigo hanbok under a crisp white cotton apron, the soft leather strap of a midwife's bag across one shoulder. Her hands are large, clean and steady.

Her eyes shine and her strong mouth has softened and turned down. Grief without any noise in it — the grief of a woman who has grieved before.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 산파 경계

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A beautifully aged Korean woman of forty-one, the eldest of the six and still handsome — warm smooth skin, elegant strong cheekbones, calm deep eyes with only the faintest lines at their corners. Black hair pinned back smoothly with one fine streak of silver at the temple. Plain deep-indigo hanbok under a crisp white cotton apron, the soft leather strap of a midwife's bag across one shoulder. Her hands are large, clean and steady.

Her gaze hardens and her jaw sets. She looks at the viewer the way she would look at a bad fever.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 산파 동요

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A beautifully aged Korean woman of forty-one, the eldest of the six and still handsome — warm smooth skin, elegant strong cheekbones, calm deep eyes with only the faintest lines at their corners. Black hair pinned back smoothly with one fine streak of silver at the temple. Plain deep-indigo hanbok under a crisp white cotton apron, the soft leather strap of a midwife's bag across one shoulder. Her hands are large, clean and steady.

Her composure breaks for a moment — eyes widening, lips parting, her head turned a fraction away.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 산파 속내

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A beautifully aged Korean woman of forty-one, the eldest of the six and still handsome — warm smooth skin, elegant strong cheekbones, calm deep eyes with only the faintest lines at their corners. Black hair pinned back smoothly with one fine streak of silver at the temple. Plain deep-indigo hanbok under a crisp white cotton apron, the soft leather strap of a midwife's bag across one shoulder. Her hands are large, clean and steady.

She has leaned in slightly and her face has opened entirely: warm, tired, and without a single thing held back.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

---

# 인쇄 담당

> 가장 어리고 가장 생기 있다. 잉크 자국은 때가 아니라 매력점이다. 다섯 장 내내 옷·머리·빛은 그대로다. `printer_평상.webp` 처럼 저장.

### 인쇄 담당 평상

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A fresh-faced beauty of twenty-two, the youngest of the group, with dewy skin, round bright eyes and a full soft mouth. Glossy black hair tied up loosely with strands escaping around her face. Sleeves rolled to the elbow over slim forearms. A dark indigo cotton work smock over a clean pale blouse. One small smudge of black mimeograph ink sits high on her cheekbone — the only mark on otherwise flawless skin. She is the most restless, most physical of the group.

Bright and alert, looking straight at the viewer, chin up, her mouth already half-open on something she is about to say.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 인쇄 담당 슬픔

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A fresh-faced beauty of twenty-two, the youngest of the group, with dewy skin, round bright eyes and a full soft mouth. Glossy black hair tied up loosely with strands escaping around her face. Sleeves rolled to the elbow over slim forearms. A dark indigo cotton work smock over a clean pale blouse. One small smudge of black mimeograph ink sits high on her cheekbone — the only mark on otherwise flawless skin. She is the most restless, most physical of the group.

Her face has crumpled open — eyes red and brimming, mouth pulled down, cheeks wet. She cries the way a child does, without hiding any of it.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 인쇄 담당 경계

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A fresh-faced beauty of twenty-two, the youngest of the group, with dewy skin, round bright eyes and a full soft mouth. Glossy black hair tied up loosely with strands escaping around her face. Sleeves rolled to the elbow over slim forearms. A dark indigo cotton work smock over a clean pale blouse. One small smudge of black mimeograph ink sits high on her cheekbone — the only mark on otherwise flawless skin. She is the most restless, most physical of the group.

Her brows draw together and her mouth sets hard. She glares straight at the viewer, young and furious and entirely unafraid.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 인쇄 담당 동요

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A fresh-faced beauty of twenty-two, the youngest of the group, with dewy skin, round bright eyes and a full soft mouth. Glossy black hair tied up loosely with strands escaping around her face. Sleeves rolled to the elbow over slim forearms. A dark indigo cotton work smock over a clean pale blouse. One small smudge of black mimeograph ink sits high on her cheekbone — the only mark on otherwise flawless skin. She is the most restless, most physical of the group.

She has gone pale and her eyes are darting; she bites the inside of her lip, one loose strand of hair stuck to her damp cheek.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 인쇄 담당 속내

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A fresh-faced beauty of twenty-two, the youngest of the group, with dewy skin, round bright eyes and a full soft mouth. Glossy black hair tied up loosely with strands escaping around her face. Sleeves rolled to the elbow over slim forearms. A dark indigo cotton work smock over a clean pale blouse. One small smudge of black mimeograph ink sits high on her cheekbone — the only mark on otherwise flawless skin. She is the most restless, most physical of the group.

All the fight gone out of her. She looks up at the viewer with wide, wet, defenceless eyes and lets herself be seen.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

---

# 행상

> 바깥 사람. 볕에 그을린 얼굴이 아니라 볕을 머금은 얼굴로. 다섯 장 내내 옷·머리·빛은 그대로다. `peddler_평상.webp` 처럼 저장.

### 행상 평상

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A warm, vivid beauty of twenty-six with a healthy golden glow to her skin, wide bright eyes and a generous mouth made for smiling. Her black hair is bound back under a folded indigo cotton head-cloth, a few strands loose at the temple. Sturdy cotton hanbok in deep faded indigo, with the wide cloth strap of a carrying bundle across her chest. She looks the healthiest and the most alive of the group.

Open and easy, a broad friendly smile, meeting the viewer's eyes without a moment's hesitation. The most approachable face in the room.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 행상 슬픔

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A warm, vivid beauty of twenty-six with a healthy golden glow to her skin, wide bright eyes and a generous mouth made for smiling. Her black hair is bound back under a folded indigo cotton head-cloth, a few strands loose at the temple. Sturdy cotton hanbok in deep faded indigo, with the wide cloth strap of a carrying bundle across her chest. She looks the healthiest and the most alive of the group.

The smile is gone and her bright face has gone slack. Her eyes are wet and fixed on the middle distance, her mouth slightly open.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 행상 경계

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A warm, vivid beauty of twenty-six with a healthy golden glow to her skin, wide bright eyes and a generous mouth made for smiling. Her black hair is bound back under a folded indigo cotton head-cloth, a few strands loose at the temple. Sturdy cotton hanbok in deep faded indigo, with the wide cloth strap of a carrying bundle across her chest. She looks the healthiest and the most alive of the group.

The friendliness stays on her mouth but leaves her eyes, which have gone flat and watchful. Her head tilts a little to one side.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 행상 동요

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A warm, vivid beauty of twenty-six with a healthy golden glow to her skin, wide bright eyes and a generous mouth made for smiling. Her black hair is bound back under a folded indigo cotton head-cloth, a few strands loose at the temple. Sturdy cotton hanbok in deep faded indigo, with the wide cloth strap of a carrying bundle across her chest. She looks the healthiest and the most alive of the group.

Her smile holds a beat too long and then falters. Her eyes flick sideways and her throat moves as she swallows.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 행상 속내

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A warm, vivid beauty of twenty-six with a healthy golden glow to her skin, wide bright eyes and a generous mouth made for smiling. Her black hair is bound back under a folded indigo cotton head-cloth, a few strands loose at the temple. Sturdy cotton hanbok in deep faded indigo, with the wide cloth strap of a carrying bundle across her chest. She looks the healthiest and the most alive of the group.

Everything easy about her is gone. She looks straight ahead, still and hollow, her face stripped down to what lies underneath.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

---

# 계주

> 나머지 여섯이 올려다보는 사람. 기품으로 눌러야 한다. 다섯 장 내내 옷·머리·빛은 그대로다. `gyeju_평상.webp` 처럼 저장.

### 계주 평상

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A striking, beautifully aged Korean woman of fifty-four with fine silver-streaked black hair drawn back into a smooth unadorned knot. Her skin is clear and softly lined only at the eyes; her bone structure is elegant and severe. Plain deep-charcoal silk hanbok with no ornament whatsoever — not a pin, not a ring. She carries herself perfectly straight. She is the one the others answer to.

Absolutely still, looking directly at the viewer. Unblinking, unhurried, unmoved. This is the face of someone deciding.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 계주 슬픔

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A striking, beautifully aged Korean woman of fifty-four with fine silver-streaked black hair drawn back into a smooth unadorned knot. Her skin is clear and softly lined only at the eyes; her bone structure is elegant and severe. Plain deep-charcoal silk hanbok with no ornament whatsoever — not a pin, not a ring. She carries herself perfectly straight. She is the one the others answer to.

Her eyes glitter and her mouth tightens, and nothing else about her changes. She would not call this weeping.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 계주 경계

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A striking, beautifully aged Korean woman of fifty-four with fine silver-streaked black hair drawn back into a smooth unadorned knot. Her skin is clear and softly lined only at the eyes; her bone structure is elegant and severe. Plain deep-charcoal silk hanbok with no ornament whatsoever — not a pin, not a ring. She carries herself perfectly straight. She is the one the others answer to.

Her gaze sharpens to a point and her chin lowers a fraction, and she waits. It is not a question. It is a weighing.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 계주 동요

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A striking, beautifully aged Korean woman of fifty-four with fine silver-streaked black hair drawn back into a smooth unadorned knot. Her skin is clear and softly lined only at the eyes; her bone structure is elegant and severe. Plain deep-charcoal silk hanbok with no ornament whatsoever — not a pin, not a ring. She carries herself perfectly straight. She is the one the others answer to.

For one moment she is old — her eyes unfocused, her mouth slightly slack, her gaze gone somewhere far away.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

### 계주 속내

```
Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.

A striking, beautifully aged Korean woman of fifty-four with fine silver-streaked black hair drawn back into a smooth unadorned knot. Her skin is clear and softly lined only at the eyes; her bone structure is elegant and severe. Plain deep-charcoal silk hanbok with no ornament whatsoever — not a pin, not a ring. She carries herself perfectly straight. She is the one the others answer to.

She looks at the viewer with terrible directness, her face open and grieving and resolute all at once.

Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.
```

---

# 죽은 학생 (사진)

> 이것만 그림이 아니라 **사진**이다. 유품으로 나오는 물건이라 질감이 달라야 한다. `student_photo.webp` 로 저장.

### 죽은 학생 (사진)

```
A gently aged black-and-white photographic portrait from the 1930s, printed on soft
paper, with fine period grain and a slight silver sheen, softly focused at the edges,
one corner faintly bent. It shows a lovely Korean schoolgirl of seventeen with clear
skin, bright eyes and a wide open smile: chin-length bobbed hair, a white cotton jeogori
and a dark ankle-length skirt — the school uniform of the period. She is caught mid-laugh,
delighted, entirely alive.

Bust portrait, chest and above, centred, plain studio backdrop, soft flattering studio
light. It must read as a photograph, not a painting — an object someone has kept in a
pocket for years. No text, no watermark, no border, no frame.
```
