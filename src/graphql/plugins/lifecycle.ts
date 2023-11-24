import { ApolloServerPlugin } from "@apollo/server";

const LifecyclePlugin: ApolloServerPlugin = {
  async serverWillStart() {
    console.log("> GraphQL API starting");

    return {
      async serverWillStop() {
        console.log("> GraphQL API shutdown");
      },
    };
  },
  async startupDidFail({ error }) {
    console.log(`Apollo startup failed: ${error}`);
  },
};

export default LifecyclePlugin;
