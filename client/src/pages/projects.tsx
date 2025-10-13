import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Project } from "@shared/schema";
import { ExternalLink, Github } from "lucide-react";

type CaseStudy = {
  id: string;
  title: string;
  headline: string;
  summary: string;
  outcomes: string[];
  responsibilities: string[];
};

const caseStudies: CaseStudy[] = [
  {
    id: "siriusxm",
    title: "SiriusXM cross-platform listening growth",
    headline: "18% more daily sessions, 12% churn reduction",
    summary:
      "Scaled a listening experience refresh across mobile, web, and in-car devices for 34M subscribers by pairing human-centered design with personalization experiments.",
    outcomes: [
      "18% lift in daily listening sessions and +9 pt improvement in weekly retention",
      "12% drop in voluntary churn inside the first 90 days of subscription",
      "New experimentation framework increased shipping cadence 3x",
    ],
    responsibilities: [
      "Owned product strategy and roadmap across playback, discovery, and personalization squads",
      "Partnered with data science to operationalize a multi-armed bandit recommendation model",
      "Directed multi-platform design system alignment with design and engineering leads",
    ],
  },
  {
    id: "disney-plus",
    title: "Disney+ global launch operations",
    headline: "60+ markets live with 35% faster localization",
    summary:
      "Built the orchestration layer that let launch teams localize and certify content, payments, and UX strings so new markets could ship with feature parity day one.",
    outcomes: [
      "Enabled simultaneous launches across 60+ countries and 45 language variants",
      "Reduced subtitle and artwork localization SLAs by 35% through workflow automation",
      "Improved regression detection coverage to 92% ahead of regional rollouts",
    ],
    responsibilities: [
      "Defined multi-team launch playbooks spanning content ops, payments, and growth",
      "Shipped analytics dashboards for real-time readiness tracking across 12 partner teams",
      "Negotiated vendor integrations and QA gates to keep quality bars consistent",
    ],
  },
  {
    id: "ea-hyperscience",
    title: "EA live service & Hyperscience automation",
    headline: "14% ARPDAU lift and 30% cost savings",
    summary:
      "Balanced monetization, player trust, and automation by shipping data-informed systems across gaming and enterprise AI contexts.",
    outcomes: [
      "Improved EA live event ARPDAU 14% while maintaining session satisfaction scores",
      "Expanded personalization tests that lifted daily active teams 11% across flagship titles",
      "Reduced Hyperscience document processing cost per page 30% via ML-driven routing",
    ],
    responsibilities: [
      "Co-led economy design, pricing experiments, and merchandising with PMM and analytics",
      "Introduced player telemetry reviews that shortened decision loops from weeks to days",
      "Guided ML productization from prototype to SOC2-compliant customer deployment",
    ],
  },
];

export default function Projects() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: () => fetch("/api/projects").then(res => res.json()),
  });

  return (
    <main className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/70 border-b border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between text-sm">
          <nav className="flex gap-5 font-medium">
            <Link href="/" className="hover:underline transition-all duration-200" data-testid="link-home">
              HOME
            </Link>
            <Link href="/blog" className="hover:underline transition-all duration-200" data-testid="link-blog">
              BLOG
            </Link>
            <Link href="/projects" className="hover:underline transition-all duration-200 text-white" data-testid="link-projects">
              PROJECTS
            </Link>
            <a href="/#contact" className="hover:underline transition-all duration-200" data-testid="link-contact">
              CONTACT
            </a>
          </nav>
          <div className="text-xs text-zinc-400" data-testid="text-location">NYC • US/UK</div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-8" data-testid="text-projects-title">
          PROJECTS
        </h1>

        <section className="space-y-12 mb-16">
          {caseStudies.map((study) => (
            <article
              key={study.id}
              id={study.id}
              className="border border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-950/40 backdrop-blur-sm"
              data-testid={`case-study-${study.id}`}
            >
              <header className="mb-4">
                <h2 className="text-2xl font-semibold text-white mb-1">{study.title}</h2>
                <p className="text-sm uppercase tracking-wider text-amber-400">{study.headline}</p>
              </header>
              <p className="text-zinc-300 leading-relaxed mb-6">{study.summary}</p>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Outcomes</h3>
                  <ul className="space-y-2 text-zinc-200 leading-relaxed list-disc list-inside">
                    {study.outcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Responsibilities</h3>
                  <ul className="space-y-2 text-zinc-200 leading-relaxed list-disc list-inside">
                    {study.responsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>

        {error ? (
          <p className="text-zinc-400" data-testid="text-projects-error">
            Failed to load projects. Please try again later.
          </p>
        ) : isLoading ? (
          <div className="animate-pulse" data-testid="skeleton-projects">
            <div className="h-8 bg-zinc-800 rounded mb-4"></div>
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 border border-zinc-800 rounded-xl">
                  <div className="h-6 bg-zinc-800 rounded mb-2"></div>
                  <div className="h-4 bg-zinc-800 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-zinc-800 rounded w-16"></div>
                    <div className="h-6 bg-zinc-800 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : projects && projects.length === 0 ? (
          <p className="text-zinc-400" data-testid="text-no-projects">
            No projects available yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects?.map((project) => (
              <article
                key={project.id}
                className="group border border-zinc-800 rounded-xl p-6 hover:bg-zinc-950 transition-all duration-300 hover:border-zinc-700"
                data-testid={`card-project-${project.slug}`}
              >
                {project.imageUrl && (
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      data-testid={`img-project-${project.slug}`}
                    />
                  </div>
                )}

                <h2 className="text-xl font-bold mb-2 group-hover:text-white transition-colors duration-200" data-testid={`text-project-title-${project.slug}`}>
                  {project.title}
                </h2>

                <p className="text-zinc-300 mb-4 leading-relaxed" data-testid={`text-project-description-${project.slug}`}>
                  {project.description}
                </p>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-md"
                        data-testid={`tag-tech-${project.slug}-${index}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors duration-200"
                      data-testid={`link-project-live-${project.slug}`}
                    >
                      <ExternalLink size={14} />
                      Live Demo
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors duration-200"
                      data-testid={`link-project-github-${project.slug}`}
                    >
                      <Github size={14} />
                      GitHub
                    </a>
                  )}
                </div>

                {project.featured && (
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <span className="text-xs text-amber-400 font-medium" data-testid={`text-project-featured-${project.slug}`}>
                      ★ Featured Project
                    </span>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}