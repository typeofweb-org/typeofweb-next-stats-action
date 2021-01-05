import { getNextPagesSize } from './next-size-generator';
import 'jest-extended';

describe('getNextPagesSize', () => {
  it('should work', () => {
    const consoleOutput = `
    Page                                                            Size     First Load JS
    ┌   /_app                                                       0 B             105 kB
    ├ λ /_err                                                       1.79 kB         107 kB
    ├ ● /[displayStyle]                                             2.53 kB         147 kB
    ├   ├ /grid
    ├   └ /list
    ├ ● /[displayStyle]/[cursor]                                    2.51 kB         147 kB
    ├   ├ /grid/xlaydiPAk6Ed3Kfkq96qeOp5hPc3yQ0QlwVL%2F9ZyjBo%3D
    ├   ├ /grid/RKPcckbiPMH2F72nit2U6Syg996wfWht96e7yXFsaSc%3D
    ├   ├ /grid/AsBI640yhccb%2FqOlAVZOWQNX3h3p%2FklVnHkmEQtnaPg%3D
    ├   └ [+7 more paths]
    ├ ○ /404                                                        3.82 kB         109 kB
    ├ ○ /admin                                                      2.81 kB         111 kB
    ├   └ css/0b06d3dc729f6afe3013.css                              2.61 kB
    ├ λ /api                                                        0 B             105 kB
    ├ λ /api/auth/[...nextauth]                                     0 B             105 kB
    ├ λ /api/blogs                                                  0 B             105 kB
    ├ λ /api/blogs/[blogId]                                         0 B             105 kB
    ├ λ /api/content-creator                                        0 B             105 kB
    ├ λ /api/feed                                                   0 B             105 kB
    ├ λ /api/update-blogs                                           0 B             105 kB
    ├ λ /api/update-feed                                            0 B             105 kB
    ├ ● /artykuly/[slug]                                            1.15 kB         145 kB
    ├   └ css/d8b374e26cdf201c0bbe.css                              3.05 kB
    ├   ├ /artykuly/parcel-bundler-czyli-webpack-bez-konfiguracji
    ├   ├ /artykuly/5-bibliotek-js'a-ktore-zawladna-rynkiem-w-2021
    ├   ├ /artykuly/5-najlepszych-ksiazek-2020
    ├   └ [+27 more paths]
    ├ ○ /o-serwisie                                                 2.26 kB         111 kB
    ├   └ css/5c4ba465e3ea75287602.css                              2.96 kB
    └ ○ /zglos-serwis                                               4.66 kB         113 kB
        └ css/7bb9b00fd266464361e6.css                              3.18 kB
    + First Load JS shared by all                                   105 kB
      ├ chunks/8c43c7dba21b70476fcfc932bb90be731e9df189.f9f6ba.js   13.8 kB
      ├ chunks/8d2a18b53678a0436e3e4bc986ccc9734d9e4be5.dfdb83.js   24 kB
      ├ chunks/a9f427f82024d0e57d1fcf0eee6531ceed07b6c4.30b228.js   14 kB
      ├ chunks/f00a516035ddd5a7692aff084b0e21e2ba566403.e2c5f9.js   3.3 kB
      ├ chunks/framework.c4c935.js                                  42 kB
      ├ chunks/main.b755b8.js                                       6.3 kB
      ├ chunks/pages/_app.1631bc.js                                 231 B
      ├ chunks/webpack.848c30.js                                    1.56 kB
      └ css/ec77e3ea886b8ea8cf98.css                                2 kB
    
    λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)
    ○  (Static)  automatically rendered as static HTML (uses no initial props)
    ●  (SSG)     automatically generated as static HTML + JSON (uses getStaticProps)
       (ISR)     incremental static regeneration (uses revalidate in getStaticProps)
    
    ✨  Done in 27.57s.
    `.trim();

    const result = getNextPagesSize(consoleOutput);

    const expectedKeys = [
      '/_err',
      '/[displayStyle]',
      '/[displayStyle]/[cursor]',
      '/404',
      '/admin',
      '/artykuly/[slug]',
      '/o-serwisie',
      '/zglos-serwis',
      'shared:chunk/framework',
      'shared:chunk/main',
      'shared:_app.js',
      'shared:chunk/webpack',
      'shared:js',
      'shared:css',
    ];
    console.log(result);

    expect(result).toContainKeys(expectedKeys);
    expect(result).toMatchSnapshot();
  });
});
