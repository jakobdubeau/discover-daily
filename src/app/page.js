import Image from "next/image";
import HeroSection from "./components/HeroSection";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col bg-black bg-[radial-gradient(#2a2030_1px,transparent_1px)] bg-size-[16px_16px]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.25)_75%)] pointer-events-none"></div>
      <div className="container mt-24 mx-auto px-12 py-4">
        <HeroSection />
      </div>
    </main>
  );
}
