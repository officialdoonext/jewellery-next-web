import { redirect, notFound } from 'next/navigation';
import { NAVIGATION_MODULES } from '@/lib/navigation';

export async function generateStaticParams() {
  return NAVIGATION_MODULES.map((mod) => ({
    module: mod.slug,
  }));
}

export default async function ModuleRootPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;

  const mod = NAVIGATION_MODULES.find((m) => m.slug === moduleSlug);

  if (!mod || mod.items.length === 0) {
    notFound();
  }

  // Redirect to first submenu of this module
  redirect(mod.items[0].href);
}

