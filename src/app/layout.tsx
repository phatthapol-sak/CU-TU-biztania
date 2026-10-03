import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'GreenScope Concierge | Autonomous Scope 3 Carbon Accounting & Green Procurement AI Agent',
  description: 'AI-powered Scope 3 carbon accounting system that ingests unstructured supply chain documents, constructs a dynamic Knowledge Graph, detects carbon anomalies, and executes autonomous Green RFQs and supplier negotiations.',
  keywords: ['Scope 3', 'Carbon Accounting', 'ESG', 'Supply Chain Knowledge Graph', 'Green Procurement', 'AI Concierge', 'GHG Protocol'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
