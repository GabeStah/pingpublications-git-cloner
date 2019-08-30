// See: https://github.com/webpack/webpack/blob/master/lib/WebpackOptionsApply.js#L231
// const hidden = options.devtool.includes("hidden");
// const inline = options.devtool.includes("inline");

// See: https://github.com/webpack/webpack/blob/master/lib/WebpackOptionsApply.js#L366
// See: https://github.com/webpack/webpack/blob/master/lib/NoEmitOnErrorsPlugin.js
// if (options.optimization.noEmitOnErrors) {
//   const NoEmitOnErrorsPlugin = require("./NoEmitOnErrorsPlugin");
//   new NoEmitOnErrorsPlugin().apply(compiler);
// }

import { Repository } from './Repository';
import { Options } from './Options';
import ApolloClient, { gql } from 'apollo-boost';
import Git from 'nodegit';
// import { config } from '../index';

import path from 'path';

export class Parser {
  public static async parse(): Promise<Options | Error> {
    const options = new Options();
    const config = require(path.resolve(__dirname, 'git-cloner.config.js'));

    if (!config) {
      return new Error('git-cloner.config.js configuration file not found!');
    }

    try {
      const client = new ApolloClient(config.apollo);

      // Check for repositories
      if (config.repositories) {
        options.repositories = config.repositories.map(
          (repository: any) => new Repository(repository)
        );
      }

      console.log(options.repositories);
      // let repo: Repository;
      for (const repo of options.repositories) {
        const query = gql`
          query repositoryHashes(
            $owner: String!
            $name: String!
            $num: Int = 5
            $refName: String = "master"
          ) {
            repository(name: $name, owner: $owner) {
              ref(qualifiedName: $refName) {
                target {
                  ... on Commit {
                    id
                    history(first: $num) {
                      pageInfo {
                        hasNextPage
                      }
                      edges {
                        node {
                          hash: oid
                          messageHeadline
                          message
                          tarballUrl
                          committedDate
                          author {
                            name
                            email
                            date
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const result = await client.query({
          query,
          variables: {
            name: repo.name,
            owner: repo.owner,
            refName: repo.refName,
            num: 5
          }
        });

        const nodes = result.data.repository.ref.target.history.edges.map(
          ({ node }: any) => {
            return node;
          }
        );

        console.log(nodes);

        // TODO: Create or upsert MongoDB records from Commit/Repository resolvers.
        // TESTING NEW STUFF

        const hashes = result.data.repository.ref.target.history.edges.map(
          ({ node }: any) => {
            return node.hash;
          }
        );

        // const commitsCreate = result.data.repository.ref.target.history.edges.map(
        //   ({ node }: any) => {
        //     return {
        //       hash: node.hash,
        //       committedDate: node.committedDate,
        //       message: node.message,
        //       messageHeadline: node.messageHeadline,
        //       repository: {
        //         create: {
        //           email: node.repository.email,
        //           name: node.author.name,
        //           // TODO: Fix proper handle
        //           handle: node.author.name
        //         }
        //       }
        //     };
        //   }
        // );
        //
        // console.log(commitsCreate);
        //
        //   const commitsUpsert: CommitUpsertWithWhereUniqueNestedInput = result.data.repository.ref.target.history.edges.map(
        //     ({ node }: any) => {
        //       const authorUpsert: UserUpsertWithWhereUniqueNestedInput = {
        //         where: { email: node.author.email },
        //         create: {
        //           email: node.repository.email,
        //           name: node.repository.name,
        //           // TODO: Fix proper handle
        //           handle: node.repository.name
        //         },
        //         update: {
        //           email: node.author.email,
        //           name: node.repository.name,
        //           // TODO: Fix proper handle
        //           handle: node.author.name
        //         }
        //       };
        //       return {
        //         where: {
        //           hash: node.hash,
        //           committedDate: node.committedDate,
        //           message: node.message,
        //           messageHeadline: node.messageHeadline,
        //           repository: {
        //             userUpsert: authorUpsert
        //           }
        //         }
        //       };
        //     }
        //   );
        //
        //   const output = await prisma.upsertRepository({
        //     where: { id: '123123' },
        //     create: {
        //       name: repo.name,
        //       owner: { create: { handle: repo.owner } },
        //       service: 'GitHub',
        //       commits: commitsCreate
        //     },
        //     update: {
        //       name: repo.name,
        //       owner: { create: { handle: repo.owner } },
        //       service: 'GitHub',
        //       commits: {
        //         upsert: commitsUpsert
        //       }
        //     }
        //   });
        //
        //   console.log(output);
        //
        //   // const { repository } = await graphql(
        //   //   `
        //   //     query repositoryHashes(
        //   //       $owner: String!
        //   //       $name: String!
        //   //       $num: Int = 5
        //   //       $refName: String = "master"
        //   //     ) {
        //   //       repository(name: $name, owner: $owner) {
        //   //         ref(qualifiedName: $refName) {
        //   //           target {
        //   //             ... on Commit {
        //   //               id
        //   //               history(first: $num) {
        //   //                 pageInfo {
        //   //                   hasNextPage
        //   //                 }
        //   //                 edges {
        //   //                   node {
        //   //                     hash: oid
        //   //                     messageHeadline
        //   //                     message
        //   //                     tarballUrl
        //   //                     author {
        //   //                       name
        //   //                       email
        //   //                       date
        //   //                     }
        //   //                   }
        //   //                 }
        //   //               }
        //   //             }
        //   //           }
        //   //         }
        //   //       }
        //   //     }
        //   //   `,
        //   //   {
        //   //     name: repo.name,
        //   //     owner: repo.owner,
        //   //     refName: repo.refName,
        //   //     num: 5
        //   //   }
        //   // );
        //
        //   console.log(`--- REPOSITORY FROM API ---`);
        //   console.log(result);
        // }
        //
        // Iterate through repositories
        if (config.repositories) {
          // TODO: Query repos from GraphQL prior to local scans
          // See: https://github.com/octokit/graphql.js/tree/master

          for (const repoObject of config.repositories) {
            let url: string;
            let path: string;
            switch (repoObject.service) {
              case 'GitHub': {
                url = `https://github.com/${repoObject.owner}/${repoObject.name}`;
                path = `./.repos/${repoObject.owner}/${repoObject.name}`;
                break;
              }
              default: {
                url = `https://github.com/${repoObject.owner}/${repoObject.name}`;
                path = `./.repos/${repoObject.owner}/${repoObject.name}`;
              }
            }

            /**
             * ??? Start by performing API call with hash of all valid repos?
             *
             * 1. Check if local repo exists.
             * 2. If exists, get hash of most recent commit.
             *   - Compare hash
             */

            let repository: Git.Repository | void = await Git.Repository.open(
              path
            ).catch(error => {
              if (error.errno !== -3) {
                throw error;
              }
            });
            // Check if local exists.
            if (!repository) {
              const cloneOptions = {
                fetchOpts: {
                  callbacks: {
                    certificateCheck: () => {
                      return 1;
                    },
                    credentials: () => {
                      return Git.Cred.userpassPlaintextNew(
                        process.env.GITHUB_ACCESS_TOKEN || '',
                        'x-oauth-basic'
                      );
                    }
                  }
                }
              };

              repository = await Git.Clone.clone(url, path, cloneOptions);
            } else {
              // TODO: Fetch vs pull
              // await repository.fetch();
            }
            const commit: Git.Commit = await repository.getMasterCommit();
            console.log(commit.date(), commit.toString(), commit.message());
          }
        }
      }
    } catch (error) {
      console.log(error);
    }

    return options;
  }
}
