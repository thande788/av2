import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-start justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Hello World</h1>
        <p className="max-w-prose text-muted-foreground">
          Phase 1 scaffolding is in place. Next up: migrate layout components and pages from the
          Vite app.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/about">Continue to About</Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://nextjs.org/docs" target="_blank" rel="noreferrer">
            Next.js Docs
          </a>
        </Button>
      </div>
    </main>
  );
}
