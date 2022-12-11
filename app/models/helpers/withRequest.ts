import { getRoot } from "mobx-state-tree"

/**
 * Extension for extending models deeper down the tree
 * with an authenticated axios instance.
 */
export const withRequest = (self) => ({
  views: {
    get request() {
      const rootStore = getRoot(self)
      // @ts-ignore
      if (!rootStore.authenticationStore) {
        throw new Error("The model needs to be part of the RootStore tree!")
      }
      // @ts-ignore
      return rootStore.authenticationStore.authRequest
    },
  },
})
