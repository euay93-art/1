// ============================================================
// prompts/make.mjs  —  인물 초상 프롬프트 생성기
//   node prompts/make.mjs  →  prompts/character-portraits.md
//
// 한 인물의 다섯 장은 고정 블록이 글자 단위로 같아야 한다.
// 손으로 쓰면 반드시 어긋나므로 여기서 찍어낸다.
// ============================================================
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const HERE = dirname(fileURLToPath(import.meta.url));

// ── 일곱 장 전부 공통 ───────────────────────────────────────
const STYLE =
`Cinematic character portrait in a refined semi-realistic painterly style — smooth polished rendering, delicate brushwork, the look of a high-end Korean period-drama key visual. Soft warm key light from the upper left with gentle fill, no harsh shadows. Luminous fair skin with a soft glow. Elegant jewel-toned palette — deep indigo, jade, plum, warm ivory — rich but never garish. Korea, 1934, Gyeongseong.`;

const FRAME =
`Bust portrait, chest and above only, centred, eye level, facing the viewer. Plain softly graded deep indigo backdrop with a faint warm glow behind the head; no scenery, no props, no furniture. Beautiful flawless skin, fine delicate features, the face fully and clearly lit. Ultra-detailed eyes and hair, soft rim light along the jaw. No text, no watermark, no border.`;

const NEGATIVE =
`harsh lighting, grim, gritty, muddy or desaturated colours, rough unfinished brushwork,
wrinkles, blemishes, dirt, scars, gaunt or sickly face, unflattering angle, 3D render,
plastic or glossy skin, anime, cartoon, chibi, doll-like, HDR, neon, modern clothing,
modern hairstyle, Chinese hanfu, Japanese kimono, text, letters, watermark, signature,
extra fingers, deformed hands, multiple people, full body, busy background, clutter`;

const ORDER = ["평상", "슬픔", "경계", "동요", "속내"];

const CAST = [
{ key: "gisaeng", title: "기생", note: "가장 화려하다. 일곱 중 눈에 먼저 들어와야 한다.",
  fixed: `A strikingly beautiful young Korean woman of twenty-three, with luminous porcelain skin, large clear dark eyes, and a small softly curved mouth painted deep rose. Glossy black hair dressed in a high traditional teureo-meori updo held by a slender silver binyeo pin; small jade earrings catching the light. Fine silk hanbok — a pale blush-pink jeogori with deep jade-green ties, over a jade-green skirt, the silk softly sheened. She is the most ornate and the most practised of the group.`,
  faces: {
    평상: `Composed and still, looking straight at the viewer, lips closed in the faint shape of a smile that her eyes do not join. This is the face she wears at work.`,
    슬픔: `The practised smile is gone. Her long lashes are lowered and wet, her gaze dropped softly to one side, her painted mouth pressed thin. She is not letting herself cry.`,
    경계: `A warm, perfect smile — and behind it, eyes measuring the viewer coolly, without blinking. Chin very slightly lowered. Charm used as a closed door.`,
    동요: `The smile slips a fraction too late. Her lips are parted, her eyes wide and bright, a single loose strand of hair fallen against her cheek.`,
    속내: `The performance set down at last. She looks at the viewer plainly and softly, no ornament left in her expression — younger than she has looked all evening.` } },

{ key: "operator", title: "전화교환수", note: "가장 현대적으로 보이는 인물. 안경이 표식이다.",
  fixed: `A coolly elegant young Korean woman of twenty-five with clear pale skin, fine bones and calm almond eyes behind small round wire-rimmed spectacles. Glossy black hair in a neat chin-length bob with a soft finger wave, parted at the side. Modern Western dress of the period: a cream high-collared blouse buttoned to the throat under a well-cut dark charcoal vest. No ornament at all. She is the most modern-looking of the group — precise, immaculate, exact.`,
  faces: {
    평상: `Perfectly still, head level, looking directly at the viewer through her spectacles. Neutral and unreadable — a face that gives nothing back.`,
    슬픔: `Her eyes are glassy behind the lenses and she is blinking too often to stop it. Her mouth is held firmly straight and her chin stays up.`,
    경계: `Her chin lifts a fraction and her gaze narrows behind the glass, sharp and appraising, one brow very slightly raised. She has already decided not to answer.`,
    동요: `She has taken the spectacles off and holds them near her collar. Without them her eyes look startlingly young and uncertain, fixed on nothing.`,
    속내: `The careful mask is down. She looks straight at the viewer with quiet, tired honesty, her face soft and open for the first time.` } },

{ key: "seamstress", title: "침모", note: "꾸미지 않았으나 고운 사람. 수수함이 아름다움을 가리면 안 된다.",
  fixed: `A serenely beautiful Korean woman of twenty-eight with smooth clear skin, gentle downturned eyes and a delicate mouth. Her glossy black hair is drawn into a plain low bun with no ornament, a few soft strands loose at the temples. Undyed cotton hanbok in soft dove-grey and warm ivory — simple, spotless, beautifully draped, without a single decoration. A small brass thimble on one finger. Hers is a quiet beauty that asks to be overlooked.`,
  faces: {
    평상: `Her eyes are lowered a little, as though to her hands below the frame. Calm and patient, entirely unremarkable — exactly as she intends to be.`,
    슬픔: `Her eyes are closed, her brow faintly drawn together, and a single tear rests on her cheek. She has not moved to wipe it away.`,
    경계: `She has gone very still and her gaze has come up, level and direct. Nothing in her face moves at all. Stillness used as a wall.`,
    동요: `Her lips are parted on a caught breath, her eyes darting aside, one hand risen near her collar.`,
    속내: `She meets the viewer's eyes at last, and her face is open with something she has carried a long time — gentle, exhausted, relieved.` } },

{ key: "midwife", title: "산파", note: "곱게 나이 든 얼굴. 늙은 얼굴이 아니라 깊은 얼굴이다.",
  fixed: `A beautifully aged Korean woman of forty-one, the eldest of the six and still handsome — warm smooth skin, elegant strong cheekbones, calm deep eyes with only the faintest lines at their corners. Black hair pinned back smoothly with one fine streak of silver at the temple. Plain deep-indigo hanbok under a crisp white cotton apron, the soft leather strap of a midwife's bag across one shoulder. Her hands are large, clean and steady.`,
  faces: {
    평상: `Steady and unhurried, looking straight at the viewer with the calm of someone who has seen both ends of a life many times over.`,
    슬픔: `Her eyes shine and her strong mouth has softened and turned down. Grief without any noise in it — the grief of a woman who has grieved before.`,
    경계: `Her gaze hardens and her jaw sets. She looks at the viewer the way she would look at a bad fever.`,
    동요: `Her composure breaks for a moment — eyes widening, lips parting, her head turned a fraction away.`,
    속내: `She has leaned in slightly and her face has opened entirely: warm, tired, and without a single thing held back.` } },

{ key: "printer", title: "인쇄 담당", note: "가장 어리고 가장 생기 있다. 잉크 자국은 때가 아니라 매력점이다.",
  fixed: `A fresh-faced beauty of twenty-two, the youngest of the group, with dewy skin, round bright eyes and a full soft mouth. Glossy black hair tied up loosely with strands escaping around her face. Sleeves rolled to the elbow over slim forearms. A dark indigo cotton work smock over a clean pale blouse. One small smudge of black mimeograph ink sits high on her cheekbone — the only mark on otherwise flawless skin. She is the most restless, most physical of the group.`,
  faces: {
    평상: `Bright and alert, looking straight at the viewer, chin up, her mouth already half-open on something she is about to say.`,
    슬픔: `Her face has crumpled open — eyes red and brimming, mouth pulled down, cheeks wet. She cries the way a child does, without hiding any of it.`,
    경계: `Her brows draw together and her mouth sets hard. She glares straight at the viewer, young and furious and entirely unafraid.`,
    동요: `She has gone pale and her eyes are darting; she bites the inside of her lip, one loose strand of hair stuck to her damp cheek.`,
    속내: `All the fight gone out of her. She looks up at the viewer with wide, wet, defenceless eyes and lets herself be seen.` } },

{ key: "peddler", title: "행상", note: "바깥 사람. 볕에 그을린 얼굴이 아니라 볕을 머금은 얼굴로.",
  fixed: `A warm, vivid beauty of twenty-six with a healthy golden glow to her skin, wide bright eyes and a generous mouth made for smiling. Her black hair is bound back under a folded indigo cotton head-cloth, a few strands loose at the temple. Sturdy cotton hanbok in deep faded indigo, with the wide cloth strap of a carrying bundle across her chest. She looks the healthiest and the most alive of the group.`,
  faces: {
    평상: `Open and easy, a broad friendly smile, meeting the viewer's eyes without a moment's hesitation. The most approachable face in the room.`,
    슬픔: `The smile is gone and her bright face has gone slack. Her eyes are wet and fixed on the middle distance, her mouth slightly open.`,
    경계: `The friendliness stays on her mouth but leaves her eyes, which have gone flat and watchful. Her head tilts a little to one side.`,
    동요: `Her smile holds a beat too long and then falters. Her eyes flick sideways and her throat moves as she swallows.`,
    속내: `Everything easy about her is gone. She looks straight ahead, still and hollow, her face stripped down to what lies underneath.` } },

{ key: "gyeju", title: "계주", note: "나머지 여섯이 올려다보는 사람. 기품으로 눌러야 한다.",
  fixed: `A striking, beautifully aged Korean woman of fifty-four with fine silver-streaked black hair drawn back into a smooth unadorned knot. Her skin is clear and softly lined only at the eyes; her bone structure is elegant and severe. Plain deep-charcoal silk hanbok with no ornament whatsoever — not a pin, not a ring. She carries herself perfectly straight. She is the one the others answer to.`,
  faces: {
    평상: `Absolutely still, looking directly at the viewer. Unblinking, unhurried, unmoved. This is the face of someone deciding.`,
    슬픔: `Her eyes glitter and her mouth tightens, and nothing else about her changes. She would not call this weeping.`,
    경계: `Her gaze sharpens to a point and her chin lowers a fraction, and she waits. It is not a question. It is a weighing.`,
    동요: `For one moment she is old — her eyes unfocused, her mouth slightly slack, her gaze gone somewhere far away.`,
    속내: `She looks at the viewer with terrible directness, her face open and grieving and resolute all at once.` } }
];

const PHOTO =
`A gently aged black-and-white photographic portrait from the 1930s, printed on soft
paper, with fine period grain and a slight silver sheen, softly focused at the edges,
one corner faintly bent. It shows a lovely Korean schoolgirl of seventeen with clear
skin, bright eyes and a wide open smile: chin-length bobbed hair, a white cotton jeogori
and a dark ankle-length skirt — the school uniform of the period. She is caught mid-laugh,
delighted, entirely alive.

Bust portrait, chest and above, centred, plain studio backdrop, soft flattering studio
light. It must read as a photograph, not a painting — an object someone has kept in a
pocket for years. No text, no watermark, no border, no frame.`;

// ── 찍어낸다 ────────────────────────────────────────────────
const L = [];
const p = s => L.push(s);

p(`# 침선계 — 인물 초상 프롬프트`);
p(``);
p(`7명 × 표정 5개 + 사진 1장 = **36장**.`);
p(``);
p(`각 항목은 그대로 복사해 붙이면 되는 완성된 프롬프트다. 한 인물의 다섯 장은 **고정 블록이 글자 단위로 동일**하고 표정 문단만 다르다 — 그래야 다섯 장이 같은 사람으로 나온다.`);
p(``);
p(`> 이 파일은 \`node prompts/make.mjs\` 로 찍어낸다. 고치려면 \`make.mjs\` 를 고치고 다시 돌린다.`);
p(``);
p(`---`);
p(``);
p(`## 먼저 읽을 것`);
p(``);
p(`**결**: 어둡고 거친 그림이 아니라 **잘 만든 시대극 포스터**다. 빛은 따뜻하고 부드럽게, 살결은 맑게, 색은 깊되 탁하지 않게. 시대는 옷과 머리로 드러내고, 얼굴은 곱게 간다.`);
p(``);
p(`**순서**: 일곱 명의 \`평상\`부터 한 장씩 뽑아 나란히 놓고 **누가 누군지 바로 구별되는지** 본다. 통과하면 그 한 장을 **스타일 참조로 걸고** 나머지 네 표정을 뽑는다. 참조를 안 걸면 다섯 장이 다섯 사람이 된다.`);
p(``);
p(`**크롭**: 일곱 명 전부 같은 높이, 같은 거리, 가슴 위까지. 표정이 바뀔 때 얼굴 크기가 튀면 안 된다.`);
p(``);
p(`**한 인물 안에서는 옷·머리·조명이 완전히 고정**이다. 바뀌는 것은 얼굴뿐이다.`);
p(``);
p(`**비율 3:4 세로 · 800×1067 이상 · 최종 WebP 80~120KB**`);
p(``);
p(`### 네거티브 프롬프트 (전부 공통)`);
p(``);
p("```");
p(NEGATIVE);
p("```");
p(``);
p(`---`);
p(``);

for (const c of CAST) {
    p(`# ${c.title}`);
    p(``);
    p(`> ${c.note} 다섯 장 내내 옷·머리·빛은 그대로다. \`${c.key}_평상.webp\` 처럼 저장.`);
    p(``);
    for (const face of ORDER) {
        p(`### ${c.title} ${face}`);
        p(``);
        p("```");
        p(STYLE);
        p(``);
        p(c.fixed);
        p(``);
        p(c.faces[face]);
        p(``);
        p(FRAME);
        p("```");
        p(``);
    }
    p(`---`);
    p(``);
}

p(`# 죽은 학생 (사진)`);
p(``);
p(`> 이것만 그림이 아니라 **사진**이다. 유품으로 나오는 물건이라 질감이 달라야 한다. \`student_photo.webp\` 로 저장.`);
p(``);
p(`### 죽은 학생 (사진)`);
p(``);
p("```");
p(PHOTO);
p("```");
p(``);

writeFileSync(join(HERE, "character-portraits.md"), L.join("\n"), "utf8");

const n = CAST.length * ORDER.length + 1;
console.log(`프롬프트 ${n}장 · 인물 ${CAST.length}명 · 표정 ${ORDER.length}개`);
for (const c of CAST) {
    const set = new Set(Object.keys(c.faces));
    const miss = ORDER.filter(f => !set.has(f));
    if (miss.length) { console.error(`  ✗ ${c.title}: ${miss.join(", ")} 없음`); process.exit(1); }
}
console.log("고정 블록 7종 · 표정 문단 35종 — 빠짐 없음");
