import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Project } from "@shared/schema";
import { ExternalLink, Github } from "lucide-react";

export default function Projects() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: () => fetch("/api/projects").then(res => res.json()),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-28">
          <div className="animate-pulse">
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
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-28">
          <h1 className="text-4xl font-black tracking-tight mb-8">PROJECTS</h1>
          <p className="text-zinc-400">Failed to load projects. Please try again later.</p>
        </div>
      </main>
    );
  }

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
        
        {projects && projects.length === 0 ? (
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