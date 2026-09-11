import * as process from "node:process";

const targetPath = process.argv[2]

if(!targetPath) {
    console.error("Usage: npm run dev -- <repository-path>")
    process.exit(1)
}

console.log(`The goblin is inspecting: ${targetPath}`)