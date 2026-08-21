# Pixel Lab — 포트폴리오 홈페이지

광고 영상 제작 크리에이티브 팀 **Pixel Lab**의 원페이지 포트폴리오 사이트입니다.
빌드 도구·프레임워크 없이 순수 HTML/CSS/JS로 만들어져 있어, 이 폴더를 그대로 어디에나 올리면 동작합니다.

---

## 1. 바로 열어보기

```bash
python3 -m http.server 8777 --directory "/Volumes/sub_storage/05.광고대행/pixel-lab-site"
```

브라우저에서 <http://localhost:8777> 접속.

> `index.html`을 파일로 직접 더블클릭해도 대부분 동작하지만, 브라우저 보안 정책 때문에
> 영상 로딩이 불안정할 수 있습니다. 위 명령으로 서버를 띄워서 보는 것을 권장합니다.

## 2. 배포

정적 사이트이므로 아래 어디든 폴더째 올리면 끝입니다.

| 서비스 | 방법 |
|---|---|
| **Netlify** | <https://app.netlify.com/drop> 에 `pixel-lab-site` 폴더를 드래그 |
| **Vercel** | `npx vercel --prod` (이 폴더에서) |
| **GitHub Pages** | 이 폴더를 저장소 루트로 push → Settings → Pages |
| **Cloudflare Pages** | 폴더 업로드, 빌드 명령 없음 |

전체 용량 **약 150MB** (영상 포함). Netlify·Vercel·Cloudflare 무료 플랜 모두 수용 범위입니다.

---

## 3. 꼭 바꿔야 할 것

### 연락처 — `index.html`

`<!-- ▼▼ 실제 연락처로 교체하세요 ▼▼ -->` 주석 블록 안에 임시값이 들어 있습니다.

```html
<a class="contact__mail reveal" href="mailto:hello@pixellab.kr" ...>hello@pixellab.kr</a>
```

→ `href`와 표시 텍스트를 실제 이메일로 바꾸세요. 바로 아래 `.contact__meta`의
기반 도시·작업 범위·응답 시간도 함께 확인해 주세요.

### 그 외 다듬을 수 있는 곳

- **팀 소개 / 멤버** — 현재 없습니다. `#studio` 섹션 뒤에 추가하면 자연스럽습니다.
- **수상 설명 문구** — `#awards` 섹션의 `<p>` 부연 설명.
- **캠페인 설명** — 34개 브랜드의 한 줄 설명은 이미지에서 읽어낸 내용을 바탕으로 작성했습니다.
  실제 클라이언트명·성과 지표가 있다면 `assets/js/data.js`의 `note` 값을 교체하세요.

---

## 4. 폴더 구조

```
pixel-lab-site/
├─ index.html                  ← 모든 마크업
├─ assets/
│  ├─ css/style.css            ← 디자인 토큰 + 전체 스타일
│  ├─ js/app.js                ← 인터랙션 (의존성 0)
│  ├─ js/data.js               ← 작품 데이터 (자동 생성됨)
│  ├─ img/thumb/  p001…p542    ← 그리드용 WebP (620px)
│  ├─ img/full/   p001…p542    ← 라이트박스용 WebP (1500px)
│  ├─ video/      w01…w22.mp4  ← 광고 영상 (H.264 720p)
│  ├─ poster/     w01…w22.jpg  ← 영상 포스터 프레임
│  └─ film/       gamff.mp4    ← GAMFF 수상작 (1080p) + 포스터
└─ encode.log                  ← w01~w22 ↔ 원본 파일명 대조표
```

원본 4K/2048px 소스는 건드리지 않았습니다. `광고영상/`, `제품_img/`, `팀수상작/` 폴더 그대로입니다.
`encode.log`를 보면 `w07.mp4`가 원본 어느 파일인지 바로 찾을 수 있습니다.

---

## 5. 작품 추가·수정하기

`assets/js/data.js` 하나만 고치면 화면 전체가 따라옵니다.
페이지의 모든 숫자(34개 브랜드 / 542컷 / 23편)는 이 파일에서 자동 계산되므로
**직접 숫자를 고칠 필요가 없습니다.**

```js
window.PL = {
  brands: [                       // 캠페인 카드
    { key:"VITAL", name:"VITAL°", product:"콜라겐 펩타이드",
      cat:"헬스·F&B",             // ← cats 배열의 값 중 하나
      note:"한 줄 설명",
      cover:"p227",               // 카드 대표 이미지 id
      shots:["p095","p108", …] }, // 케이스 패널에 열리는 이미지들
  ],
  videos: [                       // 광고 영상 카드
    { id:"w01", brand:"AURÉLIE", title:"시그니처 퍼퓸 필름",
      cat:"뷰티", ratio:"16:9", dur:"15s" },
  ],
  all: [ {id:"p001", b:"CHEFLIX", w:2048, h:2048}, … ],  // 전체 아카이브
  cats: ["전체","뷰티","헬스·F&B", …]                     // 필터 칩
};
```

새 이미지를 넣을 때는 `assets/img/thumb/`와 `assets/img/full/`에 같은 이름으로
WebP 두 벌을 넣고 `all`과 해당 브랜드의 `shots`에 id를 추가하면 됩니다.

---

## 6. 구현 메모

- **의존성 없음.** 외부 JS 라이브러리를 쓰지 않습니다. 폰트만 Google Fonts(Archivo,
  Instrument Serif)와 Pretendard CDN을 참조하며, 오프라인이면 시스템 폰트로 자연스럽게 대체됩니다.
- **액센트 컬러 `#FF5A1F`** 는 GAMFF 수상작 «GOYO»의 오렌지 시그널 파형에서 뽑았습니다.
- **성능** — 아카이브 542컷은 한 번에 그리지 않고 72장씩 점진적으로 렌더링하며,
  모든 이미지가 `loading="lazy"`입니다. 영상은 마우스를 올린 순간에 처음 다운로드됩니다.
- **접근성** — `prefers-reduced-motion`을 존중해 애니메이션·영상 자동 전환을 끕니다.
  라이트박스는 `Esc` / `←` / `→` 키와 터치 스와이프를 지원합니다.
- **딥링크** — `index.html#work` 처럼 해시를 붙이면 해당 섹션에서 열립니다.
