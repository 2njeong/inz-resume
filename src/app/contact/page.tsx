"use client";

import { RoomLayout } from "@/components/layout/RoomLayout";

const ACCENT = "#ff60d0";

const LINKS = [
  {
    label: "Email",
    url: "mailto:twilitght9758@gmail.com",
    icon: "📧",
    description: "twilitght9758@gmail.com",
  },
  {
    label: "GitHub",
    url: "https://github.com/2njeong",
    icon: "🐙",
    description: "github.com/2njeong",
  },
  {
    label: "Blog",
    url: "https://incodevelop.tistory.com",
    icon: "📝",
    description: "incodevelop.tistory.com",
  },
  {
    label: "VS Code Marketplace",
    url: "https://marketplace.visualstudio.com/items?itemName=slowdreamer.context-naming-consultant",
    icon: "🧩",
    description: "Context Naming Consultant",
  },
  {
    label: "npm",
    url: "https://www.npmjs.com/package/@2njeong/inz-ui-kit",
    icon: "📦",
    description: "@2njeong/inz-ui-kit",
  },
];

const ContactPage = () => {
  return (
    <RoomLayout title="Contact" accentColor={ACCENT}>
      <div className="max-w-lg mx-auto text-center">
        <p
          className="text-lg font-medium mb-2"
          style={{ color: `${ACCENT}dd` }}
        >
          Let&apos;s Connect
        </p>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed">
          협업, 프로젝트 제안, 혹은 기술 이야기가 하고 싶으시다면 편하게 연락 주세요.
        </p>

        <div className="grid gap-3">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
              style={{
                backgroundColor: "rgba(20, 15, 40, 0.8)",
                borderColor: `${ACCENT}20`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${ACCENT}60`;
                e.currentTarget.style.boxShadow = `0 8px 32px ${ACCENT}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${ACCENT}20`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${ACCENT}10` }}
              >
                {link.icon}
              </span>
              <div className="text-left flex-1 min-w-0">
                <span className="text-white font-semibold text-sm block">
                  {link.label}
                </span>
                <span className="text-gray-500 text-xs truncate block">
                  {link.description}
                </span>
              </div>
              <span
                className="text-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                style={{ color: ACCENT }}
              >
                &rarr;
              </span>
            </a>
          ))}
        </div>

        <div
          className="mt-10 p-4 rounded-lg text-sm text-gray-500 leading-relaxed"
          style={{
            backgroundColor: `${ACCENT}06`,
            border: `1px solid ${ACCENT}10`,
          }}
        >
          비하인드 scene들이 모여 비로소 하이라이트 scene이 완성된다고 믿는
          <br />
          FE 개발자,{" "}
          <span className="font-semibold" style={{ color: `${ACCENT}cc` }}>
            황인정
          </span>
          입니다.
        </div>
      </div>
    </RoomLayout>
  );
};

export default ContactPage;
