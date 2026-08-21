# Pixel Lab — 포트폴리오 홈페이지

광고 영상 제작 크리에이티브 팀 **Pixel Lab**의 원페이지 포트폴리오 사이트입니다.
빌드 도구·프레임워크 없이 순수 HTML/CSS/JS로 만들어져 있어, 이 폴더를 그대로 어디에나 올리면 동작합니다.

## 🌐 라이브 주소

**<https://parkchaorm-create.github.io/pixel-lab/>**

GitHub Pages(무료)로 호스팅 중입니다. 저장소: <https://github.com/parkchaorm-create/pixel-lab>

수정 후 반영하려면 이 폴더에서:

```bash
git add -A && git commit -m "수정 내용" && git push
```

1~2분 뒤 자동 반영됩니다.

---

## 1. 로컬에서 열어보기

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

## 3. 꼭 바꿔야 할 것 — 폼 연결

`assets/js/app.js` 상단의 `FORM` 객체 **딱 세 줄**입니다.

```js
const FORM = {
  ENDPOINT: '',                  // ← 폼 수신 주소 (아래 참고)
  MAILTO:   'hello@pixellab.kr', // ← 실제 수신 이메일 (현재 임시값)
  GUIDE:    'assets/guide/pixel-lab-detail-page-guide.pdf',
};
```

### 지금 상태 (ENDPOINT 비어 있음)

폼을 제출하면 **방문자의 메일 앱이 내용이 채워진 채로 열립니다.**
설정 없이도 문의가 끊기지 않지만, 방문자가 한 번 더 '보내기'를 눌러야 합니다.
`MAILTO`만 실제 주소로 바꾸면 오늘부터 쓸 수 있습니다.

### 권장 — 무료 폼 수신 서비스 연결 (5분)

1. <https://formspree.io> 가입 후 새 폼 생성 (무료: 월 50건)
2. 발급된 주소(`https://formspree.io/f/xxxxxxx`)를 `ENDPOINT`에 붙여넣기

그러면 방문자가 버튼 한 번만 누르면 되고, 제출 내역이 대시보드에 쌓이며
이메일로도 알림이 옵니다. Basin·Getform·Web3Forms도 같은 방식으로 동작합니다.

> 계정 생성은 직접 하셔야 합니다. 폼 자체는 이미 두 방식 모두에 맞게 만들어져 있습니다.

### 리드마그넷 PDF

무료 자료는 **2종 세트**입니다.

| 파일 | 내용 |
|---|---|
| `pixel-lab-audit.pdf` | 「상품페이지 15컷 자가진단」 — 15컷 순서 · 고객 질문 · 사진/영상 구분 · 15점 진단표 |
| `pixel-lab-brief.pdf` | 「제품영상 기획서 템플릿」 — 15초 4비트 양식 · 훅 8가지 · 견적 전 체크 12 |

내용을 고치려면 `_source-audit.html` / `_source-brief.html`을 수정한 뒤 브라우저 인쇄 → PDF 저장,
미리보기 이미지(`pages/audit1~4.webp`, `pages/brief1~4.webp`)도 함께 갱신하세요.

**설계 의도** — 자가진단은 셀러가 직접 실행하고, 실행하면 '영상이어야 하는 다섯 컷'이 비어 있다는 걸
스스로 발견합니다. 기획서 템플릿은 그다음 단계(발주)를 잡아줍니다. 영상 제작을 직접 하라고 부추기는
자료는 넣지 않았습니다 — 셀러도 원하지 않고, 우리 사업과도 어긋납니다.
내용을 고치려면 같은 폴더의 `_source.html`을 수정한 뒤 브라우저에서 인쇄 → PDF로 저장하고,
표지 미리보기 이미지(`assets/guide/pages/p1~4.webp`)도 같이 갱신하세요.

### 데이터 섹션의 수치

`#data` 섹션 숫자는 **외부 조사·플랫폼 공개 자료**이며 Pixel Lab의 성과가 아닙니다.
섹션 하단에 출처 링크가 달려 있고, 본문에도 그렇게 명시했습니다.
자사 실적 수치가 생기면 별도 섹션으로 분리해 표기해 주세요 (섞으면 안 됩니다).

**네이버 관련 주의** — 「영상 유무에 따른 네이버 전환율」 공개 수치는 존재하지 않습니다.
검색되는 네이버 숫자는 대부분 쇼핑라이브 거래액 성장률이고, 그건 플랫폼 사업 실적이지
판매자 상품페이지의 전환 상승이 아닙니다. 첫 칸은 국내 쇼핑몰 평균 전환율(기준선)로 두었습니다.
자체 네이버 데이터가 생기면 그때 교체하세요.

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
