import { useMemo, useState } from "react";
import { useToast } from "../../hooks/useToast";
import { excluirBairro, listarBairros, salvarBairro } from "../../services/configApi";
import { moeda, normalizar } from "../../utils/formatacao";
import ErroCarregamento from "../componentes/ErroCarregamento";
import { useConsulta } from "../hooks/useConsulta";
import { lerReais, paraCampoReais } from "../utils/reais";

const TAXA_MAXIMA = 500;
const ordenar = (lista) => [...lista].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

/** "7,50" → { taxa: 7.5 } · "" → { taxa: null } · inválido → { erro } */
function conferirTaxa(texto) {
  const taxa = lerReais(texto);
  if (Number.isNaN(taxa) || (taxa !== null && taxa > TAXA_MAXIMA)) return { erro: "Use um valor como 7,50" };
  return { taxa };
}

/** Página de bairros de entrega: adicionar, tirar da lista, excluir e definir a taxa de cada um. */
export default function Bairros() {
  const mostrarToast = useToast();
  const { dados: bairros, erro, recarregar, alterarDados } = useConsulta(listarBairros, "bairros");
  const [busca, setBusca] = useState("");

  const visiveis = useMemo(() => {
    const termo = normalizar(busca);
    return (bairros || []).filter((b) => normalizar(b.nome).includes(termo));
  }, [bairros, busca]);

  /** Grava no banco e atualiza a lista na tela. Devolve true se deu certo. */
  async function gravar(bairro, mensagem) {
    try {
      const salvo = await salvarBairro(bairro);
      alterarDados((lista) => ordenar([...lista.filter((b) => b.nome !== salvo.nome), salvo]));
      mostrarToast(mensagem);
      return true;
    } catch (falha) {
      mostrarToast(falha.message, 4000);
      return false;
    }
  }

  async function excluir(bairro) {
    if (!window.confirm(`Excluir o bairro "${bairro.nome}"?\n\nSe for só por um tempo, prefira "Tirar da lista".`)) return;
    try {
      await excluirBairro(bairro.nome);
      alterarDados((lista) => lista.filter((b) => b.nome !== bairro.nome));
      mostrarToast(`${bairro.nome} foi excluído`);
    } catch (falha) {
      mostrarToast(falha.message, 4000);
    }
  }

  const ativos = (bairros || []).filter((b) => b.ativo).length;

  return (
    <div className="admin-pagina">
      <div className="admin-pagina__cabecalho">
        <h1 className="manuscrito">Bairros de entrega</h1>
      </div>
      <p className="admin-dica">
        São os bairros que o cliente escolhe na hora do pedido. Taxa vazia = “a combinar pelo WhatsApp”. Quem mora num
        bairro fora da lista ainda pode digitar o nome, e a taxa fica a combinar.
      </p>

      <ErroCarregamento erro={erro} onTentarDeNovo={recarregar} />

      <NovoBairro nomesExistentes={(bairros || []).map((b) => normalizar(b.nome))} onAdicionar={gravar} />

      {!bairros ? (
        <p className="admin-carregando">Carregando bairros...</p>
      ) : (
        <>
          <div className="admin-bairros__barra">
            <label className="admin-busca">
              <span className="sr-only">Buscar bairro</span>
              <input type="search" placeholder="Buscar bairro" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </label>
            <p className="admin-contagem">
              {ativos} de {bairros.length} na lista da loja
            </p>
          </div>

          {visiveis.length === 0 ? (
            <p className="admin-vazio">{busca ? "Nenhum bairro com esse nome." : "Nenhum bairro cadastrado ainda. 🐾"}</p>
          ) : (
            <ul className="admin-bairros">
              {visiveis.map((bairro) => (
                <LinhaBairro key={bairro.nome} bairro={bairro} onGravar={gravar} onExcluir={excluir} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

/** Formulário "Adicionar bairro". */
function NovoBairro({ nomesExistentes, onAdicionar }) {
  const [nome, setNome] = useState("");
  const [taxa, setTaxa] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function aoEnviar(e) {
    e.preventDefault();
    const limpo = nome.trim().replace(/\s+/g, " ");
    const conferida = conferirTaxa(taxa);
    if (limpo.length < 2) return setErro("Digite o nome do bairro");
    if (nomesExistentes.includes(normalizar(limpo))) return setErro("Esse bairro já está cadastrado");
    if (conferida.erro) return setErro(conferida.erro);

    setErro("");
    setSalvando(true);
    const ok = await onAdicionar({ nome: limpo, taxa: conferida.taxa, ativo: true }, `${limpo} entrou na lista ♥`);
    setSalvando(false);
    if (ok) {
      setNome("");
      setTaxa("");
    }
  }

  return (
    <form className="admin-secao admin-bairros__novo" onSubmit={aoEnviar} noValidate>
      <h2>Adicionar bairro</h2>
      <div className="admin-bairros__novo-campos">
        <label className="admin-campo">
          <span>Nome</span>
          <input value={nome} maxLength={80} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Vila Lobão" />
        </label>
        <label className="admin-campo">
          <span>Taxa (R$)</span>
          <input inputMode="decimal" value={taxa} onChange={(e) => setTaxa(e.target.value)} placeholder="a combinar" />
        </label>
        <button className="admin-botao admin-botao--cheio" type="submit" disabled={salvando}>
          {salvando ? "Adicionando..." : "Adicionar"}
        </button>
      </div>
      {erro && (
        <p className="admin-erro-campo" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}

/** Um bairro: taxa (salva ao sair do campo ou com Enter), tirar/voltar para a lista e excluir. */
function LinhaBairro({ bairro, onGravar, onExcluir }) {
  const [taxa, setTaxa] = useState(paraCampoReais(bairro.taxa));
  const [erro, setErro] = useState("");
  const idTaxa = `taxa-${normalizar(bairro.nome).replace(/[^a-z0-9]+/g, "-")}`;

  async function salvarTaxa() {
    const conferida = conferirTaxa(taxa);
    if (conferida.erro) return setErro(conferida.erro);
    setErro("");
    if (conferida.taxa === bairro.taxa) return setTaxa(paraCampoReais(bairro.taxa));
    const texto = conferida.taxa === null ? "a combinar" : moeda(conferida.taxa);
    const ok = await onGravar({ ...bairro, taxa: conferida.taxa }, `Taxa de ${bairro.nome}: ${texto}`);
    if (ok) setTaxa(paraCampoReais(conferida.taxa));
  }

  return (
    <li className={`admin-bairro${bairro.ativo ? "" : " admin-bairro--fora"}`}>
      <div className="admin-bairro__nome">
        <strong>{bairro.nome}</strong>
        {!bairro.ativo && <span className="admin-status admin-status--oculto">Fora da lista</span>}
      </div>
      <div className="admin-campo admin-bairro__taxa">
        <label htmlFor={idTaxa} className="sr-only">
          Taxa de entrega de {bairro.nome}
        </label>
        <span aria-hidden="true">R$</span>
        <input
          id={idTaxa}
          inputMode="decimal"
          value={taxa}
          placeholder="a combinar"
          onChange={(e) => setTaxa(e.target.value)}
          onBlur={salvarTaxa}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur(); // o blur salva
            }
          }}
          aria-invalid={Boolean(erro) || undefined}
          aria-describedby={erro ? `${idTaxa}-erro` : undefined}
        />
      </div>
      <div className="admin-bairro__acoes">
        <button
          className="admin-botao admin-botao--claro"
          type="button"
          onClick={() =>
            onGravar(
              { ...bairro, ativo: !bairro.ativo },
              bairro.ativo ? `${bairro.nome} saiu da lista` : `${bairro.nome} voltou para a lista ♥`
            )
          }
        >
          {bairro.ativo ? "Tirar da lista" : "Voltar para a lista"}
        </button>
        <button className="admin-botao admin-botao--perigo" type="button" onClick={() => onExcluir(bairro)}>
          Excluir
        </button>
      </div>
      {erro && (
        <p className="admin-erro-campo admin-bairro__erro" id={`${idTaxa}-erro`} role="alert">
          {erro}
        </p>
      )}
    </li>
  );
}
