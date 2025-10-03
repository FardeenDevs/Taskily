
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, LayoutGrid, Lock, Notebook, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const features = [
    {
      icon: <LayoutGrid className="h-6 w-6" />,
      title: 'Organize with Listspaces',
      description: 'Create separate spaces for your tasks and notes, keeping work and personal life neatly organized.',
    },
    {
      icon: <Notebook className="h-6 w-6" />,
      title: 'Integrated Notes',
      description: 'A full-featured notes editor right beside your tasks. Capture ideas without breaking your flow.',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI Task Suggestions',
      description: 'Let AI help you break down your goals into actionable steps based on your current task list.',
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'Secure Your Notes',
      description: 'Protect sensitive information by setting a password for the notes within any Listspace.',
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: 'Priority & Effort',
      description: 'Plan your work effectively by assigning priority (P1-P5) and effort (E1-E5) levels to your tasks.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 8.7C3 7 4.7 5.2 6.5 5.2c2.1 0 3.3 1.4 3.5 2.2.2.8.3 1.6.3 2.4s-.1 1.7-.3 2.4c-.2.8-1.4 2.2-3.5 2.2C4.7 17.2 3 15.4 3 13.7V8.7Z"/><path d="M12.5 5.2c1.8 0 3.5 1.8 3.5 3.5v.1c0 1.6-1.3 3.1-3.2 3.8l-.3.1c-.6.2-1 .7-1 1.3v.1h8.5"/><path d="M17.5 12.2c1.8 0 3.5 1.8 3.5 3.5v.1c0 1.7-1.7 3.5-3.5 3.5s-3.5-1.8-3.5-3.5c0-1.2.6-2.3 1.5-3"/></svg>,
      title: 'PWA Ready',
      description: 'Install Listily on your desktop or mobile for a fast, native-app experience.',
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-app-gradient">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between bg-background/50 px-4 backdrop-blur-sm md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <svg role="img" viewBox="0 0 24 24" className="h-8 w-8 text-primary">
            <title>Listily</title>
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
              fill="currentColor"
            ></path>
            <path
              d="m16.299 7.295-5.294 5.294-2.293-2.293-1.414 1.414 3.707 3.707 6.707-6.707z"
              fill="currentColor"
            ></path>
          </svg>
          <span className="text-xl font-bold">Listily</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="shadow-lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="flex min-h-[500px] flex-col items-center justify-center pt-24 text-center md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Organize Your Chaos.
              <br />
              <span className="bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end bg-clip-text text-transparent">
                Find Your Flow.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Welcome to <span className="font-bold text-foreground">Listily Utilities</span> — a powerful suite of tools designed to bring your tasks and notes together in one focused, intelligent workspace.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="shadow-xl">
                <Link href="/app">
                  Open App <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/FirebaseExtended/codelab-studiovs-nextjs-listily" target="_blank">
                  Learn More
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-12 max-w-3xl text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">All-In-One Productivity</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Listily is more than just a to-do list. It's a complete system to help you plan, execute, and document your work.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-6">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Listily. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Powered by Firebase and Google AI</p>
        </div>
      </footer>
    </div>
  );
}
