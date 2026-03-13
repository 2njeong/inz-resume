import { RoomLayout } from "@/components/layout/RoomLayout";

const ACCENT = "#60d0ff";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="relative pl-8 pb-10 group">
    <div
      className="absolute left-0 top-2 bottom-0 w-px"
      style={{ backgroundColor: `${ACCENT}20` }}
    />
    <div
      className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full border-2 group-hover:scale-125 transition-transform"
      style={{ borderColor: ACCENT, backgroundColor: "#080515" }}
    />
    <h2
      className="text-xl font-bold mb-6 tracking-wide"
      style={{ color: ACCENT }}
    >
      {title}
    </h2>
    <div className="text-gray-300 leading-relaxed space-y-4">{children}</div>
  </section>
);

const Career = ({
  company,
  role,
  period,
  children,
}: {
  company: string;
  role: string;
  period: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
      <div>
        <h3 className="text-lg font-bold text-white inline">{company}</h3>
        <span className="text-sm text-gray-400 ml-2">{role}</span>
      </div>
      <span
        className="text-xs font-mono px-2 py-0.5 rounded"
        style={{
          color: `${ACCENT}cc`,
          backgroundColor: `${ACCENT}10`,
        }}
      >
        {period}
      </span>
    </div>
    <div className="text-gray-300 text-sm space-y-3 mt-3 pl-1">{children}</div>
  </div>
);

const SubProject = ({
  title,
  techStack,
  children,
}: {
  title: string;
  techStack: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
    <p className="font-semibold text-gray-200 text-sm">{title}</p>
    <p className="text-gray-500 text-xs mt-1 mb-3 font-mono">{techStack}</p>
    {children}
  </div>
);

const BulletList = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2 text-sm leading-relaxed">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: `${ACCENT}60` }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <strong className="text-white font-semibold">{children}</strong>
);

const Metric = ({ children }: { children: React.ReactNode }) => (
  <span className="font-bold" style={{ color: ACCENT }}>
    {children}
  </span>
);

const Project = ({
  name,
  description,
  period,
  techStack,
  urls,
  children,
}: {
  name: string;
  description: string;
  period: string;
  techStack: string;
  urls: { label: string; href: string }[];
  children: React.ReactNode;
}) => (
  <div className="mb-8 rounded-lg border border-white/10 p-5 bg-white/[0.02]">
    <div className="flex items-start justify-between flex-wrap gap-2">
      <div>
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      <span
        className="text-xs font-mono px-2 py-0.5 rounded shrink-0"
        style={{
          color: `${ACCENT}cc`,
          backgroundColor: `${ACCENT}10`,
        }}
      >
        {period}
      </span>
    </div>
    <div className="text-gray-300 text-sm space-y-3 mt-4">{children}</div>
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4 pt-3 border-t border-white/5">
      <p className="text-xs text-gray-500 font-mono">{techStack}</p>
      <div className="flex gap-3">
        {urls.map((u) => (
          <a
            key={u.label}
            href={u.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-2.5 py-1 rounded-full border transition-all hover:scale-105"
            style={{
              color: ACCENT,
              borderColor: `${ACCENT}40`,
              backgroundColor: `${ACCENT}08`,
            }}
          >
            {u.label}
          </a>
        ))}
      </div>
    </div>
  </div>
);

const SkillCategory = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      {title}
    </h4>
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="px-2.5 py-1 rounded-md text-xs font-medium border"
          style={{
            borderColor: `${ACCENT}25`,
            color: `${ACCENT}cc`,
            backgroundColor: `${ACCENT}08`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const ResumePage = () => {
  return (
    <RoomLayout title="Resume" accentColor={ACCENT}>
      <div className="space-y-2">
        {/* ── Introduction ── */}
        <Section title="Introduction">
          <p className="text-lg font-medium text-white leading-relaxed">
            비하인드 scene들이 모여 비로소 하이라이트 scene이 완성된다고 믿는
            FE 개발자, <span style={{ color: ACCENT }} className="font-bold">황인정</span>입니다.
          </p>

          <div
            className="rounded-lg p-4 mt-2 space-y-2"
            style={{ backgroundColor: `${ACCENT}06`, border: `1px solid ${ACCENT}15` }}
          >
            <BulletList
              items={[
                <>
                  <Highlight>59+ 컴포넌트 오픈소스 라이브러리</Highlight>를 설계부터
                  npm 퍼블리싱까지 단독 구축한 설계 역량
                </>,
                <>
                  PDF 렌더링 성능을 <Metric>수백 회 → 1회</Metric>로 최적화한 문제 해결 능력
                </>,
                <>
                  토스에서 다양한 직군(서버 개발자, 디자이너, PM)과의{" "}
                  <Highlight>크로스 펑셔널 협업 경험</Highlight>
                </>,
                <>
                  WebSocket + SharedWorker 기반{" "}
                  <Highlight>실시간 시스템 설계 및 배포</Highlight> 경험
                </>,
              ]}
            />
          </div>

          <div className="flex flex-wrap gap-4 text-xs mt-4">
            <a
              href="mailto:twilitght9758@gmail.com"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all hover:scale-105"
              style={{
                color: `${ACCENT}cc`,
                borderColor: `${ACCENT}30`,
                backgroundColor: `${ACCENT}08`,
              }}
            >
              Email
            </a>
            <a
              href="https://github.com/2njeong"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all hover:scale-105"
              style={{
                color: `${ACCENT}cc`,
                borderColor: `${ACCENT}30`,
                backgroundColor: `${ACCENT}08`,
              }}
            >
              GitHub
            </a>
            <a
              href="https://incodevelop.tistory.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all hover:scale-105"
              style={{
                color: `${ACCENT}cc`,
                borderColor: `${ACCENT}30`,
                backgroundColor: `${ACCENT}08`,
              }}
            >
              Blog
            </a>
          </div>
        </Section>

        {/* ── Career ── */}
        <Section title="Career">
          {/* 모션랩스 - 가장 최근 */}
          <Career
            company="모션랩스"
            role="프론트엔드 개발자"
            period="2025.05 – 2026.02"
          >
            <div className="space-y-4">
              <SubProject
                title="병원 건강검진 관리 플랫폼 (B2B SaaS)"
                techStack="React 19 · TypeScript · Vite · Tailwind CSS v4 · TanStack Query · @react-pdf/renderer"
              >
                <BulletList
                  items={[
                    <>
                      다국어 PDF 리포트 생성 시스템 (한/영/베트남어) — Canvas API로
                      텍스트 너비 측정 및 A4 페이지 자동 분할 로직 설계
                    </>,
                    <>
                      첨부 PDF → base64 이미지 변환, ECG 키워드 감지 시 전체 페이지
                      레이아웃 자동 전환
                    </>,
                    <>
                      AbortSignal 전파로 사용자 취소 시 진행 중인 네트워크 요청 즉시 중단
                    </>,
                    <>
                      <Highlight>PDF 성능 최적화</Highlight> — 이미지 Prefetch + Web Worker 텍스트 측정으로
                      Canvas 생성 횟수 <Metric>수백 회 → 1회</Metric> 감소
                    </>,
                  ]}
                />
              </SubProject>

              <SubProject
                title="병원 커뮤니케이션 템플릿 관리 백오피스 (B2B SaaS)"
                techStack="React 19 · TypeScript · Vite · GraphQL · TanStack Query"
              >
                <BulletList
                  items={[
                    <>
                      엑셀 병합 셀 구조를 웹 테이블에 재현하는 동적 파싱 시스템
                      설계 — 트리 구조 변환으로 colspan/rowspan 자동 계산
                    </>,
                    <>
                      수백 행 규모 템플릿의 셀 단위 인라인 편집·실시간 검증 — cellId
                      체계로 독립 상태 관리 및 커스텀 memo로 리렌더링 최적화
                    </>,
                  ]}
                />
              </SubProject>
            </div>
          </Career>

          {/* 토스 */}
          <Career
            company="토스"
            role="어드민 플랫폼 어시스턴트"
            period="2024.08 ~"
          >
            <BulletList
              items={[
                "DSL 기반 어드민 플랫폼 개발",
                <>
                  vitepress 공식문서 — <Highlight>CodeBoxWithLink 플러그인</Highlight> 개발 및 사내 기여
                </>,
                <>
                  DSL 공식문서 — <Highlight>크롬 익스텐션</Highlight> 개발 (iframe 기반 문서 열람) 및 사내 기여
                </>,
                <>
                  DSL 문서 구조 설계 및 vitepress 기반 공식문서 작성,{" "}
                  <Highlight>제품 온보딩 리드</Highlight>
                </>,
                "HTTP 프로토콜 활용 및 최적화, 프론트엔드 서빙·번들 제공 방식에 대한 이해",
                "프론트-서버 개발자, 디자이너, PM과의 크로스 펑셔널 협업",
              ]}
            />
          </Career>

          {/* 이전 경력 (축약) */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: `${ACCENT}04`, border: `1px solid ${ACCENT}10` }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Previous Experience
            </p>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <div>
                  <span className="text-gray-300">가톨릭대 조혈모세포은행</span>
                  <span className="text-gray-500 ml-2">이식조정 코디네이터</span>
                </div>
                <span className="text-xs text-gray-600 font-mono">2023.04 – 2023.12</span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <div>
                  <span className="text-gray-300">서울성모병원</span>
                  <span className="text-gray-500 ml-2">수술 마취 간호사</span>
                </div>
                <span className="text-xs text-gray-600 font-mono">2021.09 – 2023.03</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Projects ── */}
        <Section title="Projects">
          <Project
            name="NODE"
            description="AI-Native 지능형 학습 플랫폼 — 학습 자료 업로드 → AI 자동 분석 → RAG 채팅, 지식 맵, 퀴즈 생성"
            period="2026.02 ~"
            techStack="Next.js 14 · TypeScript · Tailwind CSS · Supabase (Auth, DB, Storage, pgvector) · Gemini 2.0 Flash · Vercel AI SDK · React Flow · TanStack Query"
            urls={[
              { label: "GitHub", href: "https://github.com/2njeong/node" },
              { label: "Site", href: "http://158.247.249.164" },
            ]}
          >
            <BulletList
              items={[
                <>
                  <Highlight>문서 AI 처리 파이프라인</Highlight> 설계·구현 — Gemini Vision OCR → 텍스트 청킹 →
                  Gemini Embedding 벡터화 → Supabase pgvector 저장까지 End-to-End 자동화
                </>,
                <>
                  pgvector 코사인 유사도 검색 기반{" "}
                  <Highlight>RAG 채팅 시스템</Highlight> 구축 — 학습 자료 맥락 기반 AI 답변
                </>,
                <>
                  Gemini AI로 핵심 개념·관계를 자동 추출하고 React Flow로 시각화하는{" "}
                  <Highlight>AI 지식 맵</Highlight> 구현 — 5가지 카테고리 자동 분류
                </>,
                <>
                  학습 자료 기반 빈칸 채우기·OX 퀴즈를 AI가 자동 출제·채점하는{" "}
                  <Highlight>AI 퀴즈 시스템</Highlight>
                </>,
                <>
                  <Highlight>AI-Native 개발 프로세스</Highlight> — Claude Code와 PDCA 사이클 기반 설계·구현·검증
                </>,
              ]}
            />
          </Project>

          <Project
            name="inz-ui-kit"
            description="오픈소스 React 컴포넌트 라이브러리 — Tree-shaking 최적화된 프로덕션 레벨 디자인 시스템"
            period="2025.09 – 2025.12"
            techStack="React 19 · TypeScript · Vite · Tailwind CSS v4 · CVA · Floating UI · Vitest · pnpm workspace · GitHub Actions"
            urls={[
              { label: "GitHub", href: "https://github.com/2njeong/inz-ui" },
              {
                label: "npm",
                href: "https://www.npmjs.com/package/@2njeong/inz-ui-kit",
              },
            ]}
          >
            <BulletList
              items={[
                <>
                  <Metric>26개 카테고리, 59+ 컴포넌트, 114개 SVG 아이콘</Metric> 규모의
                  디자인 시스템을 설계부터 npm 퍼블리싱까지 독립 구축
                </>,
                <>
                  pnpm workspace 모노레포 + Vite Rollup preserveModules로{" "}
                  <Highlight>ESM/CJS 듀얼 포맷 빌드</Highlight>, 컴포넌트 단위 Tree-shaking 지원
                </>,
                <>
                  CVA 패턴 기반 variant 관리 + CSS Variables 디자인 토큰 시스템으로
                  일관된 스타일링 체계 구축
                </>,
                <>
                  GitHub Actions로 커밋 메시지 기반{" "}
                  <Highlight>시맨틱 버저닝 자동화 CI/CD</Highlight> 파이프라인 구축
                </>,
                <>
                  컴포넌트 Props·타입 정보를 파싱하여{" "}
                  <Highlight>llms.txt 자동 생성</Highlight> — AI-Ready 문서화 환경 구축
                </>,
              ]}
            />
          </Project>

          <Project
            name="Context Naming Consultant"
            description="코드 맥락을 AI가 분석하여 변수·함수·컴포넌트 이름을 추천하는 VS Code Extension"
            period="2026.01 – 2026.02"
            techStack="TypeScript · VS Code Extension API · Webpack · OpenAI API · Anthropic API · Gemini API · Ollama REST API"
            urls={[
              { label: "GitHub", href: "https://github.com/2njeong/naming-consultant" },
              {
                label: "Marketplace",
                href: "https://marketplace.visualstudio.com/items?itemName=slowdreamer.context-naming-consultant",
              },
            ]}
          >
            <BulletList
              items={[
                <>
                  코드 선택 → 맥락 수집 → AI 분석 → QuickPick UI로 이름 후보 표시 → 자동 적용까지{" "}
                  <Highlight>원스텝 네이밍 워크플로우</Highlight> 설계·구현
                </>,
                <>
                  <Metric>5개 AI Provider 추상화 레이어</Metric> 설계 (OpenAI, Claude, Gemini, Azure OpenAI, Ollama)
                  — 벤더 종속 없이 교체 가능한 아키텍처
                </>,
                <>
                  Ollama 로컬 LLM 기본 지원으로{" "}
                  <Highlight>API Key 없이 무료 사용</Highlight> 가능한 진입장벽 최소화
                </>,
                <>
                  <code>.naming.json</code> / <code>.naming.md</code> 팀 네이밍 룰 파일 로드 → AI 추천 결과 자동
                  필터링으로 <Highlight>팀 컨벤션 강제</Highlight> 기능 구현
                </>,
                <>
                  VS Code Secret Storage (OS Keychain) 활용{" "}
                  <Highlight>보안 API Key 관리</Highlight> 및 i18n 다국어 지원 (한/영)
                </>,
              ]}
            />
          </Project>

          <Project
            name="Golaping"
            description={`"오늘 뭐 먹지?" 같은 실생활 고민을 실시간 투표로 해결하는 서비스`}
            period="2025.01 – 2025.03"
            techStack="React · TypeScript · WebSocket · SharedWorker · matter.js · Docker · EC2"
            urls={[
              {
                label: "GitHub",
                href: "https://github.com/Goose-sDream/golaping-client",
              },
              { label: "Site", href: "https://golaping.site" },
            ]}
          >
            <div className="space-y-4">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-2 px-2 py-0.5 rounded inline-block"
                  style={{ color: ACCENT, backgroundColor: `${ACCENT}10` }}
                >
                  Troubleshooting
                </p>
                <BulletList
                  items={[
                    <>
                      웹소켓 쿠키 포함 요청 문제 해결 —{" "}
                      <Highlight>withCredentials + SSL + SameSite</Highlight> 설정
                    </>,
                    <>
                      Recoil → Context API로 웹소켓 관리 분리하여 생명주기 제어 및
                      메모리 누수 방지
                    </>,
                    <>
                      <Highlight>SharedWorker</Highlight>로 브라우저 : 웹소켓 = 1:1 연결,
                      멀티 탭 서버 리소스 절감
                    </>,
                  ]}
                />
              </div>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-2 px-2 py-0.5 rounded inline-block"
                  style={{ color: ACCENT, backgroundColor: `${ACCENT}10` }}
                >
                  Tasks
                </p>
                <BulletList
                  items={[
                    "EC2 + Docker 프론트엔드 서버 배포 및 CI/CD 자동화 파이프라인 구축",
                    "타임피커, 모달 등 재사용 가능한 UI 컴포넌트 설계·개발",
                    "matter.js 물리 엔진을 활용한 인터랙티브 투표 화면 구현",
                    "웹소켓 기반 실시간 투표 시스템 구축",
                  ]}
                />
              </div>
            </div>
          </Project>
        </Section>

        {/* ── Education ── */}
        <Section title="Education">
          <div className="space-y-4">
            {[
              {
                name: "스파르타 내일배움캠프",
                period: "2023.12 – 2024.05",
                detail: "프론트엔드 React 4기 수료",
              },
              {
                name: "OSSCA (오픈소스 컨트리뷰션 아카데미)",
                period: "2025.04 – 2025.05",
                detail:
                  "2025-Ollama 체험형 수료 — Llama를 이용한 의료 AI 챗봇 개발",
              },
              {
                name: "가톨릭대학교 성의교정",
                period: "2016.03 – 2021.02",
                detail: "간호학과 졸업",
              },
            ].map((edu) => (
              <div
                key={edu.name}
                className="flex items-baseline justify-between flex-wrap gap-2"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white inline">
                    {edu.name}
                  </h3>
                  <span className="text-sm text-gray-400 ml-2">
                    {edu.detail}
                  </span>
                </div>
                <span className="text-xs text-gray-600 font-mono">
                  {edu.period}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Tech Stack ── */}
        <Section title="Tech Stack">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-4">
              <SkillCategory
                title="Language"
                items={["JavaScript", "TypeScript"]}
              />
              <SkillCategory title="Framework" items={["Next.js"]} />
              <SkillCategory
                title="Library"
                items={[
                  "React.js",
                  "TanStack Query",
                  "Axios",
                  "React Router",
                ]}
              />
              <SkillCategory
                title="State Management"
                items={["Redux", "Zustand", "Recoil", "Jotai"]}
              />
              <SkillCategory
                title="Style"
                items={["Styled-components", "Tailwind CSS"]}
              />
            </div>
            <div className="space-y-4">
              <SkillCategory title="Bundler" items={["Webpack", "Vite"]} />
              <SkillCategory
                title="Testing"
                items={["Vitest", "React Testing Library"]}
              />
              <SkillCategory
                title="Database"
                items={["Supabase (PostgreSQL)", "Firebase"]}
              />
              <SkillCategory
                title="Build / Deploy"
                items={[
                  "Docker",
                  "GitHub Actions",
                  "AWS EC2",
                  "Vercel",
                ]}
              />
              <SkillCategory
                title="Package"
                items={["pnpm workspace", "npm Publishing"]}
              />
            </div>
          </div>
        </Section>
      </div>
    </RoomLayout>
  );
};

export default ResumePage;
