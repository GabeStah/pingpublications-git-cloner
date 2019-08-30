export const config = {
  apollo: {
    headers: {
      authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
    },
    // fetch: fetch as any,
    uri: 'https://api.github.com/graphql'
  },
  repositories: [
    {
      owner: 'GabeStah',
      name: 'gremlin-chaos-monkey',
      service: 'GitHub',
      refName: 'master',
      client: {
        name: 'Gremlin',
        url: 'https://www.gremlin.com/',
        tagline: 'Chaos Engineering Tools to Break Things on Purpose'
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
    },
    {
      owner: 'GabeStah',
      name: 'Test.io',
      service: 'GitHub',
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
    }
  ]
};
