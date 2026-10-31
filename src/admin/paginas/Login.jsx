import { useState } from "react";
import { entrar } from "../../services/authApi";
import { caminhoPublico } from "../../utils/produtos";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await entrar(email, senha);
      // Ao entrar, o useSessaoAdmin percebe a sessão nova e troca a tela
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  return (
    <main className="admin-centro admin-centro--marrom">
      <form className="admin-cartao admin-cartao--estreito admin-login" onSubmit={aoEnviar}>
        <img className="admin-login__logo" src={caminhoPublico("logo.png")} alt="Gatolate" width="120" height="120" />
        <h1 className="manuscrito">Painel da loja</h1>

        <label className="admin-campo">
          <span>E-mail</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="admin-campo">
          <span>Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>

        {erro && (
          <p className="admin-erro" role="alert">
            {erro}
          </p>
        )}

        <button className="btn btn--cheio" type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
        <a className="admin-link-suave" href="/">
          ← Voltar para a loja
        </a>
      </form>
    </main>
  );
}
