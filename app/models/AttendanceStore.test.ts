import { AttendanceStoreModel } from "./AttendanceStore"

test("can be created", () => {
  const instance = AttendanceStoreModel.create({})

  expect(instance).toBeTruthy()
})
