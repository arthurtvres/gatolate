// Gera .claude/mapa-projeto.md: cada arquivo de src/ com o que ele faz (do comentário do topo
// ou do /** */ da função exportada), o que exporta e se tem teste; mais as rotas e o banco.
// Uso: node .claude/skills/mapear-projeto/gerar-mapa.mjs   (sem dependências)
import fs from "node:fs";
import path from "node:path";

const raiz = process.cwd();
const src = path.join(raiz, "src");
const saida = path.join(raiz, ".claude", "mapa-projeto.md");
const barra = (p) => p.split(path.sep).join("/");

function listar(pasta) {
  return fs.readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(pasta, item.name);
    return item.isDirectory() ? listar(caminho) : [caminho];
  });
}

/** Limpa um comentário (/* … *\/ ou /** … *\/) e devolve a primeira frase útil. */
function resumirComentario(bruto) {
  const texto = bruto
    .replace(/^\/\*+|\*+\/$/g, "")
    .split("\n")
    .map((linha) => linha.replace(/^\s*\*?\s?/, "").trim())
    .filter((linha) => linha && !/^[=\-]{5,}$/.test(linha))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  // Cabeçalhos tipo "base/variaveis.css — cores..." viram só a parte depois do travessão
  const semNome = texto.replace(/^[\w./-]+\.(css|js|jsx)\s+—\s+/, "");
  const frase = semNome.match(/^.*?[.!?](\s|$)/)?.[0] ?? semNome;
  return frase.length > 160 ? `${frase.slice(0, 157)}…` : frase.trim();
}

/** O que o arquivo faz: /** *\/ logo antes do export default, senão o comentário do topo. */
function descrever(codigo) {
  const antesDoDefault = codigo.match(/(\/\*\*[\s\S]*?\*\/)\s*export default/);
  if (antesDoDefault) return resumirComentario(antesDoDefault[1]);
  const topo = codigo.match(/^\s*(\/\*[\s\S]*?\*\/)/);
  if (topo) return resumirComentario(topo[1]);
  const primeiroDoc = codigo.match(/(\/\*\*[\s\S]*?\*\/)\s*export /);
  return primeiroDoc ? resumirComentario(primeiroDoc[1]) : "";
}

function exportsDe(codigo) {
  const nomes = new Set();
  for (const m of codigo.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)) nomes.add(m[1]);
  for (const m of codigo.matchAll(/export\s*\{([^}]+)\}/g)) {
    m[1].split(",").forEach((n) => n.trim() && nomes.add(n.trim().split(/\s+as\s+/).pop()));
  }
  return [...nomes];
}

// ---------- Arquivos de src/ ----------
const arquivos = listar(src).filter((f) => /\.(jsx?|css)$/.test(f));
const testes = new Set(arquivos.filter((f) => /\.test\.js$/.test(f)).map((f) => f.replace(/\.test\.js$/, ".js")));
const porPasta = new Map();

for (const arquivo of arquivos.filter((f) => !/\.test\.js$/.test(f)).sort()) {
  const rel = barra(path.relative(raiz, arquivo));
  const pasta = path.posix.dirname(rel);
  const codigo = fs.readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n");
  const ehCss = arquivo.endsWith(".css");
  const item = {
    nome: path.posix.basename(rel),
    rel,
    descricao: descrever(codigo),
    exports: ehCss ? [] : exportsDe(codigo),
    testado: testes.has(arquivo)
  };
  if (!porPasta.has(pasta)) porPasta.set(pasta, []);
  porPasta.get(pasta).push(item);
}

// ---------- Rotas ----------
/** Rotas de um arquivo: cada <Route> com a tela de dentro (pula Suspense e Providers). */
function rotasDe(arquivo, prefixo) {
  if (!fs.existsSync(arquivo)) return [];
  const codigo = fs.readFileSync(arquivo, "utf8");
  const blocos = codigo.split(/(?=<Route\s)/).slice(1);
  return blocos.map((bloco) => {
    const trecho = bloco.split(/<\/Routes>/)[0];
    const caminho = trecho.match(/^<Route\s+path="([^"]*)"/)?.[1];
    const telas = [...trecho.matchAll(/<([A-Z]\w*)/g)]
      .map((m) => m[1])
      .filter((nome) => nome !== "Route" && nome !== "Suspense" && !nome.endsWith("Provider"));
    const completo = caminho === undefined ? prefixo : prefixo && !caminho.startsWith("/") ? `${prefixo}/${caminho}` : caminho;
    return { caminho: completo, tela: telas.at(-1) || "?" };
  });
}
const rotas = [...rotasDe(path.join(src, "App.jsx"), ""), ...rotasDe(path.join(src, "admin", "PainelAdmin.jsx"), "/admin")];

// ---------- Banco (supabase/schema.sql) ----------
const schemaArq = path.join(raiz, "supabase", "schema.sql");
const schema = fs.existsSync(schemaArq) ? fs.readFileSync(schemaArq, "utf8") : "";
const tabelas = [...new Set([...schema.matchAll(/create table if not exists public\.(\w+)/g)].map((m) => m[1]))].map((t) => ({
  nome: t,
  policies: [...schema.matchAll(new RegExp(`create policy "([^"]+)" on public\\.${t}\\b`, "g"))].map((m) => m[1])
}));
const funcoes = [...new Set([...schema.matchAll(/create or replace function public\.(\w+)/g)].map((m) => m[1]))];
const expostas = new Set([...schema.matchAll(/grant execute on function public\.(\w+)\([^)]*\) to anon/g)].map((m) => m[1]));

// ---------- Markdown ----------
const total = [...porPasta.values()].flat();
const comLogica = total.filter((i) => /\/(utils|services)\//.test(i.rel) && i.rel.endsWith(".js"));
const linhas = [
  "# Mapa do projeto",
  "",
  `> Gerado por \`/mapear-projeto\` em ${new Date().toLocaleString("pt-BR")}. Não edite à mão: rode a skill de novo.`,
  `> Visão geral e regras ficam no [CLAUDE.md](../CLAUDE.md); aqui é o detalhe arquivo por arquivo.`,
  "",
  `**${total.length} arquivos** em src/ · **${testes.size} com teste** · utils/services testados: ${comLogica.filter((i) => i.testado).length}/${comLogica.length}`,
  "",
  "## Rotas",
  "",
  "| Caminho | Tela |",
  "|---|---|",
  ...rotas.map((r) => `| \`${r.caminho || "/"}\` | ${r.tela} |`),
  "",
  "## Banco (supabase/schema.sql)",
  "",
  "| Tabela | Policies (RLS) |",
  "|---|---|",
  ...tabelas.map((t) => `| \`${t.nome}\` | ${t.policies.length ? t.policies.join(" · ") : "nenhuma (só funções acessam)"} |`),
  "",
  `**Funções:** ${funcoes.map((f) => `\`${f}\`${expostas.has(f) ? " (pública)" : ""}`).join(", ")}`,
  ""
];

for (const [pasta, itens] of [...porPasta.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  linhas.push(`## ${pasta}/`, "");
  for (const i of itens) {
    const extras = [i.testado && "✅ teste", i.exports.length && `exporta: ${i.exports.map((e) => `\`${e}\``).join(", ")}`]
      .filter(Boolean)
      .join(" · ");
    linhas.push(`- **[${i.nome}](../${i.rel})**: ${i.descricao || "_sem comentário de topo_"}${extras ? `  \n  ${extras}` : ""}`);
  }
  linhas.push("");
}

fs.writeFileSync(saida, linhas.join("\n"));
const semDescricao = total.filter((i) => !i.descricao).map((i) => i.rel);
console.log(`Mapa gerado: ${barra(path.relative(raiz, saida))} (${total.length} arquivos, ${rotas.length} rotas, ${tabelas.length} tabelas)`);
if (semDescricao.length) console.log(`Sem comentário de topo (${semDescricao.length}):\n  ${semDescricao.join("\n  ")}`);
