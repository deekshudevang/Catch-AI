import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Puzzle,
  Layers,
  BadgeCheck,
  FolderSearch,
  ArrowUp,
} from "lucide-react";

const NAV = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Features", id: "features" },
  { label: "Contact", id: "contact" },
];

const CAPABILITIES = [
  { label: "Forensic Engines", value: "Evidence-backed" },
  { label: "Recovery Sources", value: "Multiple" },
  { label: "Data Integrity", value: "Hash Verified" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Forensic Recovery",
    description:
      "Read-only acquisition and recovery workflows. Source evidence is never modified during analysis.",
  },
  {
    icon: Search,
    title: "Evidence Analysis",
    description:
      "Structured inspection of filesystem metadata, signatures and residual structures found in the source.",
  },
  {
    icon: Puzzle,
    title: "Fragment Intelligence",
    description:
      "Relates recovered fragments to one another so partial data can be understood rather than discarded.",
  },
  {
    icon: Layers,
    title: "Reconstruction",
    description:
      "Assembles files from what the underlying data supports, and stops where evidence runs out.",
  },
  {
    icon: BadgeCheck,
    title: "Validation",
    description:
      "Hash verification and format checks record what was confirmed and what remains uncertain.",
  },
  {
    icon: FolderSearch,
    title: "Case Intelligence",
    description:
      "Groups jobs, artifacts and findings into a case record with a traceable chain of activity.",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header
        id="home"
        className="hero-surface relative flex min-h-screen w-full flex-col overflow-hidden"
      >
        <div className="hero-grid-lines pointer-events-none absolute inset-0 opacity-70" />

        <nav
          aria-label="Main"
          className="relative z-10 flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-7 md:px-14"
        >
          <span className="font-display mr-4 text-base font-semibold tracking-tight">
            MCE AI
          </span>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-link focus-visible:outline-ring/60 focus-visible:outline-2 focus-visible:outline-offset-4"
              onClick={() => scrollToId(item.id)}
            >
              {item.label}
            </button>
          ))}
          <div className="ml-auto flex items-center">
             <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold hover:underline cursor-pointer">
               Dashboard &rarr;
             </button>
          </div>
        </nav>

        <div className="relative z-10 flex flex-1 items-center px-6 pb-24 md:px-14">
          <div className="max-w-2xl">
            <p className="eyebrow">Forensic Reconstruction Studio</p>
            <h1 className="mt-5 text-5xl leading-[1.05] font-semibold tracking-tight md:text-7xl">
              MCE AI Data Recovery
              <span className="text-green-primary block">
                &amp; Forensic Reconstruction
              </span>
            </h1>
            <p className="text-body mt-7 max-w-xl text-lg leading-relaxed">
              Analyze evidence, recover what the underlying data supports, and preserve
              uncertainty when reconstruction cannot be established.
            </p>
            <button
              type="button"
              className="btn-recover mt-10 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              Recover Now <span className="arrow">→</span>
            </button>
            <p className="text-body-soft mt-6 text-sm">
              Read-only analysis. Source evidence is never modified.
            </p>
          </div>
        </div>
      </header>

      <section id="about" className="bg-section-pale px-6 py-24 md:px-14">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">About</p>
          <h2 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold md:text-5xl">
            Evidence-first recovery, not guesswork
          </h2>
          <p className="text-body mt-6 max-w-2xl text-lg leading-relaxed">
            Every result is traced back to the source data it came from. Where the evidence
            supports a reconstruction, it is rebuilt and verified. Where it does not, the
            gap is recorded rather than filled in.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.label} className="surface-card surface-card-lift p-7">
                <p className="text-body-soft text-sm">{c.label}</p>
                <p className="font-display text-heading mt-2 text-2xl font-semibold">
                  {c.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-section-sage px-6 py-24 md:px-14">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Features</p>
          <h2 className="mt-4 text-4xl leading-tight font-semibold md:text-5xl">
            Capabilities of the studio
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="surface-card surface-card-lift p-7">
                <span className="bg-green-light/15 text-green-deep flex h-11 w-11 items-center justify-center rounded-xl">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-display mt-5 text-xl font-semibold">{f.title}</h3>
                <p className="text-body mt-3 leading-relaxed">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-section-pale px-6 py-28 md:px-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Contact / Get started</p>
          <h2 className="mt-4 text-4xl leading-tight font-semibold md:text-5xl">
            Begin a recovery review
          </h2>
          <p className="text-body mt-5 text-lg leading-relaxed">
            Tell us about the evidence you hold and what you need established. We will
            outline what can realistically be recovered.
          </p>
          <div className="mt-10 flex flex-col items-center gap-5">
            <button className="btn-recover cursor-pointer" onClick={() => navigate('/dashboard')}>
              Recover Now <span className="arrow">→</span>
            </button>
            <button
              type="button"
              className="nav-link text-body-soft inline-flex items-center gap-1.5 text-sm cursor-pointer"
              onClick={() => scrollToId("home")}
            >
              <ArrowUp className="h-4 w-4" aria-hidden /> Back to top
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-footer text-footer-foreground px-6 py-12 md:px-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-base font-semibold">MCE AI Data Recovery</p>
          <p className="text-sm">Recover what can be proven. Preserve what cannot.</p>
        </div>
      </footer>
    </div>
  );
}
