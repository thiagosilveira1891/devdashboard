import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Developer Dashboard — toda tu vida como developer, en un solo lugar",
    template: "%s · Developer Dashboard",
  },
  description:
    "Conecta GitHub, LeetCode, Codeforces y WakaTime y visualiza toda tu actividad técnica: commits, horas programadas, problemas resueltos, streaks y más. Open source.",
  openGraph: {
    title: "Developer Dashboard",
    description:
      "Conecta GitHub, LeetCode, Codeforces y WakaTime y visualiza toda tu actividad técnica en un solo lugar.",
    type: "website",
    siteName: "Developer Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Dashboard",
    description:
      "Toda tu vida como developer. Un solo dashboard. Open source.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var t=localStorage.getItem("theme");
                if(t==="light"){document.documentElement.classList.remove("dark")}
                else if(!t&&!window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.remove("dark")}
                else{document.documentElement.classList.add("dark")}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
