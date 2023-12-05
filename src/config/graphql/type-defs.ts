import gql from "graphql-tag";

const typeDefs = gql`
  scalar Void

  type Query {
    user(id: ID!): User!
    group(id: ID!): Group!
  }

  type Mutation {
    login(token: String!): Session!
    logout: Void

    updateSettings(darkThemeEnabled: Boolean): User!
    updateProfile(
      username: String!
      publicVisible: Boolean!
      university: String!
      major: String!
      location: String!
      bio: String!
      mobile: String!
      discord: String!
    ): User!
    resetPassword: Void
    deleteAccount: Void

    createGroup(title: String!, module: String!, location: String!): Group!
    updateGroup(
      id: ID!
      title: String!
      location: String!
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
    publicVisible: Boolean!
    darkThemeEnabled: Boolean!
    university: String!
    major: String!
    location: String!
    bio: String!
    mobile: String!
    discord: String!
  }

  type Group {
    id: ID!
    title: String!
    module: String!
    creator: User!
    members: [User!]!
    joinRequests: [User!]!
    createdAt: String!
    location: String!
  }
`;

export default typeDefs;
