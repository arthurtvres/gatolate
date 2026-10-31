/**
 * Campo do formulário com rótulo e mensagem de erro embaixo.
 * As demais props (type, value, onChange...) vão direto para o <input>.
 */
export default function CampoTexto({ nome, rotulo, obrigatorio, erro, multilinha, ...props }) {
  const id = `f-${nome}`;
  const idErro = `erro-${nome}`;
  const Controle = multilinha ? "textarea" : "input";

  return (
    <div className="campo">
      <label htmlFor={id}>
        {rotulo}{" "}
        {obrigatorio ? <abbr title="obrigatório">*</abbr> : <span className="opcional">(opcional)</span>}
      </label>
      <Controle
        id={id}
        name={nome}
        aria-invalid={erro ? "true" : undefined}
        aria-describedby={obrigatorio ? idErro : undefined}
        {...props}
      />
      {obrigatorio && (
        <p className="erro" id={idErro}>
          {erro}
        </p>
      )}
    </div>
  );
}
