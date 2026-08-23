export type Image = {
  src: string;
  alt?: string;
  caption?: string;
};

export type Link = {
  text: string;
  href: string;
};

export type Icon = {
  name: string;
  href: string;
};

export type Hero = {
  title?: string;
  image?: Image;
  socialLinks?: Icon[];
  actions?: Link[];
};

export type SiteConfig = {
  logo?: Image;
  title: string;
  subtitle?: string;
  description: string;
  image?: Image;
  headerNavLinks?: Link[];
  socialLinks?: Link[];
  hero?: Hero;
  postsPerPage?: number;
  projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
  title: '한승주﹒Den',
  description: '한승주의 개인 블로그',
  image: {
    src: '/dante-preview.jpg',
    alt: 'Dante - Astro.js and Tailwind CSS theme',
  },
  headerNavLinks: [
    {
      text: '글쓴이',
      href: '/',
    },
    {
      text: '글',
      href: '/blog',
    },
  ],
  hero: {
    socialLinks: [
      {
        name: 'mdi:email-outline',
        href: 'sjuhan123@gmail.com',
      },
      {
        name: 'mdi:github',
        href: 'https://github.com/sjuhan123',
      },
      {
        name: 'skill-icons:linkedin',
        href: 'https://www.linkedin.com/in/%EC%8A%B9%EC%A3%BC-%ED%95%9C-37518021a/',
      },
    ],
  },
};

export default siteConfig;
