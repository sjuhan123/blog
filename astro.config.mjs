import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import react from '@astrojs/react';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
  site: 'https://den-eight.vercel.app/',
  prefetch: false,
  markdown: {
    remarkPlugins: [[remarkToc, { heading: 'contents' }]],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: 'anchor' } }]]
  },
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      applyBaseStyles: false
    }),
    react(),
    icon({
      include: {
        mdi: ['*'],
        skillIcons: ['*'],
        lineMd: ['*']
      }
    })
  ]
});
