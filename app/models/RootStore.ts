import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./AuthenticationStore"
import { CurrentUserStoreModel } from "./CurrentUser"
import { StudentStoreModel } from "./StudentStore"
import { SessionStoreModel } from "./SessionStore"
import { AttendanceStoreModel } from "./AttendanceStore"
/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  currentUserStore: types.optional(CurrentUserStoreModel, {} as any),
  studentStore: types.optional(StudentStoreModel, {} as any),
  sessionStore: types.optional(SessionStoreModel, {} as any),
  attendanceStore: types.optional(AttendanceStoreModel, {} as any),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
