import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'TeamDocs',
  tagline: 'Проектная документация и учебный журнал',
  favicon: 'img/favicon.ico',
  future: {v4: true},
  url: 'https://maximuson.github.io',
  baseUrl: '/teamdocs/',
  organizationName: 'Maximuson',
  projectName: 'teamdocs',
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Maximuson/teamdocs/tree/master/documentation/',
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      title: 'TeamDocs',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'teamdocsSidebar',
          position: 'left',
          label: 'Документация',
        },
        {
          href: 'https://github.com/Maximuson/teamdocs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'TeamDocs',
          items: [
            {label: 'Начать здесь', to: '/docs/intro'},
            {label: 'Архитектура', to: '/docs/project/architecture'},
          ],
        },
        {
          title: 'Учёба',
          items: [
            {label: 'Учебный путь', to: '/docs/learning/path'},
            {label: 'Журнал обучения', to: '/docs/learning-log/'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} TeamDocs. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
