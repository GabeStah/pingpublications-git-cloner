import { RepositoryServiceType } from '../enums';

// TODO: Prototype Github GraphQL v4 API
// See: https://developer.github.com/v4/explorer/
// See: https://developer.github.com/v4/
// See: https://developer.github.com/v4/guides/

export const config = {
  owner: 'GabeStah',
  name: 'Test.io',
  service: RepositoryServiceType.GitHub,
  refName: 'master',
  client: {
    name: 'Test.io',
    url: 'https://test.io/',
    tagline: 'Fast QA Testing as a Service.'
  },
  projects: [
    {
      path:
        'DevOps/DevOps%20Best%20Practices%20-%20Integrating%20QA%20and%20DevOps',
      // TODO: Glob support
      // See: https://github.com/isaacs/node-glob
      writ: '*.md',
      options: {
        hasSources: true
      }
    },
    {
      path:
        'Automated%20Testing/Types%20of%20Automation%20Testing%20-%20Landscape',
      writ: ['*.md'],
      options: {
        hasSources: true
      }
    }
  ]
};
