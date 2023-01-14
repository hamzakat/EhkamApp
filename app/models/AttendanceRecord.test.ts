import { AttendanceRecordModel } from "./AttendanceRecord"

test("can be created", () => {
  const instance = AttendanceRecordModel.create({})

  expect(instance).toBeTruthy()
})
