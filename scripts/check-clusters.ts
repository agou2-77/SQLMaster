/**
 * Dev guard for the journey clusters: assert every ModuleCluster references real
 * modules, paths, and problems, and that the clusters partition the authored
 * modules exactly (every authored module in exactly one cluster — no orphans, no
 * duplicates). Cheap referential-integrity check in the spirit of self-check.ts,
 * so a broken cluster definition fails `npm run check` instead of shipping.
 *
 * Run with: npx tsx scripts/check-clusters.ts
 */
import { CLUSTERS } from "@/data/clusters";
import { MODULES } from "@/data/modules";
import { PATHS } from "@/data/paths";
import { getProblemById } from "@/lib/problems/registry";

function main() {
  const failures: string[] = [];

  const moduleIds = new Set(MODULES.map((m) => m.id));
  const authoredIds = new Set(
    MODULES.filter((m) => m.status === "authored").map((m) => m.id),
  );
  const pathIds = new Set(PATHS.map((p) => p.id));

  // No duplicate cluster ids.
  const seenClusterIds = new Set<string>();
  for (const c of CLUSTERS) {
    if (seenClusterIds.has(c.id)) failures.push(`duplicate cluster id: ${c.id}`);
    seenClusterIds.add(c.id);
    if (c.moduleIds.length < 2) {
      failures.push(`cluster ${c.id}: expected ≥2 modules, got ${c.moduleIds.length}`);
    }
  }

  // Every referenced module / path / problem must resolve.
  for (const c of CLUSTERS) {
    for (const id of c.moduleIds) {
      if (!moduleIds.has(id)) {
        failures.push(`cluster ${c.id}: unknown module "${id}"`);
      } else if (!authoredIds.has(id)) {
        failures.push(
          `cluster ${c.id}: module "${id}" is a stub — clusters must reference only authored modules`,
        );
      }
    }
    for (const id of c.pathIds ?? []) {
      if (!pathIds.has(id)) failures.push(`cluster ${c.id}: unknown path "${id}"`);
    }
    for (const id of c.problemIds ?? []) {
      if (!getProblemById(id)) failures.push(`cluster ${c.id}: unknown problem "${id}"`);
    }
  }

  // Clusters must partition the authored modules: each authored module in
  // exactly one cluster, and no cluster module missing from the registry.
  const assignment = new Map<string, string[]>();
  for (const c of CLUSTERS) {
    for (const id of c.moduleIds) {
      assignment.set(id, [...(assignment.get(id) ?? []), c.id]);
    }
  }
  for (const [id, clusters] of assignment) {
    if (clusters.length > 1) {
      failures.push(`module "${id}" is in multiple clusters: ${clusters.join(", ")}`);
    }
  }
  for (const id of authoredIds) {
    if (!assignment.has(id)) {
      failures.push(`authored module "${id}" is not in any cluster`);
    }
  }

  if (failures.length > 0) {
    for (const f of failures) console.error(`✗ ${f}`);
    console.error(`\n${failures.length} cluster issue(s) found.`);
    process.exit(1);
  }

  const clustered = [...assignment.keys()].filter((id) => authoredIds.has(id));
  console.log(
    `All ${CLUSTERS.length} clusters valid ` +
      `(${clustered.length}/${authoredIds.size} authored modules assigned).`,
  );
}

main();
