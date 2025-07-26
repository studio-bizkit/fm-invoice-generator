import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Invoice Management
          </h1>
          <p className="text-muted-foreground">
            Manage your invoices with ease
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <Link href="/past-invoices" className="w-full">
            <Button size="lg" className="w-full">
              View Past Invoices
            </Button>
          </Link>
          <Link href="/new-invoice" className="w-full">
            <Button size="lg" variant="outline" className="w-full">
              Generate New Invoice
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
