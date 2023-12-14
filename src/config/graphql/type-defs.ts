import gql from "graphql-tag";

const typeDefs = gql`
  scalar Void

  type Query {
    user(id: ID!): User!
    group(id: ID!): Group!
    searchGroups(module: String!, radius: Int!): [Group!]!
  }

  type Mutation {
    login(token: String!): Session!
    logout: Void

    updateProfile(
      username: String!
      university: String!
      major: String!
      lat: Float!
      lon: Float!
      bio: String!
      mobile: String!
      discord: String!
    ): User!
    resetPassword: Void
    deleteAccount: Void

    createGroup(
      title: String!
      description: String!
      module: String!
      lat: Float!
      lon: Float!
    ): Group!
    updateGroup(
      id: ID!
      title: String!
      description: String!
      lat: Float!
      lon: Float!
      module: String!
    ): Group!
    deleteGroup(id: ID!): Void
    joinGroup(id: ID!): Void
    addMember(id: ID!, user: ID!): Group!
    removeMember(id: ID!, user: ID!): Group
  }

  type Session {
    sessionID: String!
    user: String!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    verified: Boolean!
    university: String!
    major: String!
    lat: Float!
    lon: Float!
    bio: String!
    mobile: String!
    discord: String!
  }

  type Group {
    id: ID!
    title: String!
    description: String!
    module: String!
    creator: User!
    members: [User!]!
    joinRequests: [User!]!
    createdAt: String!
    lat: Float!
    lon: Float!
  }
`;

export default typeDefs;
