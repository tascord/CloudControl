import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path"

export function fetch_or_create_file(path: string, content: string, relative: boolean) {
    
    path = relative ? join(homedir(), path) : path;

    if(!existsSync(path)) {
        writeFileSync(path, content);
    }

    return readFileSync(path, "utf8");

}