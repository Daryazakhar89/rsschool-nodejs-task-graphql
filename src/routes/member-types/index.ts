import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

type ChangeMemberTypeDTO = Partial<Omit<MemberTypeEntity, 'id'>>;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<MemberTypeEntity[]> {
    const memberTypes = await fastify.db.memberTypes.findMany();
    return reply.code(200).send(memberTypes);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const { id } = request.params as { id: string };
      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });
      if (memberType) {
        return reply.code(200).send(memberType);
      } else {
        return reply.code(404).send({ message: 'Member type was not found' });
      }
    });

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const { id } = request.params as { id: string };
			const body = request.body as ChangeMemberTypeDTO;
      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });
      if (memberType) {
        const changedMemberType = await fastify.db.memberTypes.change(id, body);
        return reply.code(200).send(changedMemberType);
      } else {
        return reply.code(400).send({ message: 'Invalid member type' });
      }
  });
};

export default plugin;
