import { ApiResponse } from "apisauce"
import {
  flow,
  Instance,
  SnapshotIn,
  SnapshotOut,
  types,
  getRoot,
  clone,
  getSnapshot,
} from "mobx-state-tree"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Session, SessionModel, SessionSnapshotOut } from "./Session"
import { SessionNoteModel } from "./SessionNote"
import { StudentModel } from "./Student"

const SessionQueueItemModel = types.model({
  session: SessionModel,
  problem: types.frozen(),
})

const NoteQueueItemModel = types.model({
  Note: SessionNoteModel,
  problem: types.frozen(),
})

export interface SessionQueueItem extends Instance<typeof SessionQueueItemModel> {}

export const SessionStoreModel = types
  .model("SessionStore")
  .extend(withRequest)
  .props({
    sessions: types.optional(types.array(SessionModel), []),
    sessionOfflineQueue: types.optional(types.array(SessionQueueItemModel), []),
    currentSessionNotes: types.optional(types.array(SessionNoteModel), []),
    noteOfflineQueue: types.optional(types.array(NoteQueueItemModel), []),
    selectedStudent: types.maybe(StudentModel),
    selectedSessionType: types.optional(types.enumeration(["new", "repeat", "exam"]), "new"),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    // unnecessary, because it is able to send them along with the session instance through `sendSession`
    const sendNotes = flow(function* (session: Session) {
      // send (batch data in a JSON array) POST request to /session_note
      // if req.ok:
      //   get the server record's id (req.data.data.id)
      //   set session.notes[_id==req._id].id to req.id
      //   add session to sessionStore.sessions
      // else:
      //   add note to sessionStore.notesOfflineQueue
      const req: ApiResponse<any> = yield self.request({
        method: "POST",
        url: `/items/session_note`,
        data: session.notes.toJSON(),
      })

      if (!req.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(req)
        if (problem) {
          __DEV__ && console.tron.error(`Bad data: ${problem}\n${req.data}`, problem)
          __DEV__ && console.log("Problem from SessionModel.sendNotes():", problem, req)

          // if network is offline -> add to queue
          self.noteOfflineQueue.push(NoteQueueItemModel.create({ ...session.notes, problem }))
        }
      } else {
        const updatedNotes = req.data.data

        const index = self.sessions.findIndex((stored) => {
          return stored._id === session._id
        })

        self.sessions[index].setProp("notes", updatedNotes)
      }
    })
    return { sendNotes }
  })
  .actions((self) => {
    const root = getRoot(self)

    const sendSession = flow(function* (session: Session) {
      // do POST request for session
      const req: ApiResponse<any> = yield self.request({
        method: "POST",
        url: `/items/sessions`,
        data: {
          ...session,
          teacher_id: root.currentUserStore.user.id,
          class_id: root.currentUserStore.user.class_id,
        },
      })
      if (!req.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(req)
        if (problem) {
          __DEV__ && console.tron.error(`Bad data: ${problem}\n${req.data}`, problem)
          __DEV__ && console.log("Problem from SessionModel.sendSession():", problem)
          __DEV__ && console.log(req)
          // if network is offline -> add to queue
          self.sessionOfflineQueue.push(SessionQueueItemModel.create({ session, problem }))
        }
      } else {
        // get server id and apply it

        const id = req.data.data.id
        session.setProp("id", id)

        const updatedNotes = session.notes.map((note) => {
          note.setProp("session_id", id)
          return note
        })
        session.setProp("notes", updatedNotes)
        self.sessions.push(session)
      }
    })
    const fetchSessions = flow(function* () {
      // do POST request for session
      const res: ApiResponse<any> = yield self.request({
        method: "GET",
        url: `/items/sessions?filter[class_id][_eq]=${root.currentUserStore.user.class_id}&fields=*,notes.*`,
      })

      if (!res.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(res)
        if (problem) {
          __DEV__ && console.tron.error(`Bad data: ${problem}\n${res.data}`, problem)
          __DEV__ && console.log("Problem from SessionModel.fetchSessions():", problem)
        }
      } else {
        try {
          const sessions = res.data.data.map((session) => {
            return SessionModel.create({
              _id: session._id,
              id: session.id,
              student_id: session.student_id,
              type: session.type,
              start_page: session.start_page,
              start_chapter: session.start_chapter,
              start_verse: session.start_verse,
              end_page: session.end_page,
              end_chapter: session.end_chapter,
              end_verse: session.end_verse,
              notes: session.notes?.map((note) => {
                return SessionNoteModel.create({
                  _id: note?._id,
                  id: note?.id,
                  verse_number: note?.verse_number,
                  chapter_number: note?.chapter_number,
                  page_number: note?.page_number,
                  tajweed: note?.tajweed,
                  pronunciation: note?.pronunciation,
                  memorization: note?.memorization,
                  text: note?.text,
                  session_id: note?.session_id,
                })
              }),
              timestamp: session.timestamp,
            })
          })
          self.sessions = sessions
        } catch (e) {
          if (__DEV__) {
            console.tron.error(`Bad data: ${e.message}\n${res}`, e.stack)
            __DEV__ && console.log("Error from StudentModel.fetchSessions():", e)
          }
        }
      }
    })

    return { sendSession, fetchSessions }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    const dequeue = flow(function* () {
      // for each item in the sessionOfflineQueue
      // do post request
      // if successful ->  set the id to the id recieved from the OK response & remvove item from sessionOfflineQueue

      const payload: SessionSnapshotOut[] = self.sessionOfflineQueue.map((queueItem) => {
        return getSnapshot(queueItem.session)
      })

      self.sessionOfflineQueue.replace([])
      payload.forEach(async (session) => {
        try {
          await self.sendSession(SessionModel.create(session))
        } catch (error) {
          __DEV__ && console.log("Error from SessionStore.dequeue", error)
        }
      })
    })
    return { dequeue }
  })

export interface SessionStore extends Instance<typeof SessionStoreModel> {}
export interface SessionStoreSnapshotOut extends SnapshotOut<typeof SessionStoreModel> {}
export interface SessionStoreSnapshotIn extends SnapshotIn<typeof SessionStoreModel> {}
export const createSessionStoreDefaultModel = () => types.optional(SessionStoreModel, {})
