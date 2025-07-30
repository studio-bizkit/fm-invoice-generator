import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const metadata = {
  title: "Invoice Management | FM Studios",
  description: "Manage your invoices with ease.",
  openGraph: {
    title: "Invoice Management | FM Studios",
    description: "Manage your invoices with ease.",
    images: [
      {
        url: "https://i.ibb.co/BH6FQDXf/Screenshot-2025-07-30-191859.jpg",
        width: 1200,
        height: 630,
        alt: "FM Studios Invoice Generator Thumbnail",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice Management | FM Studios",
    description: "Manage your invoices with ease.",
    images: ["https://i.ibb.co/BH6FQDXf/Screenshot-2025-07-30-191859.jpg"],
  },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-8 bg-background">
      <div className="w-full max-w-sm space-y-10 text-center">
        {/* Logo and Header Section */}
        <div className="space-y-5">
          <Image
            src="/logo.png"
            alt="Logo"
            width={110}
            height={68}
            className="mx-auto invert"
            priority
          />
          <div className="space-y-2">
            <h1 className="text-3xl font-light tracking-wide leading-tight">
              Invoice Management
            </h1>
            <p className="text-muted-foreground font-light">
              Manage your invoices with ease
            </p>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="space-y-4">
          <Link href="/past-invoices" className="block w-full">
            <Button 
              size="lg" 
              className="w-full h-14 text-base font-normal hover:opacity-90 transition-opacity touch-manipulation"
            >
              View Past Invoices
            </Button>
          </Link>

          <Link href="/new-invoice" className="block w-full">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full h-14 text-base font-normal border hover:bg-muted/50 transition-colors touch-manipulation"
            >
              Generate New Invoice
            </Button>
          </Link>
        </div>

        {/* Simple Feature List */}
        <div className="pt-6 space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-6">
            <span>Fast</span>
            <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
            <span>Secure</span>
            <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
            <span>Simple</span>
          </div>
        </div>
      </div>
    </main>
  );
}