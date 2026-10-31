/** Mostrado em /admin enquanto o Supabase não está configurado. */
export default function AvisoConfiguracao() {
  return (
    <main className="admin-centro">
      <div className="admin-cartao admin-cartao--estreito">
        <h1 className="manuscrito">Painel ainda não configurado 🐾</h1>
        <p>
          O painel precisa de um banco de dados (Supabase) para guardar pedidos e produtos. Enquanto isso, a loja
          funciona em <strong>modo demonstração</strong>.
        </p>
        <ol>
          <li>Crie um projeto grátis em supabase.com.</li>
          <li>
            Rode o arquivo <code>supabase/schema.sql</code> no SQL Editor.
          </li>
          <li>
            Copie <code>.env.example</code> para <code>.env</code> e cole a URL e a chave anon.
          </li>
          <li>Crie seu usuário admin (passo a passo no README).</li>
        </ol>
        <a className="btn btn--cheio" href="/">
          Voltar para a loja
        </a>
      </div>
    </main>
  );
}
