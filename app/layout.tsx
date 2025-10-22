import "./globals.css";
import ForestBg from "@/components/layout/ForestBg";
import { AudioProvider, MuteButton } from "@/components/audio/AudioProvider";

export const metadata = {
  title: "Shader House",
  description: "Where indie games shine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh text-white antialiased">
        <AudioProvider>
          <ForestBg />
          <MuteButton />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}