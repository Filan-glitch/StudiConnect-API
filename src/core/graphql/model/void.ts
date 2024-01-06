import { GraphQLScalarType } from "graphql";

/**
 * Represents the void type in GraphQL.
 */
export const Void = new GraphQLScalarType({
  name: "Void",

  description: "Represents NULL values",

  serialize() {
    return null;
  },

  parseValue() {
    return null;
  },

  parseLiteral() {
    return null;
  },
});
