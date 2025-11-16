"use client";

import { Header } from "@/components/header";
import { PricingCard } from "@/components/pricing/pricing-card";
import { BenefitCard } from "@/components/pricing/benefit-card";
import { FeatureComparisonTable } from "@/components/pricing/feature-comparison-table";
import { FAQCard } from "@/components/pricing/faq-card";
import { Crown, Download, Sparkles, Zap } from "lucide-react";

export default function PricingPage() {
  const freeTierFeatures = [
    { name: "3 downloads per day", included: true },
    { name: "5 citations per day", included: true },
    { name: "Up to 5 bookmarks", included: true },
    { name: "Basic search and browse", included: true },
    { name: "View abstracts", included: true },
    { name: "AI-generated summaries", included: true },
    { name: "Unlimited downloads", included: false },
  ];

  const premiumTierFeatures = [
    { name: "Unlimited downloads", included: true },
    { name: "Unlimited citations", included: true },
    { name: "Unlimited bookmarks", included: true },
    { name: "Advanced search filters", included: true },
    { name: "Full document access", included: true },
    { name: "AI-generated summaries", included: true },
    { name: "Early access to features", included: true },
  ];

  const comparisonFeatures = [
    { name: "Daily Downloads", free: "3", premium: "Unlimited" },
    { name: "Citation Generations", free: "5/day", premium: "Unlimited" },
    { name: "Bookmarks", free: "5 max", premium: "Unlimited" },
    { name: "AI Summaries", free: true, premium: true },
    { name: "Advertisements", free: "20s before download", premium: "None" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="flex flex-col items-center justify-center bg-red-900 py-8">
          <span>
            <Crown className="text-yellow-600" /> Choose your plan
          </span>
          <h2 className="font-extrabold text-3xl">Subscription Plans</h2>
          Start with our free tier or unlock unlimited access with Premium.
          Choose the plan that fits your research needs.
        </section>
        {/* Pricing Cards Grid */}
        <section className="flex items-center justify-center gap-8 py-16 bg-white">
          {/* Free Tier Card */}
          <PricingCard
            title="Free Tier"
            price={0}
            currency="₱"
            duration="/forever"
            description="Perfect for casual research and browsing"
            features={freeTierFeatures}
            buttonText="Get Started Free"
            buttonColor="bg-gray-900 hover:bg-gray-800"
            accentColor="text-green-600"
            onButtonClick={() => console.log("Free tier clicked")}
          />

          {/* Premium Tier Card */}
          <PricingCard
            title="Premium Tier"
            price={299}
            currency="₱"
            duration="/forever"
            description="Best for active researchers and students"
            features={premiumTierFeatures}
            buttonText="Upgrade to Premium"
            isRecommended={true}
            borderColor="border-yellow-400"
            buttonColor="bg-red-900 hover:bg-red-800"
            accentColor="text-red-700"
            icon={<Crown className="text-yellow-400" />}
            onButtonClick={() => console.log("Premium tier clicked")}
          />
        </section>

        <section className="flex flex-col items-center justify-center bg-slate-100 text-black py-10 gap-y-4">
          <h2 className="font-extrabold text-3xl">Why Go Premium?</h2>
          <p>
            Unlock the full potential of GALING PUP with Premium features designed for serious researchers
          </p>
          {/* Grid for benefits cards */}
          <div className="flex items-center justify-center gap-8">
            <BenefitCard
              icon={<Download className="w-8 h-8" />}
              title="Unlimited Access"
              description="Download as many papers as you need without daily limits"
            />
            <BenefitCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI Insights"
              description="Get deep analysis and key findings from research papers"
            />
            <BenefitCard
              icon={<Zap className="w-8 h-8" />}
              title="Unlimited Citations"
              description="Enjoy generating as many citations as you need"
            />
          </div>
        </section>

        <section className="flex flex-col items-center justify-center bg-white text-black py-10 gap-y-4">
          <h2 className="font-extrabold text-3xl">Feature Comparison</h2>
          <FeatureComparisonTable features={comparisonFeatures} />
        </section>

        <section className="flex flex-col items-center justify-center bg-slate-100 text-black py-10 gap-y-4">
          <h2 className="font-extrabold text-3xl">Frequently Asked Questions</h2>
          
          <div className="w-full max-w-4xl space-y-6">
            <FAQCard
              question="What payment methods do you accept?"
              answer="We accept credit cards, debit cards, and GCash for Premium subscriptions."
            />
            <FAQCard
              question="Do I only need to purchase once?"
              answer="Yes! It's a one-time payment that gives you lifetime access — no subscriptions, renewals, or hidden fees."
            />
            <FAQCard
              question="Can I transfer my lifetime access to someone else?"
              answer="Lifetime access is non-transferable and is tied to your account or email upon purchase."
            />
          </div>
        </section>

        <section className="flex flex-col items-center justify-center bg-red-900 text-white py-10 gap-y-4">
          <Crown className="text-yellow-600" />
          <h2>Ready to Upgrade?</h2>
          <p>Join hundreds of Premium members enjoying unlimited access to academic resources</p>
          <button>
            <span><Crown className="text-yellow-600" />Upgrade to Premium</span>
          </button>
        </section>
      </main>
    </div>
  );
}
