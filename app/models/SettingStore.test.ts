import { SettingStoreModel } from "./SettingStore"

test("can be created", () => {
  const instance = SettingStoreModel.create({})

  expect(instance).toBeTruthy()
})
