import { giscusThemes } from '../constants/giscus';

export const changeGiscusTheme = (theme: keyof typeof giscusThemes) => {
  const sendMessage = (config: unknown) => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe.giscus-frame',
    );

    iframe?.contentWindow?.postMessage(
      { giscus: config },
      'https://giscus.app',
    );
  };

  sendMessage({
    setConfig: {
      theme: giscusThemes[theme],
    },
  });
};
