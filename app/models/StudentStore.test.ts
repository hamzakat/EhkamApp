import { StudentStoreModel } from "./StudentStore"

test("can be created", () => {
  const instance = StudentStoreModel.create({})

  expect(instance).toBeTruthy()
})
