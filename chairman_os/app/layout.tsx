import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chairman OS — Glass Box Swarm Monitor",
  description:
    "Real-time oversight dashboard for your AI agent company. Monitor Dual-Payload Swarm Envelopes, flag relationship failures, and trigger surgical SLA interventions — without touching a line of code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%", overflow: "hidden" }}>
      <body style={{ height: "100%", margin: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
