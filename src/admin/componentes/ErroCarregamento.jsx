/** Faixa de erro com o botão "Tentar de novo" (não aparece se não houver erro). */
export default function ErroCarregamento({ erro, onTentarDeNovo }) {
  if (!erro) return null;
  return (
    <p className="admin-erro" role="alert">
      {erro}{" "}
      <button className="admin-botao" type="button" onClick={onTentarDeNovo}>
        Tentar de novo
      </button>
    </p>
  );
}
