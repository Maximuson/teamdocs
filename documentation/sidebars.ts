import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  teamdocsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Проект',
      items: ['project/overview', 'project/architecture', 'project/repository-structure'],
    },
    {
      type: 'category',
      label: 'Инженерия',
      items: [
        'engineering/local-development',
        'engineering/contracts-and-zod',
        'engineering/testing',
        'engineering/docker-compose',
      ],
    },
    {
      type: 'category',
      label: 'Учебный путь',
      items: [
        'learning/path',
        'learning/typescript',
        'learning/backend-and-databases',
        'learning/python-and-ai-services',
        'learning/applied-ml-and-rag',
        'learning/weekly-delivery',
      ],
    },
    {
      type: 'category',
      label: 'Решения',
      items: ['decisions/README', 'decisions/npm-workspaces', 'decisions/nestjs-esm'],
    },
    {
      type: 'category',
      label: 'Личный журнал',
      items: ['learning-log/README'],
    },
    'contributing/knowledge-workflow',
  ],
};

export default sidebars;
