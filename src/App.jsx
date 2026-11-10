import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import SpriteIcones from "./components/ui/SpriteIcones";
import { CarrinhoProvider } from "./context/CarrinhoProvider";
import { ConfigLojaProvider } from "./context/ConfigLojaProvider";
import { ProdutosProvider } from "./context/ProdutosProvider";
import Loja from "./paginas/Loja";

// O painel só é baixado por quem abre /admin (clientes da loja não carregam esse código)
const PainelAdmin = lazy(() => import("./admin/PainelAdmin"));
const AcompanharPedido = lazy(() => import("./paginas/AcompanharPedido"));
const Privacidade = lazy(() => import("./paginas/Privacidade"));

/** Rotas: "/" = loja · "/pedido/:token" = cliente acompanha o pedido · "/privacidade" · "/admin" = painel da dona. */
export default function App() {
  return (
    <>
      <SpriteIcones />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<p className="admin-carregando">Carregando painel...</p>}>
              <PainelAdmin />
            </Suspense>
          }
        />
        <Route
          path="/pedido/:token"
          element={
            <Suspense fallback={<p className="acompanhar__aviso">Buscando seu pedido...</p>}>
              <AcompanharPedido />
            </Suspense>
          }
        />
        <Route
          path="/privacidade"
          element={
            <Suspense fallback={null}>
              <Privacidade />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <ConfigLojaProvider>
              <ProdutosProvider>
                <CarrinhoProvider>
                  <Loja />
                </CarrinhoProvider>
              </ProdutosProvider>
            </ConfigLojaProvider>
          }
        />
      </Routes>
    </>
  );
}
