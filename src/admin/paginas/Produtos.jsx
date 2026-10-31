import { useState } from "react";
import FotoProduto from "../../components/produtos/FotoProduto";
import PrecoProduto from "../../components/produtos/PrecoProduto";
import { useToast } from "../../hooks/useToast";
import { alterarAtivo, excluirProduto, listarTodosProdutos } from "../../services/produtosApi";
import FormProduto from "../componentes/FormProduto";
import { useConsulta } from "../hooks/useConsulta";

const ordenar = (lista) => [...lista].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome));

export default function Produtos() {
  const mostrarToast = useToast();
  const { dados: produtos, erro, recarregar, alterarDados } = useConsulta(listarTodosProdutos, "produtos");
  // null = formulário fechado · {} = novo · produto = editando
  const [editando, setEditando] = useState(null);

  async function alternarAtivo(produto) {
    try {
      await alterarAtivo(produto.id, !produto.ativo);
      alterarDados((lista) => lista.map((p) => (p.id === produto.id ? { ...p, ativo: !p.ativo } : p)));
      mostrarToast(produto.ativo ? `${produto.nome} saiu da loja` : `${produto.nome} voltou para a loja ♥`);
    } catch (falha) {
      mostrarToast(falha.message);
    }
  }

  async function excluir(produto) {
    const ok = window.confirm(
      `Excluir "${produto.nome}" de vez?\n\nPedidos antigos continuam no histórico. Se for só por um tempo, prefira "Ocultar".`
    );
    if (!ok) return;
    try {
      await excluirProduto(produto.id);
      alterarDados((lista) => lista.filter((p) => p.id !== produto.id));
      mostrarToast(`${produto.nome} foi excluído`);
    } catch (falha) {
      mostrarToast(falha.message);
    }
  }

  function aoSalvar(salvo) {
    const existia = produtos.some((p) => p.id === salvo.id);
    alterarDados((lista) => ordenar(existia ? lista.map((p) => (p.id === salvo.id ? salvo : p)) : [...lista, salvo]));
    setEditando(null);
    mostrarToast(existia ? "Produto atualizado ♥" : "Produto criado ♥");
  }

  return (
    <div className="admin-pagina">
      <div className="admin-pagina__cabecalho">
        <h1 className="manuscrito">Produtos</h1>
        <button className="btn" type="button" onClick={() => setEditando({})}>
          + Novo produto
        </button>
      </div>
      <p className="admin-dica">
        As mudanças aparecem na loja na próxima vez que a página for aberta. Produtos ocultos não aparecem para os
        clientes.
      </p>

      {erro && (
        <p className="admin-erro" role="alert">
          {erro}{" "}
          <button className="admin-botao" type="button" onClick={recarregar}>
            Tentar de novo
          </button>
        </p>
      )}

      {!produtos ? (
        <p className="admin-carregando">Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p className="admin-vazio">Nenhum produto ainda. Clique em “Novo produto” para começar. 🐾</p>
      ) : (
        <ul className="admin-produtos">
          {produtos.map((produto) => (
            <li key={produto.id} className={`admin-produto${produto.ativo ? "" : " admin-produto--oculto"}`}>
              <div className="admin-produto__foto">
                <FotoProduto produto={produto} mini />
              </div>
              <div className="admin-produto__info">
                <strong>{produto.nome}</strong>
                <span className="admin-produto__preco">
                  <PrecoProduto produto={produto} />
                </span>
                <span className={`admin-status admin-status--${produto.ativo ? "visivel" : "oculto"}`}>
                  {produto.ativo ? "Na loja" : "Oculto"}
                </span>
              </div>
              <div className="admin-produto__acoes">
                <button className="admin-botao" type="button" onClick={() => setEditando(produto)}>
                  Editar
                </button>
                <button className="admin-botao admin-botao--claro" type="button" onClick={() => alternarAtivo(produto)}>
                  {produto.ativo ? "Ocultar" : "Mostrar"}
                </button>
                <button className="admin-botao admin-botao--perigo" type="button" onClick={() => excluir(produto)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <FormProduto
          key={editando.id || "novo"}
          produto={editando}
          idsExistentes={(produtos || []).map((p) => p.id)}
          onFechar={() => setEditando(null)}
          onSalvo={aoSalvar}
        />
      )}
    </div>
  );
}
