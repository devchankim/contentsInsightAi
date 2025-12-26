# InsightWorkspace MVP

> 당신의 통찰에 AI의 날개를 달아주는 컨텐츠 기획 파트너

개인 유튜버(정보/지식형)가 레퍼런스 구조와 자신의 관점을 섞어 **촬영 가능한 2-Column 대본**을 빠르게 만드는 웹 애플리케이션입니다.

**핵심 성공 지표**: 제작시간 단축 (기획→초안: 30분 → 10분)

## ✨ 주요 특징

- 🎯 **레퍼런스 구조 + 내 관점 결합**: 검증된 구조에 나만의 콘텐츠를 담아 독창성 확보
- 📊 **인사이트 카드 시스템**: 성공 패턴을 카드로 추출해 선택적으로 적용
- 📝 **2-Column 스크립트**: Visual(화면/자막) + Audio(내레이션) 형식으로 즉시 촬영 가능
- 🔄 **LLM Provider 교체 가능**: OpenAI/Anthropic 자유 선택
- 📤 **즉시 Export**: Markdown 다운로드 + 클립보드 복사

## 🚀 빠른 시작 (Quick Start)

### 자동 설치 (권장)

```bash
./setup.sh
```

설치 후:
1. `server/.env` 파일에 API 키 입력
2. 터미널 1: `cd server && npm run start:dev`
3. 터미널 2: `cd web && npm run dev`
4. 브라우저: `http://localhost:5173`

### 수동 설치

**1. 백엔드 설정**
```bash
cd server
npm install
cp .env.example .env
# .env 파일에 OPENAI_API_KEY, ANTHROPIC_API_KEY 입력
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev  # http://localhost:3000
```

**2. 프론트엔드 설정**
```bash
cd web
npm install
npm run dev  # http://localhost:5173
```

## 📂 프로젝트 구조

```
contentsInsightAi/
├── server/                  # NestJS 백엔드
│   ├── src/
│   │   ├── prisma/         # DB 연결 (SQLite)
│   │   ├── llm/            # LLM Provider (OpenAI/Anthropic)
│   │   ├── project/        # 프로젝트 CRUD
│   │   ├── generate/       # 분석/대본 생성 로직
│   │   └── metrics/        # 성과 측정
│   ├── prisma/schema.prisma
│   └── public/             # Vue 빌드 결과물 (배포 시)
│
├── web/                    # Vue 3 프론트엔드
│   ├── src/
│   │   ├── views/          # ProjectList, Workspace
│   │   ├── api/            # API 클라이언트
│   │   └── router/
│   └── dist/               # 빌드 산출물
│
├── setup.sh                # 자동 설치 스크립트
├── DEVELOPMENT.md          # 개발자용 가이드
├── FEATURES.md             # PM/기획자용 기능 명세
└── README.md
```

## 🎯 핵심 기능

### 1. 프로젝트 관리
- 프로젝트 생성/열기/삭제
- 최근 수정 순 정렬
- 생성 횟수 표시

### 2. 분석하기 (인사이트 카드 생성)
- **입력**: 레퍼런스 텍스트 + 내 메모
- **출력**: 구조(Hook/Body/Turn/Conclusion) + 인사이트 카드(5~10개)
- **활용**: 카드 선택/해제로 대본에 반영

### 3. 대본 생성하기 (2-Column 스크립트)
- **설정**: 톤앤매너(3종) / 후킹 스타일(3종) / 목표 길이(3/6/10분)
- **출력**: 제목 후보(5개) + 썸네일 컨셉(3개) + 2-Column 스크립트
- **형식**: Visual(화면/자막) | Audio(내레이션)

### 4. 리터칭 (부분 수정)
- 스크립트 행 선택 → "더 짧게 / 더 자극적으로 / 유머 추가"
- 수정 결과 확인 후 적용/취소

### 5. Export
- **Markdown 다운로드**: 2-Column 표 형식 유지
- **클립보드 복사**: 즉시 다른 도구로 이동 가능

## 🛠 기술 스택

### Backend
- **NestJS** (TypeScript)
- **Prisma** + SQLite (→ Postgres 전환 가능)
- **OpenAI API** (GPT-4o-mini)
- **Anthropic API** (Claude-3.5-Sonnet)

### Frontend
- **Vue 3** (Composition API)
- **Vite** (빌드 도구)
- **Axios** (HTTP 클라이언트)
- **Vue Router** (라우팅)

### 아키텍처
- **단일 배포**: NestJS가 Vue 빌드 결과물 서빙 (초기)
- **분리 가능**: API 경계 명확히 설계 (나중에 프론트/백 분리 배포 용이)

## 📊 성과 측정 (Dogfooding)

### 측정 항목
- 분석 생성 시간 (`generationTimeMs`)
- 대본 생성 시간
- 재생성 횟수
- 토큰 사용량 (`tokensUsed`)

### API
```bash
# 프로젝트별 메트릭
GET /api/metrics/project/:id

# 전체 메트릭
GET /api/metrics/summary
```

## 📦 프로덕션 배포

### 단일 배포 (NestJS가 Vue 서빙)

```bash
# 1. Vue 빌드 → server/public/로 복사
cd web
npm run build:deploy

# 2. NestJS 빌드 및 실행
cd ../server
npm run build
npm run start:prod
```

→ `http://localhost:3000` (API + 웹 모두 서빙)

### 환경 변수 (프로덕션)
```env
PORT=3000
NODE_ENV=production
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL="file:./prod.db"  # 또는 Postgres URL
```

## 🗺 개발 로드맵

### ✅ 0~2주: Dogfooding MVP (완료)
- [x] NestJS + Vue 단일 배포 구조
- [x] SQLite + Prisma 데이터 모델
- [x] OpenAI/Anthropic LLM Provider
- [x] 분석 API (인사이트 카드)
- [x] 대본 생성 API (2-Column)
- [x] 3분할 Workspace UI
- [x] 리터칭 기능
- [x] Markdown Export
- [x] 성과 측정 로깅

### 🚧 2~4주: 제작시간 단축 체감 강화
- [ ] 생성 히스토리/버전 비교
- [ ] 프리셋 품질 고도화 (프롬프트 튜닝)
- [ ] PDF Export
- [ ] Progressive disclosure UX
- [ ] 입력 가이드 (글자수/품질)

### 📅 향후 계획
- [ ] 유튜브 URL 자동 자막 추출 (정책/리스크 검토 후)
- [ ] 썸네일 이미지 생성 (DALL-E/Midjourney 연동)
- [ ] 채널별 맞춤형 RAG (사용자 채널 학습)
- [ ] 쇼츠 변환 (긴 영상 → 1분 쇼츠 대본)
- [ ] 협업 기능 (공유/코멘트)

## 📚 문서

- **[DEVELOPMENT.md](./DEVELOPMENT.md)**: 개발자용 상세 가이드 (DB 스키마, API, 확장 방법)
- **[FEATURES.md](./FEATURES.md)**: PM/기획자용 기능 명세 (화면별 기능, 확장 포인트)

## 🤝 기여

이 프로젝트는 MVP 단계입니다. 피드백/이슈/PR 환영합니다!

## 📄 라이선스

MIT

## 🙏 운영 정책

- **프라이버시**: 사용자 입력 텍스트는 생성 목적으로만 사용 (LLM 모델 학습 X)
- **저작권**: 레퍼런스는 구조/전개 참고용, 문장 복제 지양 (프롬프트에 명시)

---

**문의**: 이슈 탭 또는 PR로 연락 주세요.

