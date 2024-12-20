import { afterEach } from "bun:test"
import { tmpdir } from "node:os"
import defaultKy from "ky"
import { startServer } from "./start-server"
import { seedDatabase } from "./seed-database"

interface TestFixture {
  url: string
  server: any
  ky: typeof defaultKy
}

export const getTestServer = async (): Promise<TestFixture> => {
  const port = 3001 + Math.floor(Math.random() * 999)
  const testInstanceId = Math.random().toString(36).substring(2, 15)
  const testDbName = `testdb${testInstanceId}`

  const { server, db } = await startServer({
    port,
    testDbName,
  })

  await seedDatabase(db)

  const url = `http://127.0.0.1:${port}`
  const ky = defaultKy.create({
    prefixUrl: url,
  })

  afterEach(async () => {
    await server.stop()
    // Here you might want to add logic to drop the test database
  })

  return {
    url,
    server,
    ky,
  }
}
