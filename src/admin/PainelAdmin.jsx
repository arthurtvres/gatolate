/* Painel da dona da loja (/admin): dashboard, pedidos e produtos.
   Carregado sob demanda (lazy) — clientes da loja não baixam este código. */
import { Navigate, Route, Routes } from "react-router-dom";
import { supabaseConfigurado } from "../lib/supabase";
import { sair } from "../services/authApi";
import AvisoConfiguracao from "./componentes/AvisoConfiguracao";
import LayoutAdmin from "./componentes/LayoutAdmin";
import { useAvisosPedidos, VersaoPedidosContext } from "./hooks/useAvisosPedidos";
import { useSessaoAdmin } from "./hooks/useSessaoAdmin";
import Dashboard from "./paginas/Dashboard";
import Login from "./paginas/Login";
import Pedidos from "./paginas/Pedidos";
import Produtos from "./paginas/Produtos";
import "./estilos/admin.css";

export default function PainelAdmin() {
  if (!supabaseConfigurado) return <AvisoConfiguracao />;
  return <PainelComLogin />;
}

function PainelComLogin() {
  const sessao = useSessaoAdmin();

  if (sessao.status === "carregando") return <p className="admin-carregando">Carregando painel...</p>;
  if (sessao.status === "deslogado") return <Login />;
  if (sessao.status === "sem-acesso") return <SemAcesso email={sessao.email} />;
  return <PainelLogado email={sessao.email} />;
}

function SemAcesso({ email }) {
  return (
    <main className="admin-centro">
      <div className="admin-cartao admin-cartao--estreito">
        <h1 className="manuscrito">Sem acesso 🐾</h1>
        <p>
          A conta <strong>{email}</strong> entrou, mas não está cadastrada como admin. Veja no README como liberar o
          acesso.
        </p>
        <button className="btn btn--cheio" type="button" onClick={sair}>
          Sair
        </button>
      </div>
    </main>
  );
}

/** Só existe com a admin logada: é aqui que começam os avisos de pedido novo. */
function PainelLogado({ email }) {
  const { naoVistos, versao } = useAvisosPedidos();

  return (
    <VersaoPedidosContext.Provider value={versao}>
      <LayoutAdmin email={email} pedidosNovos={naoVistos}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </LayoutAdmin>
    </VersaoPedidosContext.Provider>
  );
}
