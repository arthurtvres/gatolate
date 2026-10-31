import Icone from "./Icone";

/** Título manuscrito com risquinhos dos dois lados. Ex.: <TituloDecorado como="h2" id="x">Contato</TituloDecorado> */
export default function TituloDecorado({ como: Tag = "h2", id, className = "", children }) {
  return (
    <Tag id={id} className={`manuscrito ${className}`.trim()}>
      <Icone nome="risquinhos" className="deco-risco espelhado" />
      {children}
      <Icone nome="risquinhos" className="deco-risco" />
    </Tag>
  );
}
