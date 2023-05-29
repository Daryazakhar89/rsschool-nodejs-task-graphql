import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql';
import { graphqlBodySchema } from './schema';
import { Resolver } from './resolvers';
import { graphQlSchema } from './graphqlSchema';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  const resolver = new Resolver(fastify);

  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema
      },
    },
    function (request, reply) {
      graphql({
        schema: graphQlSchema,
        source: request.body.query as string,
        rootValue: resolver.getResolvers(),
        variableValues: request.body.variables
      }).then(response => {
        reply.send(response);
      })
    }
  );
};

export default plugin;
