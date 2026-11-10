// Hook PostToolUse: roda o ESLint no arquivo que o Claude acabou de editar.
// Se houver erro, sai com código 2 para o Claude ver e corrigir.
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";

let entrada = "";
for await (const parte of process.stdin) entrada += parte;

const { tool_input = {}, tool_response = {} } = JSON.parse(entrada || "{}");
const arquivo = tool_input.file_path || tool_response.filePath;
if (!arquivo || !/\.(js|jsx|mjs)$/.test(arquivo)) process.exit(0);

const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const caminho = relative(raiz, arquivo);
if (caminho.startsWith("..") || caminho.startsWith("dist") || caminho.startsWith(".claude")) process.exit(0);

const eslint = join(raiz, "node_modules", "eslint", "bin", "eslint.js");
const r = spawnSync(process.execPath, [eslint, caminho], { cwd: raiz, encoding: "utf8" });

if (r.status !== 0) {
  process.stderr.write(`ESLint encontrou problemas em ${caminho}:\n${r.stdout}${r.stderr}`);
  process.exit(2);
}
