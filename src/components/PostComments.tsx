import { useEffect } from 'react';
import { giscusThemes } from '../constants/giscus';

export const changeGiscusTheme = (theme: keyof typeof giscusThemes) => {
  const sendMessage = (config: unknown) => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');

    iframe?.contentWindow?.postMessage({ giscus: config }, 'https://giscus.app');
  };

  sendMessage({
    setConfig: {
      theme: giscusThemes[theme]
    }
  });
};

const GiscusSection = () => {
  useEffect(() => {
    const theme: keyof typeof giscusThemes = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    const giscusAttributes = {
      src: 'https://giscus.app/client.js',
      'data-repo': 'sjuhan123/blog',
      'data-repo-id': 'R_kgDOLfNjIA',
      'data-category': 'General',
      'data-category-id': 'DIC_kwDOKUQR3M4CbE1x',
      'data-mapping': 'pathname',
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-lang': 'ko',
      'data-theme': giscusThemes[theme],
      crossorigin: 'anonymous',
      async: ''
    };

    const giscusScript = document.createElement('script');
    Object.entries(giscusAttributes).forEach(([key, value]) => giscusScript.setAttribute(key, value));
    document.querySelector('#giscus')?.appendChild(giscusScript);
  }, []);

  return <section style={{ minHeight: '372px' }} id="giscus"></section>;
};

export default GiscusSection;
