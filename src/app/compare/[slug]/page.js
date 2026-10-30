import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompareView from "@/components/CompareView";
import { llmOnly } from "@/lib/agent/loop";

export const dynamic = "force-dynamic";

export default async function Compare({ params }) {
  const plan = await prisma.plan.findUnique({
    where: { shareSlug: params.slug },
    include: { profile: { include: { entities: true } } },
  });
  if (!plan) notFound();

  let llmOnlyJson = plan.llmOnlyJson;
  if (!llmOnlyJson || !llmOnlyJson.items?.length) {
    const entities = plan.profile?.entities || [];
    try {
      const generated = await llmOnly({
        entities,
        destination: plan.destination,
      });
      if (generated && generated.items?.length) {
        llmOnlyJson = generated;
        await prisma.plan.update({
          where: { id: plan.id },
          data: { llmOnlyJson: generated },
        });
      }
    } catch (e) {
      console.error("Failed on-demand llmOnly in compare page:", e.message);
    }
  }

  const evMap = Object.fromEntries(
    (plan.evidenceJson || []).map((e) => [e.id, e]),
  );

  return (
    <main style={{ paddingBottom: 100 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href={`/plan/${plan.shareSlug}`}
          className="btn-ghost"
          style={{ fontSize: 13, padding: "4px 8px" }}
        >
          ← Back to {plan.destination} Taste Map
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <span
            className="chip"
            style={{
              background: "rgba(191, 90, 242, 0.12)",
              color: "#bf5af2",
              border: "1px solid rgba(191, 90, 242, 0.25)",
            }}
          >
            Taste Graph vs Plain LLM
          </span>
        </div>

        <h1
          className="hero-title"
          style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 12 }}
        >
          Grounded Qloo vs Plain LLM: {plan.destination}
        </h1>

        <p className="hero-sub" style={{ fontSize: 16, maxWidth: 850 }}>
          Side-by-side transparency: see how Qloo grounds recommendations in
          verified cultural coordinates, compared to a plain LLM that picks by
          general popularity and echoes your inputs.
        </p>
      </div>

      <CompareView
        slug={plan.shareSlug}
        plan={plan.resultJson}
        llm={llmOnlyJson?.items}
        evMap={evMap}
        destination={plan.destination}
      />
    </main>
  );
}
