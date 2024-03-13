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
  text?: string;
  textFooter?: string;
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
    alt: 'Dante - Astro.js and Tailwind CSS theme'
  },
  headerNavLinks: [
    {
      text: '글쓴이',
      href: '/'
    },
    {
      text: '글',
      href: '/blog'
    },
    {
      text: '기록',
      href: '/memory'
    }
  ],
  hero: {
    text: `사용하기 <u>편리한 서비스</u>가 많은 사람들을 도울 수 있을 것이라 믿습니다.
\n**유쾌한 경험**을 주는 UI/UX를 구현하는 것에서 뿌듯함과 성취감을 느낍니다.`,
    textFooter: '현재는 **IT기기 사용에 어려움이 많은 어르신들을** 위한 서비스를 개발하고 있습니다.',
    socialLinks: [
      {
        name: 'mdi:email-outline',
        href: 'sjuhan123@gmail.com'
      },
      {
        name: 'mdi:github',
        href: 'https://github.com/sjuhan123'
      },
      {
        name: 'skill-icons:linkedin',
        href: 'https://www.linkedin.com/in/%EC%8A%B9%EC%A3%BC-%ED%95%9C-37518021a/'
      }
    ]
  }
};

export default siteConfig;
