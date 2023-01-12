import { SessionNoteModel } from "./SessionNote"

test("can be created", () => {
  const instance = SessionNoteModel.create({})

  expect(instance).toBeTruthy()
})
