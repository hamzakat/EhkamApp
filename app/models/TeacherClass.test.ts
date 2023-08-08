import { TeacherClassModel } from "./TeacherClass"

test("can be created", () => {
  const instance = TeacherClassModel.create({})

  expect(instance).toBeTruthy()
})
