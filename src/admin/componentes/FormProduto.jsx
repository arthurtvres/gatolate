import { useEffect, useRef, useState } from "react";
import FotoProduto from "../../components/produtos/FotoProduto";
import { enviarFoto, salvarProduto } from "../../services/produtosApi";
import { gerarId } from "../../utils/produtos";

const NOVO = {
  id: "",
  nome: "",
  descricao: "",
  detalhes: "",
  informacoes: [],
  preco: null,
  unidade: "unidade",
  imagem: "",
  categoria: "brownies",
  nomeNoPedido: "",
  ativo: true,
  ordem: 0
};

/** produto → valores do formulário (tudo texto) */
const paraFormulario = (p) => ({
  ...p,
  preco: p.preco === null ? "" : String(p.preco.toFixed(2)).replace(".", ","),
  sobConsulta: p.preco === null && Boolean(p.id),
  informacoes: p.informacoes.join("\n"),
  ordem: String(p.ordem)
});

/** "8,50" → 8.5 */
const lerPreco = (texto) => Number(texto.replace(/\./g, "").replace(",", "."));

function validar(form, idsExistentes, editando) {
  const erros = {};
  if (!form.nome.trim()) erros.nome = "Dê um nome ao produto";
  const id = editando ? form.id : gerarId(form.nome);
  if (!editando && form.nome.trim() && !id) erros.nome = "Use letras ou números no nome";
  if (!editando && idsExistentes.includes(id)) erros.nome = "Já existe um produto com esse nome";
  if (!form.sobConsulta) {
    const preco = lerPreco(form.preco);
    if (!form.preco.trim() || !Number.isFinite(preco) || preco < 0) erros.preco = "Digite o preço, ex.: 8,50";
  }
  if (!/^-?\d+$/.test(form.ordem.trim())) erros.ordem = "Use um número inteiro";
  return erros;
}

/**
 * Criar/editar produto num <dialog>. `produto` null = fechado; {} sem id = novo.
 * onSalvo(produtoSalvo) é chamado depois de gravar no banco.
 */
export default function FormProduto({ produto, idsExistentes, onFechar, onSalvo }) {
  const dialogRef = useRef(null);
  const editando = Boolean(produto?.id);
  const [form, setForm] = useState(() => paraFormulario({ ...NOVO, ...produto }));
  const [arquivo, setArquivo] = useState(null);
  const [previa, setPrevia] = useState("");
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (produto && !dialog.open) dialog.showModal();
  }, [produto]);

  // Libera a memória da prévia da foto escolhida
  useEffect(() => () => previa && URL.revokeObjectURL(previa), [previa]);

  const fechar = () => {
    dialogRef.current?.close();
    onFechar();
  };

  const mudar = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: "" }));
  };

  function escolherFoto(e) {
    const escolhido = e.target.files[0];
    if (!escolhido) return;
    if (!escolhido.type.startsWith("image/")) {
      setErros((atual) => ({ ...atual, foto: "Escolha um arquivo de imagem" }));
      return;
    }
    if (escolhido.size > 5 * 1024 * 1024) {
      setErros((atual) => ({ ...atual, foto: "Imagem muito grande (máx. 5 MB)" }));
      return;
    }
    setErros((atual) => ({ ...atual, foto: "" }));
    setArquivo(escolhido);
    setPrevia(URL.createObjectURL(escolhido));
  }

  async function aoSalvar(e) {
    e.preventDefault();
    const encontrados = validar(form, idsExistentes, editando);
    setErros(encontrados);
    if (Object.values(encontrados).some(Boolean)) return;

    setSalvando(true);
    setErroGeral("");
    try {
      const id = editando ? form.id : gerarId(form.nome);
      const imagem = arquivo ? await enviarFoto(arquivo, id) : form.imagem;
      const salvo = await salvarProduto({
        id,
        nome: form.nome,
        descricao: form.descricao,
        detalhes: form.detalhes,
        informacoes: form.informacoes
          .split("\n")
          .map((linha) => linha.trim())
          .filter(Boolean),
        preco: form.sobConsulta ? null : lerPreco(form.preco),
        unidade: form.unidade,
        imagem,
        categoria: form.categoria,
        nomeNoPedido: form.nomeNoPedido,
        ativo: form.ativo,
        ordem: Number(form.ordem)
      });
      dialogRef.current?.close();
      onSalvo(salvo);
    } catch (falha) {
      setErroGeral(falha.message);
      setSalvando(false);
    }
  }

  const fotoAtual = previa || form.imagem;

  return (
    <dialog
      ref={dialogRef}
      className="admin-dialogo"
      aria-labelledby="titulo-form-produto"
      onCancel={(e) => {
        e.preventDefault();
        fechar();
      }}
    >
      <form className="admin-form" onSubmit={aoSalvar} noValidate>
        <header className="admin-form__topo">
          <h2 id="titulo-form-produto" className="manuscrito">
            {editando ? `Editar ${produto.nome}` : "Novo produto"}
          </h2>
          <button className="admin-botao admin-botao--icone" type="button" aria-label="Fechar" onClick={fechar}>
            ✕
          </button>
        </header>

        <div className="admin-form__corpo">
          <div className="admin-form__foto">
            <div className="admin-form__previa">
              <FotoProduto key={fotoAtual} produto={{ nome: form.nome || "Produto", imagem: fotoAtual }} />
            </div>
            <label className="admin-botao admin-botao--arquivo">
              {fotoAtual ? "Trocar foto" : "Escolher foto"}
              <input type="file" accept="image/*" onChange={escolherFoto} className="sr-only" />
            </label>
            {erros.foto && <p className="admin-erro-campo">{erros.foto}</p>}
            <p className="admin-dica">JPG ou PNG, de preferência deitada (ex.: 800×600).</p>
          </div>

          <div className="admin-form__campos">
            <label className="admin-campo">
              <span>Nome *</span>
              <input value={form.nome} onChange={mudar("nome")} maxLength={80} aria-invalid={Boolean(erros.nome) || undefined} />
              {erros.nome && <small className="admin-erro-campo">{erros.nome}</small>}
            </label>

            <label className="admin-campo">
              <span>Descrição curta</span>
              <input value={form.descricao} onChange={mudar("descricao")} maxLength={200} placeholder="Aparece no card" />
            </label>

            <div className="admin-form__linha">
              <label className="admin-campo">
                <span>Preço (R$)</span>
                <input
                  inputMode="decimal"
                  value={form.preco}
                  onChange={mudar("preco")}
                  disabled={form.sobConsulta}
                  placeholder="8,50"
                  aria-invalid={Boolean(erros.preco) || undefined}
                />
                {erros.preco && <small className="admin-erro-campo">{erros.preco}</small>}
              </label>
              <label className="admin-campo">
                <span>Unidade</span>
                <input value={form.unidade} onChange={mudar("unidade")} maxLength={40} placeholder="125g, unidade, caixa com 6..." />
              </label>
            </div>
            <label className="admin-check">
              <input type="checkbox" checked={form.sobConsulta} onChange={mudar("sobConsulta")} />
              Preço sob consulta (combinado pelo WhatsApp)
            </label>

            <label className="admin-campo">
              <span>Detalhes</span>
              <textarea rows={3} value={form.detalhes} onChange={mudar("detalhes")} maxLength={1000} placeholder="Texto mais longo, aparece ao clicar no produto" />
            </label>

            <label className="admin-campo">
              <span>Informações (uma por linha)</span>
              <textarea rows={3} value={form.informacoes} onChange={mudar("informacoes")} placeholder={"Aprox. 80 g\nContém glúten, leite e ovos"} />
            </label>

            <div className="admin-form__linha">
              <label className="admin-campo">
                <span>Categoria</span>
                <input value={form.categoria} onChange={mudar("categoria")} maxLength={40} />
              </label>
              <label className="admin-campo">
                <span>Ordem na loja</span>
                <input inputMode="numeric" value={form.ordem} onChange={mudar("ordem")} aria-invalid={Boolean(erros.ordem) || undefined} />
                {erros.ordem && <small className="admin-erro-campo">{erros.ordem}</small>}
              </label>
            </div>

            <label className="admin-campo">
              <span>Nome na mensagem do WhatsApp (opcional)</span>
              <input value={form.nomeNoPedido} onChange={mudar("nomeNoPedido")} maxLength={80} placeholder={form.nome} />
            </label>

            <label className="admin-check">
              <input type="checkbox" checked={form.ativo} onChange={mudar("ativo")} />
              Mostrar na loja
            </label>
          </div>
        </div>

        <footer className="admin-form__rodape">
          {erroGeral && (
            <p className="admin-erro" role="alert">
              {erroGeral}
            </p>
          )}
          <button className="admin-botao admin-botao--claro" type="button" onClick={fechar}>
            Cancelar
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar produto"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
