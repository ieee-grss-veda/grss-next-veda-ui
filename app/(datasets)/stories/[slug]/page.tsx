import React from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { CustomMDX } from 'app/components/mdx';
import { getStories } from 'app/content/utils/mdx';

// veda-ui cannot be part of Next's SSR pass; see app/components/mdx.tsx.
const StoryHero = dynamic(() => import('./story-hero'), {
  ssr: false,
  loading: () => <p className='p-8 text-center'>Loading…</p>,
});

async function generateStaticParams() {
  const posts = getStories();

  return posts.map((post) => ({ slug: post.slug }));
}

export default function StoryOverview({ params }: { params: any }) {
  const post = getStories().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type='application/ld+json'
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Story',
            title: post.metadata.name,
            description: post.metadata.description,
            coverSrc: post.metadata.media?.src,
            coverAlt: post.metadata.media?.alt,
          }),
        }}
      />
      <article className='prose'>
        <StoryHero story={post.metadata} />
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
