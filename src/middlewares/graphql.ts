import { ApolloServerPluginInlineTraceDisabled } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Express, Request } from 'express';

import 'reflect-metadata';
import baseContext from '../buildContext';
import { ResolverContext } from '../context';
import { Role } from '../models/Role';
import { User, UserWithRole } from '../models/User';
import federationSources from '../resolvers/federationSources';
import { registerEnums } from '../resolvers/registerEnums';
import { buildFederatedSchema } from '../utils/buildFederatedSchema';

interface Req extends Request {
  user?: {
    user?: User;
    currentRole?: Role;
    roles?: Role[];
    accessToken?: string;
  };
}

const apolloServer = async (app: Express) => {
  const PATH = '/graphql';

  registerEnums();

  const { orphanedTypes, referenceResolvers } = federationSources();

  const schema = await buildFederatedSchema(
    {
      resolvers: [
        __dirname + '/../resolvers/**/*Query.{ts,js}',
        __dirname + '/../resolvers/**/*Mutation.{ts,js}',
        __dirname + '/../resolvers/**/*Resolver.{ts,js}',
      ],
      orphanedTypes: [...orphanedTypes],
      validate: false,
    },
    {
      ...referenceResolvers,
    }
  );

  const server = new ApolloServer({
    schema,
    tracing: false,
    playground: {
      settings: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore-line igore until https://github.com/prisma-labs/graphql-playground/pull/1212 is merged
        'schema.polling.enable': false,
      },
    },
    plugins: [ApolloServerPluginInlineTraceDisabled()],

    context: async ({ req }: { req: Req }) => {
      let user = null;
      const userId = req.user?.user?.id as number;
      const accessToken = req.user?.accessToken;

      console.log(req.user);

      if (req.user) {
        if (accessToken) {
          // const accessRules = {
          //   ProposalQueries: {
          //     getAll: true,
          //     getAllView: true,
          //   },
          //   UserQueries: {
          //     getBasic: true,
          //   },
          // };
          const {
            accessPermissions,
          } = await baseContext.queries.admin.getPermissionsByToken(
            accessToken
          );

          console.log(accessPermissions);

          user = {
            accessPermissions,
            isApiAccessToken: true,
          } as UserWithRole;
        } else {
          user = {
            ...(await baseContext.queries.user.getAgent(userId)),
            currentRole:
              req.user.currentRole ||
              (req.user.roles ? req.user.roles[0] : null),
            isApiAccessToken: false,
          } as UserWithRole;
        }
      }

      const context: ResolverContext = { ...baseContext, user };

      return context;
    },
  });
  server.applyMiddleware({ app: app, path: PATH });
};

export default apolloServer;
