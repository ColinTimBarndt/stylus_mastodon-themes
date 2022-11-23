import fs from "fs/promises";
import path from "path";
import extVariables from "./variables.json" assert {type: "json"};

main();

const TEMPLATE_REGEX = /\{\{\s*([^}\s]+)\s*\}\}/g; // {{ name }}

async function main() {
    const variables: Record<string, string> = {
        servers: await loadServers(),
        ...extVariables,
    };

    const templates = await fs.readdir("templates", {withFileTypes: true});
    const waiting: Promise<any>[] = templates
        .filter(e => e.isFile())
        .map(async ({name: fname}) => {
            let content = await fs.readFile(path.join("templates", fname), "utf8");
            content = applyVariables(content, {...variables, fname});
            await fs.writeFile(path.join("..", fname), content);
        });
    await Promise.all(waiting);
}

async function loadServers(): Promise<string> {
    return await fs.readFile("out/servers.txt", "utf8");
}

function applyVariables(text: string, variables: Record<string, string>): string {
    return text.replaceAll(TEMPLATE_REGEX, (_, varname: string) => variables[varname] ?? "");
}
