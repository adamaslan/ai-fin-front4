import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Symbol Not Found</h1>
      <p className="text-muted-foreground mb-8">
        No analysis data found for this symbol. Run the Python pipeline to generate data.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
      >
        Back to Home
      </Link>
    </main>
  );
}
