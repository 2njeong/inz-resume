"use client";

import { RoomLayout } from "@/components/layout/RoomLayout";

const ACCENT = "#ff60d0";

const LINKS = [
  {
    label: "GitHub",
    url: "https://github.com/2njeong",
    icon: "🐙",
    description: "Check out my repositories",
  },
  {
    label: "Email",
    url: "mailto:your-email@example.com",
    icon: "📧",
    description: "Send me a message",
  },
];

const ContactPage = () => {
  return (
    <RoomLayout title="Contact" accentColor={ACCENT}>
      <div className="max-w-lg mx-auto text-center">
        {/* Duck greeting */}
        <div className="text-6xl mb-4">🐤</div>
        <p className="text-gray-300 text-lg mb-2">Feel free to reach out!</p>
        <p className="text-gray-500 text-sm mb-10">
          I&apos;m always happy to connect.
        </p>

        <div className="grid gap-4">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
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
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${ACCENT}10` }}
              >
                {link.icon}
              </span>
              <div className="text-left flex-1">
                <span className="text-white font-semibold block">
                  {link.label}
                </span>
                <span className="text-gray-500 text-sm">
                  {link.description}
                </span>
              </div>
              <span
                className="text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: ACCENT }}
              >
                &rarr;
              </span>
            </a>
          ))}
        </div>
      </div>
    </RoomLayout>
  );
};

export default ContactPage;
