import * as process from "node:process";
import {GoblinConfig} from "./config.js";
import * as path from "node:path";
import { readRepositoryFile } from "./mcp/tools/read-file.js";

const targetPath = process.argv[2]

if(!targetPath) {
    console.error("Usage: npm run dev -- <repository-path>")
    process.exit(1)
}

const config: GoblinConfig = {
    repositoryRoot: path.resolve(targetPath)
}

console.log(`The goblin is inspecting: ${config.repositoryRoot}`);


const data = await readRepositoryFile(config, 'README.md')
console.log(data)
