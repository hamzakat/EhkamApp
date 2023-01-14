import { AttendanceItemModel } from "./AttendanceItem"

test("can be created", () => {
  const instance = AttendanceItemModel.create({})

  expect(instance).toBeTruthy()
})
