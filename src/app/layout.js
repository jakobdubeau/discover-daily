import { Geist, Geist_Mono, Poppins } from "next/font/google"
import "./globals.css";
import { User } from "lucide-react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600", "700", "800"]
});

export const metadata = {
  title: "Discover Daily",
  description: "Spotify playlist generator for new music discovery",
  icons: {
    icon: "/icons/android-chrome-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <main className="flex min-h-screen flex-col bg-black selection:bg-purple-400 bg-[radial-gradient(#181818_1px,transparent_1px)] bg-size-[16px_16px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.25)_75%)] pointer-events-none"></div>
          <div className="container mt-24 mx-auto px-12 pt-4 flex flex-col flex-1">
            <button
              className="absolute right-12 top-10 text-[#ADB7BE] hover:text-white cursor-pointer transition-all duration-200"
            >
              <User className="w-9 h-9"/>
            </button>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
