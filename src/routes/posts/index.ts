import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

type CreatePostDTO = Omit<PostEntity, 'id'>;
type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
      const posts = await fastify.db.posts.findMany();
      return reply.code(200).send(posts);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params as { id: string };
      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
      return post ? reply.code(200).send(post) : reply.code(404).send({ message: 'Post was not found' });
    });

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const body = request.body as CreatePostDTO;
      try {
        return await fastify.db.posts.create(body);
      } catch (error) {
        throw reply.code(400).send({ message: 'Post already exist' })
      }
    });

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params as { id: string };
      try {
        return await fastify.db.posts.delete(id);
      } catch (error) {
        throw reply.code(400).send({ message: 'Something was wrong' });
      }
    });

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params as { id: string };
      const body = request.body as ChangePostDTO;
      try {
        return await fastify.db.posts.change(id, body);
      } catch (error) {
        throw reply.code(400).send({ message: 'Something was wrong' });
      }
    });
};

export default plugin;
