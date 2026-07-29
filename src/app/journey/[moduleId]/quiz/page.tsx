"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getModuleById } from "@/data/modules";
import { QuizRunner } from "@/components/journey/QuizRunner";

export default function ModuleQuizPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = getModuleById(moduleId);

  if (!module) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/journey" className="text-sm text-emerald-600 hover:underline">
          ← Journey
        </Link>
        <p className="mt-6">Module not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href={`/journey/${module.id}`}
        className="text-sm text-emerald-600 hover:underline"
      >
        ← Back to module
      </Link>
      <header className="mt-3">
        <h1 className="text-2xl font-bold">Mastery quiz</h1>
        <p className="mt-1 text-neutral-500">{module.title}</p>
      </header>
      <div className="mt-6">
        <QuizRunner module={module} />
      </div>
    </main>
  );
}
