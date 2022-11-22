import fetch from "node-fetch";
import fs from "fs/promises";

main();

interface ServerEntry {
    domain: string;
}

interface JMServerEntry extends ServerEntry {
    domain: string;
    version: string;
    description: string;
    region: string;
    language: string;
    languages: string[];
    category: string;
    categories: string[];
    proxied_thumbnail: string;
    total_users: number;
    last_week_users: number;
    approval_required: boolean;
}

async function getServersFromFile(): Promise<ServerEntry[]> {
    const domains: string = await fs.readFile("servers.txt", {encoding: "utf8"});
    
    return domains
        .split(/\r?\n/g)
        .map(l => l.replaceAll(/#.*$/g, ""))
        .flatMap(l => l.split(/\s+/g))
        .filter(l => l.length > 0)
        .map(domain => ({domain}));
}

async function getServersFromJM(): Promise<JMServerEntry[]> {
    const response = await fetch("https://api.joinmastodon.org/servers");
    if (response.status < 200 || response.status > 399)
        throw new Error(response.statusText);
    return await response.json() as JMServerEntry[];
}

async function main() {
    const servers = await getServersFromFile();
    servers.push(...await getServersFromJM());
    const domains = new Set(servers.map(s => s.domain));
    let first = true;
    for (const domain of domains) {
        if (first) first = false;
        else process.stdout.write(", ");
        process.stdout.write(`domain("${domain}")`)
    }
}
