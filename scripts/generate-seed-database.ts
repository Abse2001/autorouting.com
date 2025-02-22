import type { DatabaseSchema } from "@/api/lib/db/schema"
import { createSample } from "@/lib/dataset/create-sample"
import { writeFileSync } from "node:fs"

export const generateSeedDatabase = async (): Promise<DatabaseSchema> => {
  const db: DatabaseSchema = {
    id_counter: 0,
    datasets: [],
    samples: [],
    sample_files: [],
    autorouters: [],
    autorouter_run_results: [],
  }
  // Seed datasets
  db.datasets.push({
    dataset_id: "dataset-1",
    dataset_name_with_owner: "testuser/custom-keyboards",
    dataset_name: "custom-keyboards",
    owner_name: "testuser",
    sample_count: 3,
    version: "1.0.0",
    description_md:
      "A dataset of custom keyboards based on [this snippet](https://tscircuit.com/seveibar/keyboard-sample)",
    registry_account_id: "test-account-id",
    median_trace_count: 10,
    max_layer_count: 2,
    created_at: new Date().toISOString(),
    star_count: 0,
  })
  db.datasets.push({
    dataset_id: "dataset-2",
    dataset_name_with_owner: "testuser/blinking-leds",
    dataset_name: "blinking-leds",
    registry_account_id: "test-account-id",
    owner_name: "testuser",
    sample_count: 3,
    median_trace_count: 5,
    version: "2.0.0",
    max_layer_count: 1,
    created_at: new Date().toISOString(),
    star_count: 0,
  })

  // Seed autorouters
  db.autorouters.push({
    autorouter_id: "freerouting",
    autorouter_name: "FreeRouting",
    version: "1.9.0",
    description_md:
      "Java-based autorouter with push and shove routing capability",
    github_url: "https://github.com/freerouting/freerouting",
    website_url: "https://freerouting.org",
    license_type: "GPL",
    created_at: new Date().toISOString(),
  })

  db.autorouters.push({
    autorouter_id: "tscircuit-builtin",
    autorouter_name: "TSCircuit Built-in Router",
    version: "0.1.0",
    description_md: "Basic autorouter built into TSCircuit",
    github_url: "https://github.com/tscircuit/tscircuit",
    license_type: "MIT",
    created_at: new Date().toISOString(),
  })

  for (let i = 0; i < 3; i++) {
    const { circuitJson, dsnString, pcbSvg, simpleRouteJson } =
      await createSample("keyboard", i + 1)
    const sample_id = `sample-${i + 1}`
    db.samples.push({
      sample_id,
      dataset_id: "dataset-1",
      sample_number: i + 1,
      created_at: new Date().toISOString(),
    })

    const filesToInsert = {
      "unrouted_circuit.json": circuitJson,
      "unrouted.dsn": dsnString,
      "unrouted_pcb.svg": pcbSvg,
      "unrouted_simple_route.json": simpleRouteJson,
    }

    for (const [filename, content] of Object.entries(filesToInsert)) {
      db.sample_files.push({
        sample_file_id: `${sample_id}-${filename}`,
        dataset_id: "dataset-1",
        sample_id,
        file_path: filename,
        mimetype: getMimetypeFromFileName(filename),
        text_content:
          typeof content === "string" ? content : JSON.stringify(content),
        created_at: new Date().toISOString(),
      })
    }
  }
  return db
}

function getMimetypeFromFileName(filename: string): string {
  if (filename.endsWith(".json")) {
    return "application/json"
  }
  if (filename.endsWith(".svg")) {
    return "image/svg+xml"
  }
  if (filename.endsWith(".dsn")) {
    return "text/plain"
  }
  throw new Error(`Unknown file type: ${filename}`)
}

const db = await generateSeedDatabase()

writeFileSync(
  "tests/fixtures/seed-database.generated.json",
  JSON.stringify(db, null, 2),
)
