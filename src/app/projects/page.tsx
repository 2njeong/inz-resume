"use client";

import { RoomLayout } from "@/components/layout/RoomLayout";

const ACCENT = "#60ffa0";

const PROJECTS = [
  {
    title: "NODE",
    period: "2026.02 ~",
    description:
      "학습 자료(PDF·이미지·DOCX)를 업로드하면 AI가 자동 분석하여 RAG 채팅, 지식 맵, 퀴즈를 생성하는 올인원 AI 학습 플랫폼. Claude Code와 AI-Native 개발.",
    highlights: [
      "Gemini Vision OCR → 텍스트 청킹 → Embedding 벡터화 → pgvector 저장 End-to-End 파이프라인",
      "pgvector 코사인 유사도 검색 기반 RAG 채팅 시스템 구축",
      "React Flow 기반 AI 지식 맵 — 5가지 카테고리 자동 분류 시각화",
      "AI 자동 출제·채점 퀴즈 시스템 (빈칸 채우기, OX)",
      "Claude Code + PDCA 사이클 기반 AI-Native 개발 프로세스",
      "1GB RAM VPS에 맞춘 로컬 빌드 → rsync → PM2 + Nginx 경량 배포",
    ],
    techStack: [
      "Next.js 14",
      "TypeScript",
      "Supabase",
      "pgvector",
      "Gemini 2.0 Flash",
      "Vercel AI SDK",
      "React Flow",
      "TanStack Query",
    ],
    urls: [
      { label: "GitHub", href: "https://github.com/2njeong/node" },
      { label: "Site", href: "http://158.247.249.164" },
    ],
    icon: "🧠",
  },
  {
    title: "inz-ui-kit",
    period: "2025.09 – 2025.12",
    description:
      "Tree-shaking 최적화된 오픈소스 React 컴포넌트 라이브러리. 26개 카테고리, 59+ 컴포넌트, 114개 SVG 아이콘 규모의 디자인 시스템.",
    highlights: [
      "pnpm workspace 모노레포 + Vite Rollup preserveModules로 ESM/CJS 듀얼 포맷 빌드",
      "CVA 패턴 기반 variant 관리 + CSS Variables 디자인 토큰 시스템",
      "GitHub Actions 시맨틱 버저닝 자동화 CI/CD → GitHub Packages 퍼블리싱",
      "컴포넌트 Props·타입 파싱으로 llms.txt 자동 생성 — AI-Ready 문서화",
    ],
    techStack: [
      "React 19",
      "TypeScript",
      "Vite",
      "Tailwind CSS v4",
      "CVA",
      "Floating UI",
      "Vitest",
      "pnpm workspace",
      "GitHub Actions",
    ],
    urls: [
      { label: "GitHub", href: "https://github.com/2njeong/inz-ui" },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/@2njeong/inz-ui-kit",
      },
    ],
    icon: "📦",
  },
  {
    title: "Context Naming Consultant",
    period: "2026.01 – 2026.02",
    description:
      "코드 맥락을 AI가 분석하여 변수·함수·컴포넌트 이름을 추천하는 VS Code Extension. Marketplace 퍼블리싱.",
    highlights: [
      "코드 선택 → 맥락 수집 → AI 분석 → QuickPick UI → 자동 적용 원스텝 워크플로우",
      "5개 AI Provider 추상화 레이어 (OpenAI, Claude, Gemini, Azure OpenAI, Ollama)",
      "Ollama 로컬 LLM 기본 지원으로 API Key 없이 무료 사용 가능",
      ".naming.json / .naming.md 팀 네이밍 룰 로드 → AI 추천 결과 자동 필터링",
      "VS Code Secret Storage (OS Keychain) 보안 API Key 관리",
      "i18n 다국어 지원 (한국어/영어), 7가지 네이밍 타입 지원",
    ],
    techStack: [
      "TypeScript",
      "VS Code Extension API",
      "Webpack",
      "OpenAI",
      "Claude",
      "Gemini",
      "Ollama",
    ],
    urls: [
      {
        label: "GitHub",
        href: "https://github.com/2njeong/naming-consultant",
      },
      {
        label: "Marketplace",
        href: "https://marketplace.visualstudio.com/items?itemName=slowdreamer.context-naming-consultant",
      },
    ],
    icon: "✏️",
  },
  {
    title: "Golaping",
    period: "2025.01 – 2025.03",
    description:
      '"오늘 뭐 먹지?" 같은 실생활 고민을 실시간 투표로 해결하는 서비스.',
    highlights: [
      "WebSocket 쿠키 포함 요청 — withCredentials + SSL + SameSite 설정으로 CORS 해결",
      "Recoil → Context API로 웹소켓 관리 분리, 생명주기 제어 및 메모리 누수 방지",
      "SharedWorker로 브라우저 : 웹소켓 = 1:1 연결, 멀티 탭 서버 리소스 절감",
      "EC2 + Docker 프론트엔드 서버 배포 및 CI/CD 자동화",
      "matter.js 물리 엔진으로 인터랙티브 투표 화면 구현",
    ],
    techStack: [
      "React",
      "TypeScript",
      "WebSocket",
      "SharedWorker",
      "matter.js",
      "Docker",
      "EC2",
    ],
    urls: [
      {
        label: "GitHub",
        href: "https://github.com/Goose-sDream/golaping-client",
      },
      { label: "Site", href: "https://golaping.site" },
    ],
    icon: "🗳️",
  },
];

const ProjectsPage = () => {
  return (
    <RoomLayout title="Projects" accentColor={ACCENT}>
      <div className="space-y-6">
        {PROJECTS.map((project) => (
          <div
            key={project.title}
            className="group rounded-xl border p-6 transition-all duration-300"
            style={{
              backgroundColor: "rgba(20, 15, 40, 0.8)",
              borderColor: `${ACCENT}20`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${ACCENT}15` }}
                >
                  {project.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {project.description}
                  </p>
                </div>
              </div>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded shrink-0"
                style={{
                  color: `${ACCENT}cc`,
                  backgroundColor: `${ACCENT}10`,
                }}
              >
                {project.period}
              </span>
            </div>

            {/* Highlights */}
            <ul className="space-y-2 mb-4">
              {project.highlights.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-gray-300 leading-relaxed"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: `${ACCENT}60` }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Tech + Links */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/5">
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: `${ACCENT}10`,
                      color: `${ACCENT}cc`,
                      border: `1px solid ${ACCENT}20`,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                {project.urls.map((u) => (
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
        ))}
      </div>
    </RoomLayout>
  );
};

export default ProjectsPage;
