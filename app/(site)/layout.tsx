import "./globals.css";
import GradientBg from "@/components/layout/GradientBg";
import { AudioProvider } from "@/components/audio/AudioProvider";

export const metadata = {
  title: "Shader House",
  description: "Where indie games shine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-black text-white antialiased">
        <GradientBg />
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
