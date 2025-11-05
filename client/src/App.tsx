import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import HomeV2 from "@/pages/home-v2";
import Blog from "@/pages/blog";
import BlogV2 from "@/pages/blog-v2";
import BlogPost from "@/pages/blog-post";
import BlogPostV2 from "@/pages/blog-post-v2";
import Projects from "@/pages/projects";
import ProjectsV2 from "@/pages/projects-v2";
import Contact from "@/pages/contact";
import Compare from "@/pages/compare";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/v2" component={HomeV2} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog-v2" component={BlogV2} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/blog-v2/:slug" component={BlogPostV2} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects-v2" component={ProjectsV2} />
      <Route path="/contact" component={Contact} />
      <Route path="/compare" component={Compare} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
