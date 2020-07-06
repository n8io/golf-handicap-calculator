import { writeFile as writeFileNative } from "fs";
import { promisify } from "util";

const writeFile = promisify(writeFileNative);

export { writeFile };
