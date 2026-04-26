import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every page in the web build.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 
          Add a style tag to manually inject font-face for MaterialCommunityIcons on web.
          This ensures icons work even if the bundler's automatic injection fails on static hosting.
        */}
        <style dangerouslySetInnerHTML={{ __html: iconStyles }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

const iconStyles = `
@font-face {
  font-family: 'MaterialCommunityIcons';
  src: url('https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.2.96/fonts/materialdesignicons-webfont.woff2') format('woff2'),
       url('https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.2.96/fonts/materialdesignicons-webfont.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'MaterialIcons';
  src: url('https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
`;
