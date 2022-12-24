import { StudentModel } from "./Student"

test("can be created", () => {
  const instance = StudentModel.create({})

  expect(instance).toBeTruthy()
})
