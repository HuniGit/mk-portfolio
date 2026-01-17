import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import ExperienceCard from "~/components/experience/ExperienceCard";
import SkillCard from "~/components/skills/SkillCard";
import ProjectCard from "~/components/ui/ProjectCard";
import ThemeToggle from "~/components/ui/ThemeToggle";
import type { Experience } from "~/types/experience";
import type { Project } from "~/types/project";
import type { Skill } from "~/types/skill";
import { SKILL_CATEGORIES } from "~/utils/categories";
import { fetchVelogPosts } from "~/utils/rss";

// 변환된 개인정보 타입
type PersonalInfoData = {
  name?: string;
  title?: string;
  bio?: string;
  email?: string;
  location?: string;
  github?: string;
  notion?: string;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const ownerName = data?.personalInfo?.name || "Portfolio Owner";
  const ownerTitle = data?.personalInfo?.title || "Developer";
  const ownerBio = data?.personalInfo?.bio || "모던 웹 개발";

  return [
    { title: `${ownerName} - ${ownerTitle}` },
    { name: "description", content: ownerBio },
    {
      name: "keywords",
      content: `${ownerName}, ${ownerTitle}, 포트폴리오, 개발자`,
    },
    { name: "author", content: ownerName },
    { name: "robots", content: "index, follow" },

    { property: "og:title", content: `${ownerName} - ${ownerTitle}` },
    { property: "og:description", content: ownerBio },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: `${ownerName} Portfolio` },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const [
    personalInfoResults,
    projectsResults,
    experiencesResults,
    skillsResults,
    velogPosts,
  ] = await Promise.all([
    context.cloudflare.env.DB.prepare("SELECT * FROM personal_info").all(),
    context.cloudflare.env.DB.prepare(
      "SELECT * FROM projects WHERE featured = 1 ORDER BY order_index ASC"
    ).all(),
    context.cloudflare.env.DB.prepare(
      "SELECT * FROM experiences ORDER BY order_index ASC"
    ).all(),
    context.cloudflare.env.DB.prepare(
      "SELECT * FROM skills ORDER BY category, proficiency DESC, name"
    ).all(),
    fetchVelogPosts("93minki", 3),
  ]);

  const personalInfo: PersonalInfoData = {};
  for (const row of personalInfoResults.results as Array<{
    key: string;
    value: string;
  }>) {
    personalInfo[row.key as keyof PersonalInfoData] = row.value;
  }

  // 환경변수 우선 적용
  const ownerName =
    context.cloudflare.env.OWNER_NAME || personalInfo.name || "Portfolio Owner";
  const ownerPosition =
    context.cloudflare.env.OWNER_POSITION || personalInfo.title || "Developer";

  return {
    personalInfo,
    projects: projectsResults.results as unknown as Project[],
    experiences: experiencesResults.results as unknown as Experience[],
    skills: skillsResults.results as unknown as Skill[],
    velogPosts,
    ownerName,
    ownerPosition,
  };
};

export default function Index() {
  const { personalInfo, projects, experiences, skills, velogPosts, ownerName } =
    useLoaderData<typeof loader>();

  // 카테고리별로 스킬 그룹핑
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // 카테고리명을 한국어로 변환
  const getCategoryLabel = (category: string) => {
    const categoryConfig = SKILL_CATEGORIES.find(
      (cat) => cat.value === category
    );
    return categoryConfig ? categoryConfig.label : category;
  };

  // 카테고리 순서 정의
  const categoryOrder = ["frontend", "backend", "database", "tools"];

  // 순서대로 카테고리 정렬
  const sortedCategories = categoryOrder.filter(
    (category) => skillsByCategory[category]
  );

  const getName = () => "홍훈의";
  const getBio = () =>
    personalInfo.bio || "사용자 경험을 중시하는 Frontend Developer입니다.";

  const getLocation = () => personalInfo.location || "Seoul, South Korea";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* 테마 토글 버튼 - 고정 위치 */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {getName().charAt(0)}
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            안녕하세요,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {getName()}
            </span>
            입니다
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {getBio()}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {getLocation()}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                이메일 보내기
              </a>
            )}
            {personalInfo.github && (
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-900 dark:bg-gray-700 text-white font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}
            {personalInfo.notion && (
              <a
                href={personalInfo.notion}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 dark:bg-green-700 text-white font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="w-5 h-5 mr-2 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-700 text-xs font-bold">
                    V
                  </span>
                </div>
                Velog
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            개발하며 성장해온 프로젝트들입니다
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              아직 프로젝트가 등록되지 않았습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              관리자 페이지에서 프로젝트를 추가해보세요!
            </p>
            <a
              href="/admin"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-700 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              관리자 페이지로 이동
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
      {/* Experience & Career */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Experience & Career
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            함께 성장해온 경력과 경험들입니다
          </p>
        </div>

        {experiences.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              아직 경력이 등록되지 않았습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              관리자 페이지에서 경력을 추가해보세요!
            </p>
            <a
              href="/admin"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-700 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              관리자 페이지로 이동
            </a>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        )}
      </div>
      {/* Skills & Technologies */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Skills & Technologies
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              저와 함께 작업할 수 있는 기술 스택입니다
            </p>
          </div>

          {skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                아직 스킬이 등록되지 않았습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                관리자 페이지에서 기술 스택을 추가해보세요!
              </p>
              <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                관리자 페이지로 이동
              </a>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {sortedCategories.map((category) => (
                <div
                  key={category}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {getCategoryLabel(category)}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {skillsByCategory[category].map((skill) => (
                      <SkillCard key={skill.id} skill={skill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Latest Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Blog Posts
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            벨로그에서 최근 작성한 글들입니다
          </p>
        </div>

        {velogPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              아직 블로그 글이 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              노션에 글을 작성해보세요!
            </p>
            {personalInfo.notion && (
              <a
                href={personalInfo.notion}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 dark:bg-green-700 text-white font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                노션 바로가기
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {velogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl dark:shadow-gray-900/20 transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.pubDate).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium"
                    >
                      읽어보기
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
