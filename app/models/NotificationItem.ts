import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const NotificationItemModel = types
  .model("NotificationItem")
  .props({})
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface NotificationItem extends Instance<typeof NotificationItemModel> {}
export interface NotificationItemSnapshotOut extends SnapshotOut<typeof NotificationItemModel> {}
export interface NotificationItemSnapshotIn extends SnapshotIn<typeof NotificationItemModel> {}
export const createNotificationItemDefaultModel = () => types.optional(NotificationItemModel, {})
