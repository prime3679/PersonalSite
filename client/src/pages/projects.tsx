import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ExternalLink, Github } from "lucide-react";
import SiteHeader from "@/components/site-header";
import { useTheme } from "@/components/theme-provider";

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
  const { theme } = useTheme();
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: () => fetch("/api/projects").then(res => res.json()),
  });

  if (isLoading) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
      >
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 rounded bg-muted" />
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-6">
                  <div className="mb-2 h-6 w-2/3 rounded bg-muted" />
                  <div className="mb-4 h-4 w-full rounded bg-muted" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded bg-muted" />
                    <div className="h-6 w-20 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
      >
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
          <h1 className="mb-8 text-4xl font-black tracking-tight">PROJECTS</h1>
          <p className="text-muted-foreground">Failed to load projects. Please try again later.</p>
        </div>
      </main>
    );
  }

  return (
    <main
      data-theme={theme}
      className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
    >
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
        <h1 className="mb-8 text-4xl font-black tracking-tight sm:text-5xl" data-testid="text-projects-title">
          PROJECTS
        </h1>

        {projects && projects.length === 0 ? (
          <p className="text-muted-foreground" data-testid="text-no-projects">
            No projects available yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects?.map((project) => (
              <article
                key={project.id}
                className="group rounded-xl border border-border p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-muted/60"
                data-testid={`card-project-${project.slug}`}
              >
                {project.imageUrl && (
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      data-testid={`img-project-${project.slug}`}
                    />
                  </div>
                )}

                <h2
                  className="mb-2 text-xl font-bold transition-colors duration-200 group-hover:text-foreground"
                  data-testid={`text-project-title-${project.slug}`}
                >
                  {project.title}
                </h2>

                <p className="mb-4 leading-relaxed text-muted-foreground" data-testid={`text-project-description-${project.slug}`}>
                  {project.description}
                </p>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
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
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
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
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      data-testid={`link-project-github-${project.slug}`}
                    >
                      <Github size={14} />
                      GitHub
                    </a>
                  )}
                </div>

                {project.featured && (
                  <div className="mt-3 border-t border-border pt-3">
                    <span className="text-xs font-medium text-amber-500 dark:text-amber-400" data-testid={`text-project-featured-${project.slug}`}>
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