import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../utils/DB/entities/DBPosts';

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();
    return reply.code(200).send(users);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params as { id: string };
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      return user
        ? reply.code(200).send(user)
        : reply.code(404).send({ message: 'User was not found' });
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {
      const { firstName, lastName, email } = request.body as CreateUserDTO;
      const existentUser = await fastify.db.users.findOne({
        key: 'email',
        equals: email,
      });
      if (!existentUser) {
        const user = await fastify.db.users.create({
          firstName,
          lastName,
          email,
        });
        return reply.code(200).send(user);
      } else {
        throw reply.code(400).send({ message: 'User already exists' });
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
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params as { id: string };

      const users = await fastify.db.users.findMany({
        key: 'subscribedToUserIds',
        inArray: id,
      });

      const userPosts = (await fastify.db.posts.findMany({
        key: 'userId',
        equals: id,
      })) as PostEntity[];

      const userProfile = (await fastify.db.profiles.findOne({
        key: 'userId',
        equals: id,
      })) as ProfileEntity;

      try {
        const deletedUser = await fastify.db.users.delete(id);
        users.forEach(async (user) => {
          await fastify.db.users.change(user.id, {
            subscribedToUserIds: [
              ...user.subscribedToUserIds.filter((element) => element !== id),
            ],
          });
        });

        userPosts.forEach(async (post) => {
          await fastify.db.posts.delete(post.id);
        });

        await fastify.db.profiles.delete(userProfile.id);

        return deletedUser;
      } catch (error) {
        throw reply.code(400).send({ message: 'Something was wrong' });
      }
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params as { id: string };
      const { userId } = request.body as { userId: string };
      const subscribedUser = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!user) return reply.code(404).send({ message: 'User was not found' });

      if (subscribedUser?.subscribedToUserIds.indexOf(id) === -1) {
        subscribedUser?.subscribedToUserIds.push(id);
      } else {
        return reply.code(400).send({ message: 'User already subscribed' });
      }

      fastify.db.users.change(userId, {
        subscribedToUserIds: subscribedUser?.subscribedToUserIds,
      });

      return user as UserEntity;
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params as { id: string };
      const { userId } = request.body as { userId: string };

      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      let subscribedToUserIds: string[];

      if (user?.subscribedToUserIds.indexOf(id) !== -1) {
        subscribedToUserIds = user?.subscribedToUserIds.filter(
          (userId) => userId !== id
        ) as string[];
      } else {
        return reply.code(400).send({ message: 'User was not subscribed' });
      }

      await fastify.db.users.change(userId, {
        subscribedToUserIds: subscribedToUserIds,
      });

      return reply.code(200).send({ message: 'User was unsubscribed' });
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params as { id: string };
      const body = request.body as ChangeUserDTO;
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      if (user) {
        return await fastify.db.users.change(id, body);
      } else {
        throw reply.code(400).send({ message: 'Something was wrong' });
      }
    }
  );
};

export default plugin;
