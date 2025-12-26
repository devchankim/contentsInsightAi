# InsightWorkspace MVP - 개발 가이드

## 프로젝트 구조

```
contentsInsightAi/
├── server/               # NestJS 백엔드
│   ├── src/
│   │   ├── main.ts      # 서버 엔트리포인트
│   │   ├── app.module.ts
│   │   ├── prisma/      # 데이터베이스 연결
│   │   ├── llm/         # LLM Provider (OpenAI/Anthropic)
│   │   ├── project/     # 프로젝트 CRUD
│   │   ├── generate/    # 분석/대본 생성 로직
│   │   └── metrics/     # 성과 측정
│   ├── prisma/
│   │   └── schema.prisma # DB 스키마
│   └── public/          # Vue 빌드 결과물 (배포 시)
├── web/                 # Vue 3 프론트엔드
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── views/       # 페이지
│   │   │   ├── ProjectList.vue
│   │   │   └── Workspace.vue
│   │   ├── api/         # API 클라이언트
│   │   └── router/
│   └── dist/            # 빌드 산출물
└── README.md
```

## 시작하기

### 1. 초기 설정 (자동)

```bash
chmod +x setup.sh
./setup.sh
```

### 2. 환경 변수 설정

`server/.env` 파일을 열어 API 키를 입력하세요:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. 개발 서버 실행

**터미널 1 (백엔드):**
```bash
cd server
npm run start:dev
```
→ http://localhost:3000

**터미널 2 (프론트엔드):**
```bash
cd web
npm run dev
```
→ http://localhost:5173

## 주요 기능 흐름

### 1. 프로젝트 생성
- 홈(`/`) → "새 프로젝트" 버튼
- API: `POST /api/projects`

### 2. 분석하기 (인사이트 카드 생성)
- Workspace(`/project/:id`) → 좌측에 입력 → "분석하기"
- API: `POST /api/generate/analysis`
- 결과: 구조(Outline) + 인사이트 카드(InsightCards)

### 3. 대본 생성하기 (2-Column 스크립트)
- 프리셋/후킹/길이 설정 → "대본 생성하기"
- API: `POST /api/generate/script`
- 결과: 제목 후보 + 썸네일 컨셉 + 2-Column 스크립트

### 4. 리터칭 (부분 수정)
- 스크립트 행 클릭 → "더 짧게 / 더 자극적으로 / 유머 추가"
- API: `POST /api/generate/retouch`

### 5. Export
- Markdown 다운로드
- 클립보드 복사

## 데이터베이스

### 스키마

- **Project**: 프로젝트 기본 정보
- **SourceText**: 레퍼런스/내메모 텍스트
- **GenerationRun**: 생성 이력 (분석/대본, 시간, 토큰 등)

### Prisma 명령어

```bash
cd server

# 스키마 변경 후 마이그레이션
npx prisma migrate dev --name <변경내용>

# Prisma Studio (DB GUI)
npx prisma studio

# DB 초기화 (주의!)
npx prisma migrate reset
```

## LLM Provider

### 구조
- `LlmProvider` 인터페이스 (교체 가능)
- `OpenAiProvider` (GPT-4o-mini)
- `AnthropicProvider` (Claude-3.5-Sonnet)

### 프롬프트 위치
`server/src/generate/prompts/prompts.ts`

- `ANALYSIS_SYSTEM_PROMPT`: 분석 시스템 프롬프트
- `SCRIPT_SYSTEM_PROMPT`: 대본 시스템 프롬프트
- `RETOUCH_SYSTEM_PROMPT`: 리터칭 시스템 프롬프트

### 모델 변경
각 Provider 클래스의 `defaultModel` 수정

## 프로덕션 배포

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

→ http://localhost:3000 (API + 웹 모두 서빙)

### 분리 배포 (나중에)
- 프론트: Vercel/Netlify
- 백엔드: Railway/Fly.io
- CORS 설정 필요

## 성능 측정 (Dogfooding)

### 측정 항목
- 분석 생성 시간 (`generationTimeMs`)
- 대본 생성 시간
- 재생성 횟수 (`runs.length`)
- 토큰 사용량 (`tokensUsed`)

### API
```bash
# 프로젝트별 메트릭
GET /api/metrics/project/:id

# 전체 메트릭
GET /api/metrics/summary
```

## 확장 포인트 (PM용)

### 1. 새 프리셋 추가
`web/src/views/Workspace.vue`:
```typescript
const presets = [
  { value: 'knowledge', label: '지식전달형' },
  { value: 'new_preset', label: '새 프리셋' }, // 추가
];
```

`server/src/generate/prompts/prompts.ts`:
```typescript
// SCRIPT_USER_PROMPT_TEMPLATE에서 preset 분기 추가
```

### 2. 인사이트 카드 타입 확장
`server/src/generate/dto/generate.dto.ts`:
```typescript
export interface InsightCard {
  id: string;
  title: string;
  description: string;
  suggestedPosition: 'hook' | 'body' | 'turn' | 'conclusion';
  intensity: number;
  cardType?: 'pattern' | 'metaphor' | 'case'; // 추가
}
```

### 3. 타겟 페르소나 입력 추가
`GenerateScriptDto`에 `targetAudience` 필드 추가 → 프롬프트에 반영

## 트러블슈팅

### "OPENAI_API_KEY not found"
→ `server/.env` 파일에 키 추가 필요

### "Database locked"
→ SQLite 동시 접근 제한. Postgres로 전환 고려

### CORS 에러 (개발 시)
→ Vite proxy 설정 확인 (`web/vite.config.ts`)

### LLM 응답 파싱 실패
→ `llmService.parseJsonResponse`에서 fallback 처리됨. 프롬프트 개선 필요

## 라이선스
MIT

