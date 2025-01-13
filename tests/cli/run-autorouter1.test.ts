import { expect, test } from "bun:test"
import { temporaryDirectory } from "tempy"
import { runAutorouter } from "@/cli/run/run-autorouter"
import { existsSync, readFileSync } from "fs"
import { join } from "path/posix"
import { writeFile, mkdir } from "fs/promises"
import type { AnyCircuitElement } from "circuit-json"
import unroutedCircuit from "../fixtures/unrouted_circuit.json"

const createMockCircuitFile = async (dir: string) => {
  const mockCircuit = unroutedCircuit
  await writeFile(
    join(dir, "unrouted_circuit.json"),
    JSON.stringify(mockCircuit, null, 2),
  )
}

test("should run autorouter on a single circuit file", async () => {
  // Create a temporary directory with a sample folder structure
  const tempDir = temporaryDirectory()
  const sampleDir = join(tempDir, "sample1")
  await mkdir(sampleDir, { recursive: true })
  await createMockCircuitFile(sampleDir)
  const inputPath = join(sampleDir, "unrouted_circuit.json")

  // Run command
  await runAutorouter({
    inputPath,
    autorouter: "freerouting",
    serverUrl: "https://registry-api.tscircuit.com",
  })

  // Check routed file was created in sample's outputs directory
  const outputPath = join(
    sampleDir,
    "outputs",
    "freerouting_routed_circuit.json",
  )
  expect(existsSync(outputPath)).toBe(true)

  // Verify output content
  const outputJson: AnyCircuitElement[] = JSON.parse(
    readFileSync(outputPath, "utf8"),
  )
  expect(Array.isArray(outputJson)).toBe(true)
  expect(outputJson.some((item) => item.type !== "pcb_trace")).toBe(true)
  expect(outputJson.some((item) => item.type === "pcb_trace")).toBe(true)
}, 10000) // Increase timeout to 10 seconds