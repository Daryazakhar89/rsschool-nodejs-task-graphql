
import { buildSchema } from "graphql";

export const graphQlSchema = buildSchema(`
  type User {
    id: ID
    firstName: String
    lastName: String
    email: String
    subscribedToUserIds: [String]
  }

  type Profile {
    id: ID
    avatar: String
    sex: String
    birthday: Int
    country: String
    street: String
    city: String
    memberTypeId: String
    userId: String
  }

  type Post {
    id: ID
    title: String
    content: String
    userId: String
  }

  type MemberType {
    id: ID
    discount: Int
    monthPostsLimit: Int
  }

  type UserWithAllData {
    id: ID
    firstName: String
    lastName: String
    email: String
    subscribedToUserIds: [String]
    posts: [Post]
    profiles: [Profile]
    memberTypes: [MemberType]
  }

  type UserWithProfile {
    id: ID
    firstName: String
    lastName: String
    email: String
    profile: [Profile]
    subscribedToUserIds: [String]
    userSubscribedTo: [Profile]
  }

  type UserWithPosts {
    id: ID
    firstName: String
    lastName: String
    email: String
    posts: [Post]
    subscribedToUserIds: [String]
    subscribedToUser: [Post]
  }

  type UserWithFollowersWhomHeIsFollowing {
    id: ID
    firstName: String
    lastName: String
    email: String
    subscribedToUserIds: [String]
    subscribedToUser: [User]
    userSubscribedTo: [User]
  }
  type UserWithFollowersWhoFollowHim {
    id: ID
    firstName: String
    lastName: String
    email: String
    subscribedToUserIds: [String]
    subscribedToUser: [UserWithFollowersWhomHeIsFollowing]
    userSubscribedTo: [UserWithFollowersWhomHeIsFollowing]
  }

  type Query {
    getAllUsers: [User]
    getAllProfiles: [Profile]
    getAllPosts: [Post]
    getAllMemberTypes: [MemberType]
    getUserById(id: ID): User
    getProfileById(id: ID): Profile
    getPostById(id: ID): Post
    geMemberTypeById(id: ID): MemberType
    getUsersWithAllData: [UserWithAllData]
    getAllUserWithAllDataById(id: ID): UserWithAllData
    getUserWithProfile: [UserWithProfile]
    getUserWithPosts(id: ID): [UserWithPosts]
    getUsersWithAllFollowers: [UserWithFollowersWhoFollowHim]
  }

  input CreateUser {
    firstName: String!
    lastName: String!
    email: String!
  }

  input CreateProfile {
    avatar: String
    sex: String
    birthday: Int
    country: String
    street: String
    city: String
    memberTypeId: String
    userId: String
  }

  input CreatePost {
    title: String
    content: String
    userId: String
  }

  input UpdateUser {
    firstName: String
    lastName: String
    email: String
    subscribedToUserIds: [String]
  }

  input UpdateProfile {
    avatar: String
    sex: String
    birthday: Int
    country: String
    street: String
    city: String
    memberTypeId: String
    userId: String
  }

  input UpdatePost {
    title: String
    content: String
    userId: String
  }

  input UpdateMemberType {
    discount: Int
    monthPostsLimit: Int
  }

  type Mutation {
    createUser(user: CreateUser): User
    createProfile(profile: CreateProfile): Profile
    createPost(post: CreatePost): Post
    updateUser(id: String, update: UpdateUser): User
    updateProfile(id: String, update: UpdateProfile): Profile
    updatePost(id: String, update: UpdatePost): Post
    updateMemberType(id: String, update: UpdateMemberType): MemberType
    subscribeTo(userID: String, subscriberID: String): User
    unsubscribeFrom(userID: String, subscriberID: String): User
  }
`)