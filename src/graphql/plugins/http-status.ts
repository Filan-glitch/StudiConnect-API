import { ApolloServerPlugin } from "@apollo/server";

/**
 * Apollo plugin, which turns apollo error codes into HTTP status codes.
 * If the code is already a number, it will be used as status code.
 *
 * **400**
 * - GRAPHQL_PARSE_FAILED
 * - GRAPHQL_VALIDATION_FAILED
 * - INVALID @see ValidationError
 *
 * **401**
 * - UNAUTHENTICATED @see AuthenticationError
 *
 * **403**
 * - FORBIDDEN
 *
 * **404**
 * - NOT_FOUND @see NotFoundError
 *
 * **409**
 * - DUPLICATE @see DuplicateError
 *
 * **410**
 * - PERSISTED_QUERY_NOT_FOUND
 *
 * **422**
 * - PERSISTED_QUERY_NOT_SUPPORTED
 * - BAD_USER_INPUT
 *
 * **500**
 * - BAD_USER_INPUT
 */
const HttpStatusPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async willSendResponse({ response }: any): Promise<void> {
        const errCode =
          response?.body?.singleResult.errors?.[0]?.extensions?.code;

        if (!errCode) return; // no error to handle

        let statusCode;
        switch (errCode) {
          case "GRAPHQL_PARSE_FAILED":
          case "GRAPHQL_VALIDATION_FAILED":
          case "INVALID":
            statusCode = 400;
            break;

          case "UNAUTHENTICATED":
            statusCode = 401;
            break;

          case "FORBIDDEN":
            statusCode = 403;
            break;

          case "NOT_FOUND":
            statusCode = 404;
            break;

          case "DUPLICATE":
            statusCode = 409; // CONFLICT
            break;

          case "PERSISTED_QUERY_NOT_FOUND":
            statusCode = 410;
            break;

          case "PERSISTED_QUERY_NOT_SUPPORTED":
          case "BAD_USER_INPUT":
            statusCode = 422;
            break;

          default:
            statusCode = Number.isNaN(parseInt(errCode))
              ? 500
              : parseInt(errCode);
        }
        response.http.status = statusCode;
      },
    };
  },
};

export default HttpStatusPlugin;
