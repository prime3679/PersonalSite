import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { insertContactSubmissionSchema, type InsertContactSubmission } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<InsertContactSubmission>({
    resolver: zodResolver(insertContactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: undefined,
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertContactSubmission) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContactSubmission) => {
    submitMutation.mutate(data);
  };

  if (isSubmitted) {
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
              <Link href="/projects" className="hover:underline transition-all duration-200" data-testid="link-projects">
                PROJECTS
              </Link>
              <Link href="/contact" className="hover:underline transition-all duration-200 text-white" data-testid="link-contact">
                CONTACT
              </Link>
            </nav>
            <div className="text-xs text-zinc-400" data-testid="text-location">NYC • US/UK</div>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 pt-10 pb-28">
          <div className="text-center" data-testid="success-message">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              MESSAGE SENT!
            </h1>
            <p className="text-lg text-zinc-300 mb-8">
              Thank you for reaching out. I'll get back to you as soon as possible.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-white hover:underline"
              data-testid="link-back-home"
            >
              ← Back to Home
            </Link>
          </div>
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
            <Link href="/projects" className="hover:underline transition-all duration-200" data-testid="link-projects">
              PROJECTS
            </Link>
            <Link href="/contact" className="hover:underline transition-all duration-200 text-white" data-testid="link-contact">
              CONTACT
            </Link>
          </nav>
          <div className="text-xs text-zinc-400" data-testid="text-location">NYC • US/UK</div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-10 pb-28">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-8" data-testid="text-contact-title">
          GET IN TOUCH
        </h1>
        
        <div className="mb-8">
          <p className="text-lg text-zinc-300 mb-4">
            I'm always interested in hearing about new opportunities, collaborations, or just having a chat about product, platforms, and AI.
          </p>
          <p className="text-zinc-400">
            Fill out the form below and I'll get back to you as soon as possible.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name"
                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                        data-testid="input-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your@email.com"
                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                        data-testid="input-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="What's this about?"
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                      data-testid="input-subject"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell me about your project, idea, or just say hello..."
                      rows={6}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-600 resize-none"
                      data-testid="input-message"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={submitMutation.isPending}
              className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
              data-testid="button-submit"
            >
              {submitMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Form>

        {/* Alternative contact methods */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <h2 className="text-sm font-bold tracking-wider text-zinc-400 mb-4">OTHER WAYS TO REACH ME</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <a 
              className="group border border-zinc-800 rounded-xl p-4 hover:bg-zinc-950 transition-all duration-300 hover:border-zinc-700"
              href="mailto:adrian@adrianlumley.com"
              data-testid="link-email-direct"
            >
              <div className="text-zinc-400 text-xs">EMAIL</div>
              <div className="font-semibold">adrian@adrianlumley.com</div>
              <div className="text-zinc-400 text-xs group-hover:underline">direct email</div>
            </a>
            <a 
              className="group border border-zinc-800 rounded-xl p-4 hover:bg-zinc-950 transition-all duration-300 hover:border-zinc-700"
              href="https://www.linkedin.com/in/adrianlumley"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-linkedin-contact"
            >
              <div className="text-zinc-400 text-xs">LINKEDIN</div>
              <div className="font-semibold">Connect with me</div>
              <div className="text-zinc-400 text-xs">professional network</div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}