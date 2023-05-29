import { FastifyInstance } from 'fastify';

import { UserEntity } from '../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type CreateProfileDTO = Omit<ProfileEntity, 'id'>;
type CreatePostDTO = Omit<PostEntity, 'id'>;

type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;
type ChangeProfileDTO = Partial<Omit<ProfileEntity, 'id' | 'userId'>>;
type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;
type ChangeMemberTypeDTO = Partial<Omit<MemberTypeEntity, 'id'>>;

export class Resolver {
  fastify: FastifyInstance;
  resolvers: any;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;

    this.resolvers = {
      getAllUsers: () => this.fastify.db.users.findMany(),

      getAllProfiles: () => this.fastify.db.profiles.findMany(),

      getAllPosts: () => this.fastify.db.posts.findMany(),

      getAllMemberTypes: () => this.fastify.db.memberTypes.findMany(),

      getUserById: ({ id }: { id: string }) =>
        this.fastify.db.users.findOne({ key: 'id', equals: id }),

      getProfileById: ({ id }: { id: string }) =>
        this.fastify.db.profiles.findOne({ key: 'id', equals: id }),

      getPostById: ({ id }: { id: string }) =>
        this.fastify.db.posts.findOne({ key: 'id', equals: id }),

      geMemberTypeById: ({ id }: { id: string }) =>
        this.fastify.db.memberTypes.findOne({ key: 'id', equals: id }),

      createUser: ({ user: data }: { user: CreateUserDTO }) =>
        this.fastify.db.users.create(data),

      createProfile: ({ profile: data }: { profile: CreateProfileDTO }) =>
        this.fastify.db.profiles.create(data),

      createPost: ({ post: data }: { post: CreatePostDTO }) =>
        this.fastify.db.posts.create(data),

      updateUser: ({ id, update: data } : {id: string, update: ChangeUserDTO }) =>
        this.fastify.db.users.change(id, data),

      updateProfile: ({ id, update: data } : {id: string, update: ChangeProfileDTO }) =>
        this.fastify.db.profiles.change(id, data),

      updatePost: ({ id, update: data } : {id: string, update: ChangePostDTO }) =>
        this.fastify.db.posts.change(id, data),

      updateMemberType: ({ id, update: data } : {id: string, update: ChangeMemberTypeDTO }) =>
        this.fastify.db.memberTypes.change(id, data),

      getUsersWithAllData: async () => {
        const users = await this.resolvers.getAllUsers();

        return await users.map(async (user: UserEntity) => {
          return await this.getAllUserDataById(user);
        });
      },

      getAllUserWithAllDataById: async (id: string) => {
        const user = await this.resolvers.getUserById(id);
        let userCompleteData = {};

        if (user) {
          userCompleteData = await this.getAllUserDataById(user);
        }

        return userCompleteData;
      },
    };
  }

  async getAllUserDataById(user: UserEntity) {
    const userPosts = await this.fastify.db.posts.findMany({
      key: 'userId',
      equals: user.id,
    });
    const userProfiles = await this.fastify.db.profiles.findMany({
      key: 'userId',
      equals: user.id,
    });
    const profileMemberTypes = userProfiles.map(
      (profile) => profile.memberTypeId
    );

    return {
      ...user,
      posts: userPosts,
      profiles: userProfiles,
      memberTypes: profileMemberTypes,
    };
  }

  getResolvers() {
    return this.resolvers;
  }
}
