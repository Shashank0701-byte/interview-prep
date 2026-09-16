import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-cream px-6 text-center text-charcoal dark:bg-navy dark:text-cream">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em]">Error 404</p>
        <h1 className="mt-3 font-display text-5xl font-bold">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-charcoal/70 dark:text-cream/70">
          The page you requested does not exist or may have moved.
        </p>
        <Link className="mt-8 inline-block rounded-sm bg-charcoal px-5 py-3 font-semibold text-cream dark:bg-cream dark:text-navy" to="/">
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
