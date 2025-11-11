"use client";

import { Header } from "@/components/Header";
import { PricingCard } from "@/components/pricing-card";
import { BenefitCard } from "@/components/benefit-card";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <section className="flex flex-col items-center justify-center bg-red-900">
          <span>
            <Crown className="text-yellow-600" /> Choose your plan
          </span>
          <h2 className="font-extrabold text-3xl">Subscription Plans</h2>
          Start with our free tier or unlock unlimited access with Premium.
          Choose the plan that fits your research needs.
        </section>
        {/* Pricing Cards Grid */}
        <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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

        <section className="flex flex-col items-center justify-center bg-slate-100 text-black">
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

        <section className="flex flex-col items-center justify-center bg-white text-black">
          <h2 className="font-extrabold text-3xl">Feature Comparison</h2>

        </section>

        <section className="flex flex-col items-center justify-center bg-slate-100 text-black">
          <h2 className="font-extrabold text-3xl">Frequently Asked Questions</h2>
          
        </section>

        <section className="flex flex-col items-center justify-center bg-red-900 text-white">
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
