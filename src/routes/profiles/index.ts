import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

type CreateProfileDTO = Omit<ProfileEntity, 'id'>;
type ChangeProfileDTO = Partial<Omit<ProfileEntity, 'id' | 'userId'>>;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    const profiles = await fastify.db.profiles.findMany();
    return reply.code(200).send(profiles);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params as { id: string };
      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: id,
      });
      return profile
        ? reply.code(200).send(profile)
        : reply.code(404).send({ message: 'Profile was not found' });
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const body = request.body as CreateProfileDTO;
      if (body.memberTypeId !== 'basic' && body.memberTypeId !== 'business') {
        reply.code(400).send({ message: 'Invalid member type' });
      }
      const userProfile = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: body.userId,
      });
      if (userProfile)
        throw reply.code(400).send({ message: "User's profile already exist" });
      try {
        return await fastify.db.profiles.create(body);
      } catch (error) {
        throw reply.code(400);
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params as { id: string };
      try {
        return await fastify.db.profiles.delete(id);
      } catch (error) {
        throw reply.code(400).send({ message: 'Something was wrong' });
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params as { id: string };
      const body = request.body as ChangeProfileDTO;
      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: id,
      });
      if (profile) {
        const updatedProfile = await fastify.db.profiles.change(id, body);
        return reply.code(200).send(updatedProfile);
      } else {
        throw reply.code(400).send({ messsage: 'Something was wrong' });
      }
    }
  );
};

export default plugin;
