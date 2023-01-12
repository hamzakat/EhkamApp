import { SessionModel } from "./Session"

test("can be created", () => {
  const instance = SessionModel.create({})

  expect(instance).toBeTruthy()
})
