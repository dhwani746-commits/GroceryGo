import { notFound } from 'next/navigation';

/**
 * Catch-all segment — matches any URL not handled by the file-system router
 * (e.g. /random-path, /foo/bar/baz) and delegates to the root not-found.tsx.
 *
 * Placed at the app root so it catches routes outside (store), (admin), and api/.
 * Next.js file-system routing always prefers specific routes over this catch-all,
 * so legitimate pages are never affected.
 */
export default function CatchAllPage() {
  notFound(); // Renders app/not-found.tsx with a 404 status
}
