import {
  convertCircuitJsonToSchematicSvg,
  convertCircuitJsonToPcbSvg,
} from "circuit-to-svg"
import { createCircuitWebWorker } from "@tscircuit/eval-webworker"
import webWorkerUrl from "@tscircuit/eval-webworker/blob-url"
import { getSimpleRouteJson } from "@tscircuit/infgrid-ijump-astar"
import { convertCircuitJsonToDsnString } from "dsn-converter"

export const createSampleCircuitJson = async (
  circuitType: "keyboard" | "blinking-led",
  sampleNum: number,
  tsciImportName = "@tsci/seveibar.keyboard-sample",
) => {
  const circuit = await createCircuitWebWorker({
    webWorkerUrl,
  })

  if (circuitType === "keyboard") {
    await circuit.execute(`
      import MyCircuit from "${tsciImportName}"

      circuit.add(<MyCircuit sampleNumber={${sampleNum}} />)
    `)

    const circuitJson = await circuit.getCircuitJson()

    return circuitJson
  }

  throw new Error(`Invalid circuit type: "${circuitType}"`)
}

export const createSample = async (
  circuitType: "keyboard" | "blinking-led",
  sampleNum: number,
  tsciImportName?: string,
) => {
  const circuitJson = await createSampleCircuitJson(
    circuitType,
    sampleNum,
    tsciImportName,
  )

  const pcbSvg = convertCircuitJsonToPcbSvg(circuitJson)

  const simpleRouteJson = await getSimpleRouteJson(circuitJson)
  const dsnString = convertCircuitJsonToDsnString(circuitJson)

  return { circuitJson, pcbSvg, simpleRouteJson, dsnString }
}
