import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { buscarConfiguracoes, salvarConfiguracoes } from "../../services/configApi";
import { mesclarConfig } from "../../utils/configLoja";
import ErroCarregamento from "../componentes/ErroCarregamento";
import { useConsulta } from "../hooks/useConsulta";

/** Ícones que podem aparecer nos benefícios do rodapé (nomes do sprite src/assets/icones.svg). */
const ICONES = [
  ["qualidade", "Selo de qualidade"],
  ["entrega", "Entrega"],
  ["protegida", "Escudo"],
  ["pagamento", "Cartão"],
  ["pix", "Pix"],
  ["dinheiro", "Dinheiro"],
  ["coracao", "Coração"],
  ["gato", "Gatinho"],
  ["local", "Localização"]
];

const TEXTOS = [
  ["subtituloProdutos", "Frase embaixo de “Nossos Brownies”", 120],
  ["momentoLinha1", "Card de destaque: 1ª linha", 60],
  ["momentoLinha2", "Card de destaque: 2ª linha", 60],
  ["proposito", "Nosso propósito", 160],
  ["saudacaoContato", "Mensagem pronta do botão “Falar no WhatsApp”", 200]
];

const MAX_ITENS = 8;

/** Configurações do banco → valores do formulário (o "Sobre" vira um texto com parágrafos separados por linha em branco). */
function paraFormulario(banco) {
  const config = mesclarConfig(banco, null);
  return {
    aviso: config.aviso,
    pedidosPausados: config.pedidosPausados,
    textos: { ...config.textos, sobre: config.textos.sobre.join("\n\n") },
    beneficios: config.beneficios.map((b) => ({ ...b })),
    pagamentos: config.pagamentos.map((p) => ({ nome: p.nome, naEntrega: Boolean(p.naEntrega) }))
  };
}

/** Formulário → formato salvo no banco. */
function paraBanco(form) {
  const textos = Object.fromEntries(Object.entries(form.textos).map(([chave, valor]) => [chave, valor.trim()]));
  textos.sobre = form.textos.sobre
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    aviso: form.aviso,
    pedidosPausados: form.pedidosPausados,
    textos,
    beneficios: form.beneficios.map((b) => ({ icone: b.icone, titulo: b.titulo.trim() })),
    pagamentos: form.pagamentos.map((p) => ({ nome: p.nome.trim(), naEntrega: p.naEntrega }))
  };
}

function validar(form) {
  const erros = {};
  TEXTOS.forEach(([chave, rotulo]) => {
    if (!form.textos[chave].trim()) erros[chave] = `Escreva o texto de “${rotulo}”`;
  });
  if (!form.textos.sobre.trim()) erros.sobre = "Escreva pelo menos um parágrafo";
  if (form.beneficios.some((b) => !b.titulo.trim())) erros.beneficios = "Todo benefício precisa de um texto";
  const nomes = form.pagamentos.map((p) => p.nome.trim().toLowerCase());
  if (!nomes.length) erros.pagamentos = "Deixe pelo menos uma forma de pagamento";
  else if (nomes.some((n) => !n)) erros.pagamentos = "Toda forma de pagamento precisa de um nome";
  else if (new Set(nomes).size !== nomes.length) erros.pagamentos = "Há formas de pagamento repetidas";
  return erros;
}

/** Página de configurações da loja: aviso, pausa de pedidos, textos da home, benefícios e pagamentos. */
export default function Configuracoes() {
  const { dados, erro, carregando, recarregar } = useConsulta(buscarConfiguracoes, "configuracoes");

  let conteudo = null;
  if (dados) conteudo = <FormConfiguracoes inicial={dados} />;
  else if (carregando) conteudo = <p className="admin-carregando">Carregando configurações...</p>;
  else if (!erro) {
    // Banco sem a linha de configurações: o schema.sql novo ainda não foi rodado
    conteudo = (
      <p className="admin-alerta">
        As configurações ainda não existem no banco. Rode o <code>supabase/schema.sql</code> atualizado no SQL Editor
        do Supabase e recarregue a página.
      </p>
    );
  }

  return (
    <div className="admin-pagina">
      <div className="admin-pagina__cabecalho">
        <h1 className="manuscrito">Configurações da loja</h1>
      </div>
      <ErroCarregamento erro={erro} onTentarDeNovo={recarregar} />
      {conteudo}
    </div>
  );
}

/** O formulário só monta depois que as configurações chegam do banco. */
function FormConfiguracoes({ inicial }) {
  const mostrarToast = useToast();
  const [salvo, setSalvo] = useState(() => paraFormulario(inicial));
  const [form, setForm] = useState(salvo);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const alterado = JSON.stringify(form) !== JSON.stringify(salvo);

  const mudar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const mudarTexto = (chave) => (e) => {
    setForm((f) => ({ ...f, textos: { ...f.textos, [chave]: e.target.value } }));
    if (erros[chave]) setErros((atual) => ({ ...atual, [chave]: "" }));
  };
  /** Altera um item de uma lista (benefícios ou pagamentos). */
  const mudarItem = (lista, i, campo, valor) =>
    setForm((f) => ({ ...f, [lista]: f[lista].map((item, j) => (j === i ? { ...item, [campo]: valor } : item)) }));
  const removerItem = (lista, i) => setForm((f) => ({ ...f, [lista]: f[lista].filter((_, j) => j !== i) }));
  const adicionarItem = (lista, novo) => setForm((f) => ({ ...f, [lista]: [...f[lista], novo] }));

  async function aoSalvar(e) {
    e.preventDefault();
    const encontrados = validar(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      mostrarToast("Confira os campos marcados em vermelho");
      return;
    }
    setSalvando(true);
    setErroGeral("");
    try {
      const novo = paraFormulario(await salvarConfiguracoes(paraBanco(form)));
      setSalvo(novo);
      setForm(novo);
      mostrarToast("Configurações salvas ♥ A loja já mostra as mudanças.");
    } catch (falha) {
      setErroGeral(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="admin-config" onSubmit={aoSalvar} noValidate>
      <section className="admin-secao" aria-labelledby="sec-aviso">
        <h2 id="sec-aviso">Aviso e pedidos</h2>
        <label className="admin-campo">
          <span>Aviso no topo da loja</span>
          <textarea
            rows={2}
            maxLength={200}
            value={form.aviso}
            onChange={(e) => mudar("aviso", e.target.value)}
            placeholder="Ex.: Sem entregas no feriado de sexta 🐾"
          />
          <small className="admin-dica">Deixe vazio para não mostrar nada. {200 - form.aviso.length} caracteres restantes.</small>
        </label>
        <label className="admin-check admin-check--destaque">
          <input
            type="checkbox"
            checked={form.pedidosPausados}
            onChange={(e) => mudar("pedidosPausados", e.target.checked)}
          />
          <span>
            <strong>Pausar pedidos pelo site</strong>
            <small>Os clientes ainda veem a loja, mas o botão de enviar fica desligado.</small>
          </span>
        </label>
      </section>

      <section className="admin-secao" aria-labelledby="sec-textos">
        <h2 id="sec-textos">Textos da página inicial</h2>
        {TEXTOS.map(([chave, rotulo, maximo]) => (
          <label className="admin-campo" key={chave}>
            <span>{rotulo}</span>
            <input
              value={form.textos[chave]}
              onChange={mudarTexto(chave)}
              maxLength={maximo}
              aria-invalid={Boolean(erros[chave]) || undefined}
            />
            {erros[chave] && <small className="admin-erro-campo">{erros[chave]}</small>}
          </label>
        ))}
        <label className="admin-campo">
          <span>Sobre nós</span>
          <textarea
            rows={6}
            maxLength={2000}
            value={form.textos.sobre}
            onChange={mudarTexto("sobre")}
            aria-invalid={Boolean(erros.sobre) || undefined}
          />
          <small className="admin-dica">Para separar parágrafos, deixe uma linha em branco entre eles.</small>
          {erros.sobre && <small className="admin-erro-campo">{erros.sobre}</small>}
        </label>
      </section>

      <section className="admin-secao" aria-labelledby="sec-beneficios">
        <h2 id="sec-beneficios">Benefícios do rodapé</h2>
        <ul className="admin-lista-edicao">
          {form.beneficios.map((b, i) => (
            <li key={i}>
              <label className="admin-campo">
                <span className="sr-only">Ícone do benefício {i + 1}</span>
                <select value={b.icone} onChange={(e) => mudarItem("beneficios", i, "icone", e.target.value)}>
                  {ICONES.map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-campo admin-lista-edicao__texto">
                <span className="sr-only">Texto do benefício {i + 1}</span>
                <input
                  value={b.titulo}
                  maxLength={60}
                  onChange={(e) => mudarItem("beneficios", i, "titulo", e.target.value)}
                  placeholder="Ex.: Entrega rápida e segura"
                />
              </label>
              <button
                className="admin-botao admin-botao--perigo"
                type="button"
                onClick={() => removerItem("beneficios", i)}
                aria-label={`Remover benefício ${b.titulo || i + 1}`}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        {erros.beneficios && <p className="admin-erro-campo">{erros.beneficios}</p>}
        <button
          className="admin-botao admin-botao--claro"
          type="button"
          disabled={form.beneficios.length >= MAX_ITENS}
          onClick={() => adicionarItem("beneficios", { icone: "coracao", titulo: "" })}
        >
          + Adicionar benefício
        </button>
      </section>

      <section className="admin-secao" aria-labelledby="sec-pagamentos">
        <h2 id="sec-pagamentos">Formas de pagamento</h2>
        <ul className="admin-lista-edicao">
          {form.pagamentos.map((p, i) => (
            <li key={i}>
              <label className="admin-campo admin-lista-edicao__texto">
                <span className="sr-only">Nome da forma de pagamento {i + 1}</span>
                <input
                  value={p.nome}
                  maxLength={30}
                  onChange={(e) => mudarItem("pagamentos", i, "nome", e.target.value)}
                  placeholder="Ex.: Pix"
                />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={p.naEntrega}
                  onChange={(e) => mudarItem("pagamentos", i, "naEntrega", e.target.checked)}
                />
                Paga na entrega/retirada
              </label>
              <button
                className="admin-botao admin-botao--perigo"
                type="button"
                onClick={() => removerItem("pagamentos", i)}
                aria-label={`Remover ${p.nome || "forma de pagamento"}`}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        <p className="admin-dica">
          “Paga na entrega/retirada” mostra para o cliente, por exemplo, “Cartão na entrega”.
        </p>
        {erros.pagamentos && <p className="admin-erro-campo">{erros.pagamentos}</p>}
        <button
          className="admin-botao admin-botao--claro"
          type="button"
          disabled={form.pagamentos.length >= MAX_ITENS}
          onClick={() => adicionarItem("pagamentos", { nome: "", naEntrega: false })}
        >
          + Adicionar forma de pagamento
        </button>
      </section>

      <div className="admin-config__rodape">
        {erroGeral && (
          <p className="admin-erro" role="alert">
            {erroGeral}
          </p>
        )}
        <span className="admin-dica" aria-live="polite">
          {alterado ? "Você tem alterações não salvas." : "Tudo salvo."}
        </span>
        <button className="admin-botao admin-botao--claro" type="button" disabled={!alterado || salvando} onClick={() => setForm(salvo)}>
          Desfazer
        </button>
        <button className="admin-botao admin-botao--cheio" type="submit" disabled={!alterado || salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
