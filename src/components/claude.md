# 프로젝트: EXAM 100
## 📌 AI 기반 학교 맞춤형 시험 대비 솔루션

---

## 🎯 핵심 비전

### 교육 불평등 해소
- **교육 평등화**: 학원/과외 없이도 **학교 공식 자료만으로** 완벽한 시험 대비 가능.
- **출제자 관점 분석**: 단순 요약이 아닌 **교사(출제자)의 관점**에서 자료 간 반복 패턴 추출.
  - 교과서 탐구활동 + 수업 학습지 + 평가지의 **교차 분석**.
  - 키워드 반복도, 강조 빈도, 난이도 변화 추적.
  - 출제 가능성(%) = **통계 기반 확률**, 단순 추측 아님.

### 학교별 디지털 족보 구축
- 학생 업로드 자료의 축적 → 동일 학교/과목의 **출제 패턴 데이터베이스**.
- 시간이 지날수록 정확도 ↑ (Crowdsourcing 기반 진화).
- 같은 학교 학생들끼리 **자료 공유** (게이미피케이션 유도).

---

## 🛠 기술 스택 및 아키텍처

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (상태에 따른 동적 스타일링 우선)
- **상태 관리**: Zustand 또는 Jotai (Context API 대비 경량)
- **차트/시각화**: 
  - Recharts (실시간 성적 분석)
  - React-Mind-Map / Mermaid (개념 맵)
  - Highlight.js (교과서 키워드 시각화)

### Backend & Database
- **런타임**: Node.js (20+) with TypeScript
- **API**: Next.js API Routes 또는 **Hono** (경량, 엣지 호환)
- **데이터베이스**:
  - **Primary**: PostgreSQL (트랜잭션, 복잡한 쿼리)
  - **Cache**: Redis (실시간 랭킹, 세션)
  - **Document Store** (선택): MongoDB (비정형 자료 메타데이터)
- **파일 스토리지**:
  - AWS S3 또는 로컬 스토리지 (개발 초기)
  - CDN 연동 (배포 시)
- **AI/ML**:
  - **OCR**: Tesseract.js (client-side) 또는 Google Cloud Vision API
  - **텍스트 분석**: OpenAI API (`gpt-4-turbo-preview`)
  - **임베딩**: Cohere Embed 또는 OpenAI Embeddings (유사도 검사)
  - **문제 생성**: Claude API (via Anthropic)

### DevOps & 배포
- **버전 관리**: Git + GitHub
- **CI/CD**: GitHub Actions
- **호스팅**:
  - **Frontend**: Vercel (Next.js 최적화)
  - **Backend**: Railway, Render, 또는 AWS ECS
  - **Database**: Managed PostgreSQL (Neon, Supabase)
- **모니터링**: Sentry (에러), Datadog (성능)

---

## 📋 핵심 기능 요구사항

### 1️⃣ 정밀 분석 시스템

#### 자료 업로드 및 OCR
```
사용자 흐름:
(1) PDF/이미지 업로드 → (2) OCR 추출 → (3) 텍스트 정규화
→ (4) 임베딩 생성 → (5) DB 저장
```

**구현 상세**:
- **다중 포맷 지원**: PDF, JPG, PNG, HEIF (iOS)
- **질 관리**:
  - OCR 신뢰도 < 85% → 사용자 수동 교정 권유
  - 중복 감지 (해시 기반) → 불필요한 재분석 방지
- **메타데이터 추출**:
  ```json
  {
    "source_type": "textbook|worksheet|assessment",
    "chapter": "2-1",
    "keywords": ["광합성", "엽록체"],
    "confidence": 0.92,
    "extracted_at": "2025-04-22T10:30:00Z"
  }
  ```

#### 출제 가능성 분석
- **반복도 계산**:
  - 동일 키워드가 교과서+학습지+평가지 모두에 나타남 = 높은 출제율
  - 가중치: 교과서(30%) + 학습지(40%) + 평가지(30%)
- **시각적 강조 점수**:
  - 굵게, 밑줄, 상자 표시된 부분 OCR 시 가산점
- **최종 점수**:
  ```
  출제_확률(%) = (반복도_점수 × 0.6) + (강조_점수 × 0.2) + (최근성_점수 × 0.2)
  ```
- **근거 제시**:
  ```
  "출제 가능성: 87%
   근거: 교과서 p.45(굵음), p.52(강조) 
        + 학습지 #1,#3 (반복)
        + 평가지 선택형 #4
  ```

---

### 2️⃣ 단계별 학습 흐름

#### 1단계: 개념 지도 (Concept Map)
- **구조**:
  ```
  [핵심 개념 (중심)]
       ↓
  ├─ [하위 개념 1] → [세부사항]
  ├─ [하위 개념 2] → [세부사항]
  └─ [관계 개념] → [연결 설명]
  ```
- **상호작용**:
  - 노드 클릭 → 우측 패널에 상세 설명 + AI 챗봇
  - "더 알아보기" → 교과서 원문 링크 (OCR 시 페이지 매핑)
  - "나와 대화" → Claude API로 실시간 질답

#### 2단계: 확인 학습 (Basic Reinforcement)
- **문제 유형**:
  - 빈칸 넣기: `광합성은 [  ]에서 일어난다.` (정답: 엽록체)
  - O/X 판단: `"엽록체는 미토콘드리아다." (O/X)`
  - 순서 배열: `[가] → [나] → [다] 순서로 일어난다.`
- **자동 생성**:
  - 개념 지도의 키워드 → GPT로 5~10문항 자동 생성
  - 정답 정확도 검증 (프롬프트 엔지니어링)
- **난이도**:
  - Easy: 교과서 정의 직접 인용
  - Medium: 약간의 표현 변경
  - Hard: 응용/해석 필요

#### 3단계: 실전 문제 (Mock Exam)
- **기본 세트**: 총 30문항
  - 객관식(선택형): 23문항 (4지선다)
  - 단답형(서답): 5문항 (1~2줄)
  - 서술형: 2문항 (5~10줄, 채점은 AI 보조)
- **난이도 분포** (정규분포 가정):
  - 하: 40% (기본 이해도 확인)
  - 중: 40% (심화 개념)
  - 상: 20% (실제 시험 수준)
- **시간 제한**:
  - 객관식: 각 1.5분 (총 34.5분)
  - 단답형: 각 3분 (총 15분)
  - 서술형: 각 5분 (총 10분)
  - **전체 60분** (실제 시험 시간 시뮬레이션)

---

### 3️⃣ 피드백 및 Adaptive Learning

#### 틀린 문제 즉각 대응
```
사용자가 문제 틀림 → (1) 정답 공개
                 → (2) 관련 개념 재설명 (AI)
                 → (3) 유사 문제 자동 생성
                 → (4) 실력 점수 업데이트
```

**상세 프로세스**:
1. **근본 원인 분석**: "이 문제는 [광합성의 정의]를 묻는 문제입니다."
2. **개념 복습**: 해당 개념 맵 노드로 자동 이동 + 팝업 설명
3. **유사 문제 1개 즉시 제시**: "같은 개념을 묻는 다른 문제입니다."
4. **예상 점수 실시간 갱신**:
   ```
   진행도: ▓▓▓▓▓░░░░ (50%)
   현재 예상 점수: 72/100 (80%)
   (틀린 문제 3개 기반 통계)
   ```

#### 성장 대시보드
- **개인 통계**:
  - 전체 정답률 추이 (일주일 그래프)
  - 개념별 정답률 (약한 단원 강조)
  - 시간 관리 점수 (정시 제출율)
- **학교 비교** (선택사항, 익명):
  - "우리 학교 평균: 68점" vs "너의 현재: 72점 🔝"
  - (개인정보 보호: 절대 실명 노출 금지)

---

## 📂 데이터베이스 설계

### 핵심 테이블 구조

```sql
-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  school_name VARCHAR,    -- "낭중중학교"
  region VARCHAR,         -- "전주, 전북"
  grade INT,             -- 1, 2, 3
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 자료 (교과서, 학습지 등)
CREATE TABLE materials (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  school_id UUID REFERENCES schools,
  subject VARCHAR,       -- "생물", "수학" 등
  material_type ENUM('textbook', 'worksheet', 'assessment'),
  ocr_text TEXT,
  ocr_confidence FLOAT,
  file_url VARCHAR,
  uploaded_at TIMESTAMP,
  UNIQUE(school_id, subject, material_type)
);

-- 키워드 & 분석
CREATE TABLE keyword_analysis (
  id UUID PRIMARY KEY,
  material_id UUID REFERENCES materials,
  keyword VARCHAR,
  frequency INT,         -- 반복 횟수
  weight FLOAT,         -- 0.0 ~ 1.0 (중요도)
  source_page INT,
  created_at TIMESTAMP
);

-- 출제 확률 캐시
CREATE TABLE exam_predictions (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools,
  subject VARCHAR,
  grade INT,
  keyword VARCHAR,
  probability FLOAT,    -- 87% = 0.87
  last_updated TIMESTAMP,
  PRIMARY KEY (school_id, subject, grade, keyword)
);

-- 학생 진행률
CREATE TABLE student_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  subject VARCHAR,
  stage INT,            -- 1: 개념, 2: 확인, 3: 실전
  total_questions INT,
  correct_answers INT,
  time_spent_minutes INT,
  last_accessed TIMESTAMP
);

-- 스코어 히스토리 (Adaptive Learning용)
CREATE TABLE score_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  problem_id UUID,
  is_correct BOOLEAN,
  time_taken_seconds INT,
  difficulty_level ENUM('easy', 'medium', 'hard'),
  created_at TIMESTAMP,
  INDEX (user_id, created_at)
);
```

### 학교별 데이터 그룹화 (Key 설계)
```
Redis Key: `school:{school_id}:exam_stats:{subject}:{grade}`
Value: {
  "avg_score": 72.5,
  "total_students": 45,
  "upload_rate": 0.80,  // 80% 자료 구축됨
  "last_updated": "2025-04-22T10:00:00Z"
}
```

---

## 🎮 게이미피케이션 & 커뮤니티

### 1. 학교별 진도 표시
```
우리 학교 자료 구축률: ████████░ 80%
(영어: 100% | 수학: 60% | 과학: 75%)

"과학 자료 20% 더 업로드되면 모든 학생이 10포인트 보너스!"
```

### 2. 기여자 랭킹 (학교 내)
```
🥇 김민지 (자료 23개 업로드, 포인트 1,250)
🥈 이준호 (자료 18개, 포인트 980)
🥉 박하은 (자료 15개, 포인트 850)
```

### 3. 포인트 & 리워드 시스템
| 행동 | 포인트 |
|------|--------|
| 자료 업로드 (1개) | +50 |
| 자료 품질 평가 (평가자 추천) | +10 |
| 개념 학습 완료 | +5 |
| 실전 문제 풀이 (30문항) | +30 |
| 커뮤니티 질문 답변 우수성 | +25 |

### 4. 배지 시스템
```
🎯 "첫 자료 업로드" 배지
📚 "자료 수집가" (20개 이상 업로드)
⭐ "실력자" (3개월 평균 90점 이상)
👥 "멘토" (타 학생 질문 10개 이상 답변)
```

---

## 💰 비즈니스 모델 (BM)

### 사용자 분류
| 사용자 유형 | 특징 | 수익화 전략 |
|-----------|------|----------|
| **기여자** (Contributor) | 자료 업로드 활발 | 무료 + 포인트 적립 |
| **소비자** (Consumer) | 자료만 활용 | 유료 구독 또는 광고 |
| **하이브리드** | 업로드 + 학습 | 혼합 모델 |

### 초기 수익화 (6개월 ~ 1년)
1. **프리미엄 구독** ($4.99/월 또는 ₩4,900/월):
   - 무제한 AI 챗봇 상담
   - 실전 문제 무제한 생성
   - 광고 제거
   - 우선 채점 (서술형)

2. **학교 라이센스** (B2B):
   - 학교/학원 단체 계약
   - 선생님 대시보드 (학생 분석)
   - API 접근 (커스터마이징)

3. **데이터 기반 서비스** (향후):
   - 교육청/출판사에 "학교별 출제 트렌드" 판매
   - 교사용 "예상 출제 리포트" 유료 판매

### 초기 목표 (Year 1)
- **DAU (Daily Active Users)**: 10,000명
- **학교 커버리지**: 50개 학교
- **자료 축적**: 50,000개 이상
- **평균 시간**: 사용자당 월 10시간 (학습)

---

## ⚠️ 개발 규칙 및 자가 점검 (Self-Correction)

### Claude (AI 어시스턴트)를 위한 점검 리스트
- [ ] **SyntaxError 검증**: 작업 완료 전 **2회 이상 교차 검증**
  - JSX 태그 열림/닫힘 누락 확인
  - 괄호 쌍 불일치 확인
  - JSON 문법 오류 확인

- [ ] **예외 처리 강화**:
  - `try/catch` 필수 (API 호출, 파일 업로드, DB 쿼리)
  - Optional Chaining (`?.`) 사용 (null/undefined 안전)
  - Fallback UI 제공 (로딩, 에러 상태)

- [ ] **"Unexpected end of input" 방지**:
  - 입력 폼 제출 시 유효성 검사
  - 타임아웃 핸들링 (5초 이상 응답 없으면 재시도)
  - 사용자 취소 액션 명확히 처리

- [ ] **코드 제공 방식**:
  - ❌ 부분 코드 (copy-paste 불가)
  - ✅ **완전한 전체 파일** (바로 실행 가능)
  - ✅ 필요한 import 모두 포함
  - ✅ 환경 변수 예시 제공 (`.env.example`)

- [ ] **성능 최적화**:
  - 번들 크기 < 500KB (First Load)
  - Lighthouse 점수 > 80
  - 이미지 최적화 (WebP 포맷, 동적 로딩)

---

## 📚 폴더 구조 (제안)

```
exam-100/
├── README.md
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.js
│
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx           # 홈
│   ├── (auth)/
│   │   ├── signup/page.tsx
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx       # 메인 대시보드
│   │   ├── upload/page.tsx        # 자료 업로드
│   │   ├── analysis/page.tsx      # 분석 결과
│   │   ├── study/page.tsx         # 학습 단계 (1~3)
│   │   └── progress/page.tsx      # 진행률
│   ├── api/
│   │   ├── auth/
│   │   ├── materials/
│   │   ├── analysis/
│   │   ├── problems/
│   │   └── progress/
│   └── not-found.tsx
│
├── components/
│   ├── shared/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── upload/
│   │   ├── FileUploader.tsx
│   │   └── OCRViewer.tsx
│   ├── analysis/
│   │   ├── KeywordChart.tsx
│   │   ├── ExamPrediction.tsx
│   │   └── ConceptMap.tsx
│   ├── study/
│   │   ├── Stage1ConceptMap.tsx
│   │   ├── Stage2QuizForm.tsx
│   │   ├── Stage3MockExam.tsx
│   │   └── FeedbackPanel.tsx
│   └── community/
│       ├── Leaderboard.tsx
│       └── PointsDisplay.tsx
│
├── lib/
│   ├── db.ts              # PostgreSQL 연결
│   ├── redis.ts           # Redis 클라이언트
│   ├── ocr.ts             # Tesseract 래퍼
│   ├── openai.ts          # OpenAI API 래퍼
│   ├── auth.ts            # JWT / 세션
│   ├── validators.ts
│   └── utils.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useUpload.ts
│   ├── useAnalysis.ts
│   └── useProgress.ts
│
├── store/                 # Zustand 상태 관리
│   ├── authStore.ts
│   ├── uploadStore.ts
│   ├── studyStore.ts
│   └── leaderboardStore.ts
│
├── types/
│   ├── user.ts
│   ├── material.ts
│   ├── analysis.ts
│   ├── exam.ts
│   └── common.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/
│   ├── globals.css
│   └── tailwind.config.js
│
└── tests/                 # Jest + React Testing Library
    ├── unit/
    ├── integration/
    └── __fixtures__/
```

---

## 🚀 Phase별 개발 로드맵

### Phase 1: MVP (4주, 5월)
- [ ] 회원가입/로그인
- [ ] 자료 업로드 (PDF 기본)
- [ ] OCR 기본 (Tesseract.js)
- [ ] 개념 맵 (정적, 2단계)
- [ ] 확인 학습 (빈칸, O/X)
- [ ] 기초 대시보드

**목표**: 단일 학교(낭중중) 파일럿, 50명 테스트

### Phase 2: Core Feature (4주, 6월)
- [ ] AI 기반 출제 확률 분석
- [ ] 실전 문제 생성 (30문항)
- [ ] Adaptive Learning 피드백
- [ ] 커뮤니티 기능 (업로드 유도)
- [ ] 게이미피케이션 (포인트, 배지)

**목표**: 다중 학교 확대, 500명

### Phase 3: Polish & Scale (3주, 7월)
- [ ] 이미지 최적화
- [ ] 모바일 반응형 완성
- [ ] 성능 튜닝 (Lighthouse > 85)
- [ ] 보안 감사 (OWASP Top 10)
- [ ] 베타 버전 공식 출시

**목표**: 10개 학교, 2,000명

---

## ⚙️ 환경 설정 예시

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/exam100
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
OCR_PROVIDER=tesseract  # tesseract | google-vision

# 개발 서버 실행
npm run dev
# 또는
pnpm dev

# 빌드
npm run build

# 프로덕션 시작
npm start
```

---

## 📝 주의사항 및 법규

### 저작권 & 라이선스
- **교과서 자료**: 교육용 공정이용(Fair Use) 범위 내에서 분석만 진행
  - 전문 재배포 금지
  - 출처 명시 필수
- **학생 데이터**: GDPR / 개인정보보호법 준수
  - 14세 미만은 보호자 동의 필수
  - 삭제 권리 보장

### 접근성 (A11y)
- WCAG 2.1 AA 준수
- 스크린 리더 지원
- 색상 대비 비율 4.5:1 이상

---

## 👥 팀 역할 (제안)

| 역할 | 담당 | 스킬 |
|------|------|------|
| **PM** | 로드맵, 기획 | 교육 도메인 + 프로덕트 |
| **Backend** | API, DB | Node.js, PostgreSQL, AI |
| **Frontend** | UI/UX | React, TypeScript, Tailwind |
| **AI/ML** | 분석, 생성 | Python, OpenAI, LLM |
| **QA** | 테스트 | 자동화, 보안 감사 |

---

## 📞 연락처 & 문의

- **프로젝트 리더**: 클리나멘 (낭중중학교, 전주)
- **이메일**: [project@exam100.io](mailto:project@exam100.io)
- **GitHub**: [exam-100/main](https://github.com/exam-100)

---

## 🎓 최종 목표

**"모든 학생이 경제 형편에 관계없이 동등한 시험 대비 기회를 누릴 수 있는 세상"**

EXAM 100은 단순 시험 문제 생성 도구가 아닙니다.  
**교육 평등의 기초**를 만드는 프로젝트입니다.

---

*마지막 수정: 2025-04-22*
*상태: 활발히 개발 중*
