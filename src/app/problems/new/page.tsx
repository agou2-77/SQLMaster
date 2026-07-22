import Link from "next/link";
import { ProblemForm } from "@/components/authoring/ProblemForm";

export default function NewProblemPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/problems" className="text-sm text-emerald-600 hover:underline">
        ← All problems
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Author a problem</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Define a schema, a reference solution, and a prompt. We validate the SQL runs
        before saving it locally to your browser.
      </p>
      <div className="mt-6">
        <ProblemForm />
      </div>
    </main>
  );
}
