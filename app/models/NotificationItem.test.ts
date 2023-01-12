import { NotificationItemModel } from "./NotificationItem"

test("can be created", () => {
  const instance = NotificationItemModel.create({})

  expect(instance).toBeTruthy()
})
