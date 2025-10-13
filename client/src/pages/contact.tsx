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
import SiteHeader from "@/components/site-header";
import { useTheme } from "@/components/theme-provider";

export default function Contact() {
  const { theme } = useTheme();
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
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
      >
        <SiteHeader />

        <div className="mx-auto max-w-2xl px-4 pt-10 pb-28">
          <div className="text-center" data-testid="success-message">
            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
              MESSAGE SENT!
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Thank you for reaching out. I'll get back to you as soon as possible.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground hover:underline"
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
    <main
      data-theme={theme}
      className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
    >
      <SiteHeader />

      <div className="mx-auto max-w-2xl px-4 pt-10 pb-28">
        <h1 className="mb-8 text-4xl font-black tracking-tight sm:text-5xl" data-testid="text-contact-title">
          GET IN TOUCH
        </h1>

        <div className="mb-8">
          <p className="mb-4 text-lg text-muted-foreground">
            I'm always interested in hearing about new opportunities, collaborations, or just having a chat about product, platforms, and AI.
          </p>
          <p className="text-muted-foreground">
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
                    <FormLabel className="text-muted-foreground">Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
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
                    <FormLabel className="text-muted-foreground">Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
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
                  <FormLabel className="text-muted-foreground">Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What would you like to talk about?"
                      className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
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
                  <FormLabel className="text-muted-foreground">Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell me about your project or question."
                      className="min-h-[180px] resize-none border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
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
              className="w-full bg-foreground text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              data-testid="button-submit"
            >
              {submitMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
            <div className="text-sm text-muted-foreground" data-testid="text-privacy">
              By submitting this form, you agree to receive a response from me via email.
            </div>
          </form>
        </Form>

        {/* Alternative contact methods */}
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="mb-4 text-sm font-bold tracking-wider text-muted-foreground">OTHER WAYS TO REACH ME</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              className="group rounded-xl border border-border p-4 transition-all duration-300 hover:border-foreground/30 hover:bg-muted/60"
              href="mailto:adrian@adrianlumley.com"
              data-testid="link-email-direct"
            >
              <div className="text-xs text-muted-foreground">EMAIL</div>
              <div className="font-semibold text-foreground">adrian@adrianlumley.com</div>
              <div className="text-xs text-muted-foreground group-hover:underline">direct email</div>
            </a>
            <a
              className="group rounded-xl border border-border p-4 transition-all duration-300 hover:border-foreground/30 hover:bg-muted/60"
              href="https://www.linkedin.com/in/adrianlumley"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-linkedin-contact"
            >
              <div className="text-xs text-muted-foreground">LINKEDIN</div>
              <div className="font-semibold text-foreground">Connect with me</div>
              <div className="text-xs text-muted-foreground">professional network</div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}