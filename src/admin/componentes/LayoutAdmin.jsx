import { NavLink } from "react-router-dom";
import { sair } from "../../services/authApi";
import { caminhoPublico } from "../../utils/produtos";

const LINKS = [
  { para: "/admin", rotulo: "Dashboard", fim: true },
  { para: "/admin/pedidos", rotulo: "Pedidos" },
  { para: "/admin/produtos", rotulo: "Produtos" }
];

export default function LayoutAdmin({ email, children }) {
  return (
    <div className="admin">
      <header className="admin-topo">
        <div className="admin-topo__barra">
          <a className="admin-topo__marca" href="/" title="Ver a loja">
            <img src={caminhoPublico("logo.png")} alt="" width="44" height="44" />
            <span className="manuscrito">Painel</span>
          </a>

          <nav className="admin-nav" aria-label="Seções do painel">
            {LINKS.map((link) => (
              <NavLink key={link.para} to={link.para} end={link.fim}>
                {link.rotulo}
              </NavLink>
            ))}
          </nav>

          <div className="admin-topo__conta">
            <span className="admin-topo__email" title={email}>
              {email}
            </span>
            <button className="admin-botao admin-botao--claro" type="button" onClick={sair}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="admin-conteudo">{children}</main>
    </div>
  );
}
