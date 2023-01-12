import { SessionStoreModel } from "./SessionStore"

test("can be created", () => {
  const instance = SessionStoreModel.create({})

  expect(instance).toBeTruthy()
})
