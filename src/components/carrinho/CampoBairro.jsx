import { MapPin } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import BAIRROS from "../../config/bairros";
import { normalizarBusca } from "../../utils/validacao";

const NAO_ESTA = "__nao-esta__";

/**
 * Bairro com busca: a pessoa digita e escolhe na lista.
 * Se o bairro não estiver na lista, "Meu bairro não está na lista" libera digitar livre (outro = true).
 */
export default function CampoBairro({ value, outro, erro, onEscolher, onOutro, onBlur }) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const listaRef = useRef(null);
  const inputRef = useRef(null);
  const idLista = useId();

  const sugestoes = useMemo(() => {
    const busca = normalizarBusca(value);
    const filtrados = busca ? BAIRROS.filter((b) => normalizarBusca(b).includes(busca)) : BAIRROS;
    return [...filtrados, NAO_ESTA];
  }, [value]);

  const mostrarLista = aberto && !outro;

  function escolher(opcao) {
    if (opcao === NAO_ESTA) {
      onOutro(true);
    } else {
      onEscolher(opcao);
    }
    setAberto(false);
  }

  function mover(passo) {
    const proximo = (ativo + passo + sugestoes.length) % sugestoes.length;
    setAtivo(proximo);
    listaRef.current?.children[proximo]?.scrollIntoView({ block: "nearest" });
  }

  function aoTeclar(e) {
    if (outro) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!aberto) setAberto(true);
      else mover(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      mover(-1);
    } else if (e.key === "Enter" && mostrarLista) {
      e.preventDefault(); // não envia o formulário
      escolher(sugestoes[ativo]);
    } else if (e.key === "Escape" && mostrarLista) {
      e.stopPropagation(); // fecha só a lista, não a gaveta
      setAberto(false);
    }
  }

  function aoSair(e) {
    setAberto(false);
    // Digitou o nome certinho sem clicar? Aceita, com a grafia da lista
    if (!outro) {
      const igual = BAIRROS.find((b) => normalizarBusca(b) === normalizarBusca(value));
      if (igual) {
        if (igual !== value) onEscolher(igual);
        return; // já é válido
      }
    }
    onBlur(e);
  }

  return (
    <div className="campo campo-bairro">
      <label htmlFor="f-bairro">
        Bairro <abbr title="obrigatório">*</abbr>
      </label>
      <input
        ref={inputRef}
        id="f-bairro"
        name="bairro"
        type="text"
        autoComplete="off"
        role={outro ? undefined : "combobox"}
        aria-expanded={outro ? undefined : mostrarLista}
        aria-controls={outro ? undefined : idLista}
        aria-autocomplete={outro ? undefined : "list"}
        aria-activedescendant={mostrarLista ? `${idLista}-${ativo}` : undefined}
        aria-invalid={erro ? "true" : undefined}
        aria-describedby="erro-bairro"
        placeholder={outro ? "Digite o nome do seu bairro" : "Digite para buscar..."}
        value={value}
        onChange={(e) => {
          onEscolher(e.target.value);
          setAberto(true);
          setAtivo(0);
        }}
        onFocus={() => setAberto(true)}
        onClick={() => setAberto(true)}
        onBlur={aoSair}
        onKeyDown={aoTeclar}
      />

      {mostrarLista && (
        <ul className="campo-bairro__lista" id={idLista} role="listbox" ref={listaRef}>
          {sugestoes.map((opcao, i) => (
            <li
              key={opcao}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === ativo}
              className={opcao === NAO_ESTA ? "campo-bairro__outro" : undefined}
              // mousedown + preventDefault: escolhe sem tirar o foco do campo antes
              onMouseDown={(e) => {
                e.preventDefault();
                escolher(opcao);
              }}
              onMouseEnter={() => setAtivo(i)}
            >
              {opcao === NAO_ESTA ? (
                <>
                  <MapPin aria-hidden="true" />
                  Meu bairro não está na lista
                </>
              ) : (
                opcao
              )}
            </li>
          ))}
        </ul>
      )}

      {outro && (
        <button
          type="button"
          className="campo-bairro__voltar"
          onClick={() => {
            onOutro(false); // o formulário também limpa o bairro
            inputRef.current.focus(); // o foco reabre a lista
            setAberto(true);
            setAtivo(0);
          }}
        >
          ← Escolher da lista
        </button>
      )}

      <p className="erro" id="erro-bairro">
        {erro}
      </p>
    </div>
  );
}
