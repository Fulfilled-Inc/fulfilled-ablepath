import { useTranslations } from "next-intl";
import Link from "next/link";
import { Heart, BookOpen, Brain, SmilePlus } from "lucide-react";

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-primary">
          🧡 {t("common.appName")}
        </h1>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t("auth.login")}
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            {t("auth.signup")}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-6xl">🌈</div>
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Every child deserves
            <br />
            <span className="text-primary">a path to grow</span>
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">
            Home-based developmental support for your child.
            Daily missions, mood tracking, and AI-powered guidance
            — all in one place.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
          >
            <Heart className="h-5 w-5" />
            Get Started Free
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<BookOpen className="h-8 w-8 text-primary" />}
            title={t("nav.missions")}
            description="Language, sensory, and cognitive missions tailored to your child."
          />
          <FeatureCard
            icon={<SmilePlus className="h-8 w-8 text-accent" />}
            title={t("nav.mood")}
            description="Track your child's daily mood with simple emoji-based logging."
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-primary" />}
            title={t("nav.aiGuide")}
            description="Get instant, AI-powered tips for everyday challenges."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        © 2026 AblePath. Built with 🧡 for every family.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-card-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
