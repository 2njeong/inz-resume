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
      className="text-xl font-bold mb-4 tracking-wide"
      style={{ color: ACCENT }}
    >
      {title}
    </h2>
    <div className="text-gray-300 leading-relaxed space-y-3">{children}</div>
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
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-white">{company}</h3>
    <p className="text-sm text-gray-400 mb-1">
      {role} · <span style={{ color: `${ACCENT}99` }}>{period}</span>
    </p>
    <div className="text-gray-300 text-sm space-y-2 mt-2">{children}</div>
  </div>
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
    <h3 className="text-lg font-semibold text-white">{name}</h3>
    <p className="text-sm text-gray-400 mt-1">{description}</p>
    <p className="text-xs mt-1" style={{ color: `${ACCENT}99` }}>
      {period}
    </p>
    <div className="text-gray-300 text-sm space-y-2 mt-3">{children}</div>
    <p className="text-xs text-gray-500 mt-3">🛠️ {techStack}</p>
    <div className="flex gap-3 mt-2">
      {urls.map((u) => (
        <a
          key={u.label}
          href={u.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline hover:opacity-80 transition-opacity"
          style={{ color: ACCENT }}
        >
          {u.label}
        </a>
      ))}
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
    <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="px-2 py-0.5 rounded-full text-xs border"
          style={{
            borderColor: `${ACCENT}30`,
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
          <p className="text-lg font-medium text-white">
            비하인드 scene들이 모여 비로소 하이라이트 scene이 완성된다고 믿는
            FE 개발자, <span style={{ color: ACCENT }}>황인정</span> 입니다.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mt-2 text-gray-400">
            <li>
              <strong className="text-gray-300">커뮤니케이션 능력</strong> — 5회
              이상 팀 프로젝트 경험, 토스 어시스턴트로 다양한 직군과 협업
            </li>
            <li>
              <strong className="text-gray-300">문제 해결 및 분석 능력</strong> —
              문제를 체계적으로 분석하고 핵심을 짚어내 빠르게 해결책을 제시
            </li>
            <li>
              <strong className="text-gray-300">반응형 웹 디자인</strong> —
              모바일, 태블릿, 데스크탑 등 다양한 화면에 최적화된 반응형 웹 구현
            </li>
            <li>
              <strong className="text-gray-300">고객 중심 사고</strong> — 고객의
              요구를 빠르게 이해하고 지속적으로 UX 개선 방법을 탐구
            </li>
          </ul>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
            <a
              href="mailto:twilitght9758@gmail.com"
              className="hover:underline"
            >
              twilitght9758@gmail.com
            </a>
            <a
              href="https://github.com/2njeong"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://incodevelop.tistory.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Blog
            </a>
          </div>
        </Section>

        {/* ── Career ── */}
        <Section title="Career">
          <Career
            company="토스"
            role="어드민 플랫폼 어시스턴트"
            period="2024.08 ~"
          >
            <ul className="list-disc list-inside space-y-1">
              <li>DSL 기반 어드민 플랫폼 개발</li>
              <li>
                vitepress 공식문서 — CodeBoxWithLink 플러그인 개발 사내 기여
              </li>
              <li>
                DSL 공식문서 — iframe으로 열람할 수 있는 크롬 익스텐션 개발 및
                사내 기여
              </li>
              <li>
                HTTP 프로토콜 활용 및 최적화, 다양한 네트워크 환경에서의 프론트엔드
                서빙 및 번들 제공 방식 이해
              </li>
              <li>
                DSL 문서 구조 설계 및 vitepress 기반 공식문서 작성, 제품 온보딩
                리드
              </li>
              <li>
                프론트-서버 개발자, 디자이너, PM과의 협업 및 커뮤니케이션
              </li>
            </ul>
          </Career>

          <Career
            company="모션랩스"
            role="프론트엔드 개발자"
            period="2025.05 – 2026.02"
          >
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-200 mb-1">
                  병원 건강검진 관리 플랫폼 (B2B SaaS)
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  React 19 · TypeScript · Vite · Tailwind CSS v4 · TanStack
                  Query · @react-pdf/renderer
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    다국어 PDF 리포트 생성 시스템 (한/영/베트남어) — Canvas API로
                    텍스트 너비 측정 및 A4 페이지 자동 분할 로직 설계
                  </li>
                  <li>
                    첨부 PDF → base64 이미지 변환, ECG 키워드 감지 시 전체 페이지
                    레이아웃 자동 전환
                  </li>
                  <li>
                    AbortSignal 전파로 사용자 취소 시 진행 중인 네트워크 요청 즉시
                    중단
                  </li>
                  <li>
                    PDF 성능 최적화 — 이미지 Prefetch + Web Worker 텍스트 측정으로
                    Canvas 생성 횟수 수백 회 → 1회 감소
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-200 mb-1">
                  병원 커뮤니케이션 템플릿 관리 백오피스 (B2B SaaS)
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  React 19 · TypeScript · Vite · GraphQL · TanStack Query
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    엑셀 병합 셀 구조를 웹 테이블에 재현하는 동적 파싱 시스템
                    설계 — 트리 구조 변환으로 colspan/rowspan 자동 계산
                  </li>
                  <li>
                    수백 행 규모 템플릿의 셀 단위 인라인 편집·실시간 검증 — cellId
                    체계로 독립 상태 관리 및 커스텀 memo로 리렌더링 최적화
                  </li>
                </ul>
              </div>
            </div>
          </Career>

          <Career
            company="가톨릭대학교 의과대학 조혈모세포은행"
            role="이식조정부 코디네이터"
            period="2023.04 – 2023.12"
          >
            <ul className="list-disc list-inside">
              <li>비혈연 동종 조혈모세포 이식조정 코디네이터</li>
            </ul>
          </Career>

          <Career
            company="서울성모병원"
            role="수술 마취 간호사"
            period="2021.09 – 2023.03"
          >
            <ul className="list-disc list-inside">
              <li>수술실 내 마취, 응급상황 및 수술 후 회복환자 간호</li>
            </ul>
          </Career>
        </Section>

        {/* ── Projects ── */}
        <Section title="Projects">
          <Project
            name="inz-ui-kit"
            description="오픈소스 React 컴포넌트 라이브러리 — Tree-shaking 최적화된 프로덕션 레벨 디자인 시스템"
            period="2025.05 ~"
            techStack="React 19 · TypeScript · Vite · Tailwind CSS v4 · CVA · Floating UI · Vitest · pnpm workspace · GitHub Actions"
            urls={[
              { label: "GitHub", href: "https://github.com/2njeong/inz-ui" },
              {
                label: "npm",
                href: "https://www.npmjs.com/package/@2njeong/inz-ui-kit",
              },
            ]}
          >
            <ul className="list-disc list-inside space-y-1">
              <li>
                26개 카테고리, 59+ 컴포넌트, 114개 SVG 아이콘 규모의 디자인
                시스템을 설계부터 npm 퍼블리싱까지 독립 구축
              </li>
              <li>
                pnpm workspace 모노레포 + Vite Rollup preserveModules로 ESM/CJS
                듀얼 포맷 빌드, 컴포넌트 단위 Tree-shaking 지원
              </li>
              <li>
                CVA 패턴 기반 variant 관리 + CSS Variables 디자인 토큰 시스템
                설계로 일관된 스타일링 체계 구축
              </li>
              <li>
                GitHub Actions로 커밋 메시지 기반 시맨틱 버저닝 자동화 CI/CD
                파이프라인 구축
              </li>
              <li>
                컴포넌트 Props·타입 정보를 파싱하여 llms.txt 자동 생성 — AI-Ready
                문서화 환경 구축
              </li>
            </ul>
          </Project>

          <Project
            name="Golaping — 골라핑"
            description={`"오늘 뭐 먹지?" 같은 실생활의 고민을 실시간으로 투표할 수 있는 서비스`}
            period="2025.01 ~"
            techStack="React · TypeScript · WebSocket · SharedWorker · matter.js · Docker · EC2"
            urls={[
              {
                label: "GitHub",
                href: "https://github.com/Goose-sDream/golaping-client",
              },
              { label: "Site", href: "https://golaping.site" },
            ]}
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">
                  트러블슈팅
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    웹소켓 기반 실시간 투표의 쿠키 포함 요청 문제 해결 —
                    withCredentials + SSL + SameSite 설정
                  </li>
                  <li>
                    Recoil → Context API로 웹소켓 관리 분리하여 생명주기 제어 및
                    메모리 누수 방지
                  </li>
                  <li>
                    SharedWorker로 브라우저 : 웹소켓 = 1:1 연결, 멀티 탭 서버
                    리소스 절감
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">
                  수행업무
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    EC2 + Docker 프론트엔드 서버 배포 및 CI/CD 자동화 파이프라인
                    구축
                  </li>
                  <li>
                    타임피커, 모달 등 재사용 가능한 UI 컴포넌트 설계·개발
                  </li>
                  <li>
                    matter.js 물리 엔진을 활용한 인터랙티브 투표 화면 구현
                  </li>
                  <li>
                    웹소켓 기반 실시간 투표 시스템 구축
                  </li>
                </ul>
              </div>
            </div>
          </Project>
        </Section>

        {/* ── Education ── */}
        <Section title="Education">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                스파르타 내일배움캠프
              </h3>
              <p className="text-xs text-gray-500">2023.12 – 2024.05</p>
              <p className="text-sm text-gray-400">
                프론트엔드 React 4기 수료
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                OSSCA (오픈소스 컨트리뷰션 아카데미)
              </h3>
              <p className="text-xs text-gray-500">2025.04 – 2025.05</p>
              <p className="text-sm text-gray-400">
                2025-Ollama 체험형 수료 — Llama를 이용한 의료 AI 챗봇 개발 경험
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                가톨릭대학교 성의교정
              </h3>
              <p className="text-xs text-gray-500">2016.03 – 2021.02</p>
              <p className="text-sm text-gray-400">간호학과 졸업</p>
            </div>
          </div>
        </Section>

        {/* ── Tech Stack ── */}
        <Section title="Tech Stack">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
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
            <div className="space-y-3">
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
