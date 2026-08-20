import React from 'react';
import dynamic from 'next/dynamic';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import { getDatasetsMetadata } from 'app/content/utils/mdx';

// Compiled here, rendered by ./mdx-content behind `ssr: false`: veda-ui reads
// `window.location` at module scope, so importing it into Next's SSR pass
// throws `ReferenceError: window is not defined` and returns 500.
const MDXContent = dynamic(() => import('./mdx-content'), {
  ssr: false,
  loading: () => <p className='p-8 text-center'>Loading…</p>,
});

export async function CustomMDX({ source }: { source: string }) {
  const datasets = getDatasetsMetadata();
  const serialized = await serialize(source, {
    // enable GFM so markdown pipe tables in dataset MDX render as tables
    mdxOptions: { remarkPlugins: [remarkGfm] },
  });

  return <MDXContent serialized={serialized} datasets={datasets} />;
}
