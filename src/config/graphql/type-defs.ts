import gql from "graphql-tag";

const typeDefs = gql`
  scalar Void

  type Query {
    user(id: ID!): User!
    group(id: ID!): Group!
    searchGroups(module: String!, radius: Int!): [Group!]!
    messages(group: ID!, page: Int!): [Message!]!
  }

  type Mutation {
    login(token: String!): Session!
    loginAsGuest: Session!
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
    addMember(id: ID!, user: ID!): Void
    removeMember(id: ID!, user: ID!): Void
    removeJoinRequest(id: ID!, user: ID!): Void

    sendMessage(content: String!, group: ID!): Message!
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
    groups: [Group!]!
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
    imageExists: Boolean!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    group: Group!
    sendAt: String!
  }
`;

export default typeDefs;
