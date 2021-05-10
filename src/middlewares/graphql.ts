import { ApolloServerPluginInlineTraceDisabled } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Express, Request } from 'express';
import { applyMiddleware } from 'graphql-middleware';

import 'reflect-metadata';
import baseContext from '../buildContext';
import { ResolverContext } from '../context';
import { Role } from '../models/Role';
import { User, UserWithRole } from '../models/User';
import federationSources from '../resolvers/federationSources';
import { registerEnums } from '../resolvers/registerEnums';
import { buildFederatedSchema } from '../utils/buildFederatedSchema';
import rejectionLogger from './rejectionLogger';

interface Req extends Request {
  user?: {
    user?: User;
    currentRole?: Role;
    roles?: Role[];
    accessTokenId?: string;
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

  const schemaWithMiddleware = applyMiddleware(schema, rejectionLogger);

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    tracing: false,
    playground: {
      settings: {
        'schema.polling.enable': false,
      },
    },
    plugins: [ApolloServerPluginInlineTraceDisabled()],

    context: async ({ req }: { req: Req }) => {
      let user = null;
      const userId = req.user?.user?.id as number;
      const accessTokenId = req.user?.accessTokenId;

      if (req.user) {
        if (accessTokenId) {
          const {
            accessPermissions,
          } = await baseContext.queries.admin.getPermissionsByToken(
            accessTokenId
          );

          user = {
            accessPermissions: accessPermissions
              ? JSON.parse(accessPermissions)
              : null,
            isApiAccessToken: true,
          } as UserWithRole;
        } else {
          user = {
            ...(await baseContext.queries.user.getAgent(userId)),
            currentRole:
              req.user.currentRole ||
              (req.user.roles ? req.user.roles[0] : null),
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
