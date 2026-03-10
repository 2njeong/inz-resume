"use client";

import { RoomLayout } from "@/components/layout/RoomLayout";

const ACCENT = "#60ffa0";

const PROJECTS = [
  {
    title: "inz-ui-kit",
    description:
      "React component library built with TypeScript and Tailwind CSS 4.",
    techStack: ["React", "TypeScript", "Tailwind CSS"],
    url: "https://github.com/2njeong/inz-ui-kit",
  },
];

const ProjectsPage = () => {
  return (
    <RoomLayout title="Projects" accentColor={ACCENT}>
      <div className="grid gap-6 md:grid-cols-2">
        {PROJECTS.map((project) => (
          <a
            key={project.title}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
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
            {/* Project icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-4"
              style={{ backgroundColor: `${ACCENT}15` }}
            >
              🚀
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:underline">
              {project.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: `${ACCENT}10`,
                    color: ACCENT,
                    border: `1px solid ${ACCENT}25`,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </RoomLayout>
  );
};

export default ProjectsPage;
