import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/header";
import BackgroundGraphic from "@/assets/Graphics/background-homepage.png";
import LogoDefault from "@/assets/Logo/logo-default.png";
import { HomeSearchClient } from "@/components/home-search-client";

export default function Home() {
  return (
    <>
      <Header />
      <div className="relative min-h-screen bg-white">
        <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-10 md:pt-24 md:pb-12">
          <Image
            src={LogoDefault}
            alt="Galing PUP"
            priority
            className="h-32 w-auto md:h-40"
          />

          <div className="w-full max-w-6xl mt-10">
            <Suspense
              fallback={
                <div className="h-16 bg-gray-100 animate-pulse rounded-full" />
              }
            >
              <HomeSearchClient />
            </Suspense>
          </div>

          <Link
            href="/browse"
            className="mt-8 rounded-full bg-[#6b0504] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4a0403]"
          >
            <span className="inline-flex items-center gap-2">
              Explore All Studies
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </Link>
        </section>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[80vh] bg-no-repeat bg-bottom opacity-40"
          style={{
            backgroundImage: `url(${BackgroundGraphic.src})`,
            backgroundPosition: "center calc(100% + 180px)",
            backgroundSize: "125% auto",
          }}
        />
      </div>
    </>
  );
}
