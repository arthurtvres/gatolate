import { Banknote, CreditCard, Lock, MapPin, Pencil, Phone, QrCode, Store, Truck, User } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useCarrinho } from "../../hooks/useCarrinho";
import { useConfigLoja } from "../../hooks/useConfigLoja";
import { useProdutos } from "../../hooks/useProdutos";
import { registrarPedidoDaLoja } from "../../services/pedidosApi";
import { CHAVES, gravarLocal, lerLocal } from "../../utils/armazenamento";
import { calcularResumo, textoNota, textoTotal } from "../../utils/carrinho";
import { nomesBairros, taxaDoBairro, temTaxas } from "../../utils/configLoja";
import { formatarEndereco, mascararTelefone } from "../../utils/formatacao";
import { iconePagamento, nomePagamento } from "../../utils/pagamentos";
import { validarCampo, validarFormulario } from "../../utils/validacao";
import { abrirWhatsApp, linkWhatsApp, montarMensagem } from "../../utils/whatsapp";
import CampoTexto from "../ui/CampoTexto";
import Icone from "../ui/Icone";
import CampoBairro from "./CampoBairro";
import ResumoItens from "./ResumoItens";

/** Campos lembrados para o próximo pedido. */
const CAMPOS_SALVOS = ["nome", "telefone", "rua", "numero", "bairro", "complemento"];
const CAMPOS_ENDERECO = ["rua", "numero", "bairro"];

const DADOS_VAZIOS = {
  nome: "",
  telefone: "",
  tipo: "entrega",
  rua: "",
  numero: "",
  bairro: "",
  bairroOutro: false, // true = bairro digitado à mão (não está na lista)
  complemento: "",
  obs: "",
  pagamento: "0" // posição na lista de pagamentos das configurações
};

function carregarDados(bairros) {
  const salvo = lerLocal(CHAVES.cliente, {}) || {};
  const cliente = {};
  CAMPOS_SALVOS.forEach((campo) => {
    if (typeof salvo[campo] === "string") cliente[campo] = salvo[campo];
  });
  // Bairro salvo que não está na lista: continua como "digitado à mão"
  cliente.bairroOutro = Boolean(cliente.bairro) && !bairros.includes(cliente.bairro);
  return { ...DADOS_VAZIOS, ...cliente };
}

/** true se todos os campos estão preenchidos e passam na validação. */
const partesValidas = (dados, campos, bairros) => campos.every((c) => dados[c] && !validarCampo(c, dados, bairros));

const ICONES_PAGAMENTO = { pix: QrCode, dinheiro: Banknote, pagamento: CreditCard };

function IconePagamento({ p }) {
  const IconeLucide = ICONES_PAGAMENTO[iconePagamento(p)];
  return <IconeLucide aria-hidden="true" />;
}

/** Dados já salvos, em forma de resumo, com o botão "Alterar". */
function CartaoSalvo({ titulo, rotuloAlterar, onAlterar, children }) {
  return (
    <div className="cartao-salvo">
      <div className="cartao-salvo__conteudo">
        <strong className="cartao-salvo__titulo">{titulo}</strong>
        {children}
      </div>
      <button type="button" className="cartao-salvo__alterar" aria-label={rotuloAlterar} onClick={onAlterar}>
        <Pencil aria-hidden="true" />
        Alterar
      </button>
    </div>
  );
}

/** Tela 2 da gaveta: dados do cliente e envio para o WhatsApp. */
export default function FormularioPedido({ onVazio, onEditarItens, onEnviado }) {
  const { itens } = useCarrinho();
  const { porId } = useProdutos();
  const config = useConfigLoja();
  const bairros = useMemo(() => nomesBairros(config.bairros), [config.bairros]);
  const [dados, setDados] = useState(() => carregarDados(bairros));
  const [erros, setErros] = useState({});
  // Dados salvos e válidos de um pedido anterior aparecem como cartão; "Alterar" abre os campos
  const [editando, setEditando] = useState(() => ({
    contato: !partesValidas(dados, ["nome", "telefone"], bairros),
    endereco: !partesValidas({ ...dados, tipo: "entrega" }, CAMPOS_ENDERECO, bairros)
  }));
  const formRef = useRef(null);

  const taxa = dados.tipo === "entrega" && !dados.bairroOutro ? taxaDoBairro(config.bairros, dados.bairro) : null;
  const resumo = useMemo(() => calcularResumo(itens, porId, dados.tipo, taxa), [itens, porId, dados.tipo, taxa]);
  const pausado = config.pedidosPausados;

  /** Aplica { campo: valor, ... } de uma vez (assim duas mudanças seguidas não se atropelam). */
  function atualizar(mudancas) {
    const proximos = { ...dados, ...mudancas };
    setDados(proximos);

    setErros((atuais) => {
      const novos = { ...atuais };
      // O erro some assim que a pessoa corrige o campo
      Object.keys(mudancas).forEach((nome) => {
        if (novos[nome]) novos[nome] = validarCampo(nome, proximos, bairros);
      });
      // Trocar entre lista e bairro livre muda a regra do bairro
      if ("bairroOutro" in mudancas && novos.bairro) novos.bairro = validarCampo("bairro", proximos, bairros);
      // Na retirada, endereço não é obrigatório: limpa os erros antigos
      if (mudancas.tipo === "retirada") CAMPOS_ENDERECO.forEach((c) => delete novos[c]);
      return novos;
    });
  }

  const aoMudar = (e) => {
    const { name, value } = e.target;
    atualizar({ [name]: name === "telefone" ? mascararTelefone(value) : value });
  };

  // Ao sair de um campo já preenchido, confere se está certo
  const aoSair = (e) => {
    const { name, value } = e.target;
    if (value) setErros((atuais) => ({ ...atuais, [name]: validarCampo(name, dados, bairros) }));
  };

  async function aoEnviar(e) {
    e.preventDefault();
    if (pausado) return;
    if (resumo.quantidade === 0) {
      onVazio();
      return;
    }

    const encontrados = validarFormulario(dados, bairros);
    setErros(encontrados);
    const primeiroErro = Object.keys(encontrados)[0];
    if (primeiroErro) {
      // Se o erro estiver num campo escondido no cartão, mostra os campos antes
      const parte = CAMPOS_ENDERECO.includes(primeiroErro) ? "endereco" : "contato";
      if (!editando[parte]) flushSync(() => setEditando((atual) => ({ ...atual, [parte]: true })));
      formRef.current.elements[primeiroErro]?.focus();
      return;
    }

    const pagamento = config.pagamentos[Number(dados.pagamento)] || config.pagamentos[0];
    const pedido = Object.fromEntries(
      Object.entries(dados).map(([campo, valor]) => [campo, typeof valor === "string" ? valor.trim() : valor])
    );
    pedido.pagamento = nomePagamento(pagamento, dados.tipo);

    gravarLocal(CHAVES.cliente, Object.fromEntries(CAMPOS_SALVOS.map((c) => [c, pedido[c]])));

    // O banco gera o código sequencial e devolve o mesmo valor para o WhatsApp.
    // Também devolve o token do link de acompanhamento (/pedido/<token>).
    const registro = await registrarPedidoDaLoja(resumo, pedido);

    const url = linkWhatsApp(montarMensagem(resumo, pedido, registro?.codigo, registro?.token));
    onEnviado(url);
    abrirWhatsApp(url);
  }

  /** Troca o cartão pelos campos e já coloca o cursor no primeiro deles. */
  function alterar(parte, primeiroCampo) {
    flushSync(() => setEditando((atual) => ({ ...atual, [parte]: true })));
    formRef.current.elements[primeiroCampo]?.focus();
  }

  const entrega = dados.tipo === "entrega";
  const propsCampo = (nome) => ({ nome, value: dados[nome], onChange: aoMudar, onBlur: aoSair, erro: erros[nome] });
  const nota = textoNota(resumo, dados.tipo, { taxasPorBairro: temTaxas(config.bairros), bairro: dados.bairro });

  return (
    <form className="formulario" ref={formRef} onSubmit={aoEnviar} noValidate>
      <ResumoItens resumo={resumo} onEditar={onEditarItens} />

      {editando.contato ? (
        <>
          <CampoTexto {...propsCampo("nome")} rotulo="Nome" obrigatorio type="text" autoComplete="name" />
          <CampoTexto
            {...propsCampo("telefone")}
            rotulo="Telefone / WhatsApp"
            obrigatorio
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
        </>
      ) : (
        <CartaoSalvo titulo="Seus dados" rotuloAlterar="Alterar nome e telefone" onAlterar={() => alterar("contato", "nome")}>
          <span className="cartao-salvo__linha">
            <User aria-hidden="true" />
            {dados.nome}
          </span>
          <span className="cartao-salvo__linha">
            <Phone aria-hidden="true" />
            {dados.telefone}
          </span>
        </CartaoSalvo>
      )}

      <fieldset className="campo">
        <legend>
          Como prefere receber? <abbr title="obrigatório">*</abbr>
        </legend>
        <div className="opcoes">
          {[
            ["entrega", Truck, "Entrega"],
            ["retirada", Store, "Retirada"]
          ].map(([valor, IconeOpcao, rotulo]) => (
            <label className="opcao" key={valor}>
              <input type="radio" name="tipo" value={valor} checked={dados.tipo === valor} onChange={aoMudar} />
              <span>
                <IconeOpcao aria-hidden="true" />
                {rotulo}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {entrega && !editando.endereco && (
        <CartaoSalvo titulo="Entregar em" rotuloAlterar="Alterar endereço" onAlterar={() => alterar("endereco", "rua")}>
          <span className="cartao-salvo__linha">
            <MapPin aria-hidden="true" />
            {formatarEndereco(dados)}
          </span>
        </CartaoSalvo>
      )}

      {entrega && editando.endereco && (
        <fieldset className="campo endereco">
          <legend>Endereço de entrega</legend>
          <CampoTexto {...propsCampo("rua")} rotulo="Rua" obrigatorio type="text" autoComplete="address-line1" />
          <CampoBairro
            opcoes={bairros}
            value={dados.bairro}
            outro={dados.bairroOutro}
            erro={erros.bairro}
            onEscolher={(bairro) => atualizar({ bairro })}
            onOutro={(bairroOutro) => atualizar(bairroOutro ? { bairroOutro } : { bairroOutro, bairro: "" })}
            onBlur={aoSair}
          />
          <div className="campo-duplo campo-duplo--numero">
            <CampoTexto {...propsCampo("numero")} rotulo="Número" obrigatorio type="text" inputMode="numeric" />
            <CampoTexto
              {...propsCampo("complemento")}
              rotulo="Complemento"
              type="text"
              autoComplete="address-line2"
              placeholder="Apto, bloco, referência..."
            />
          </div>
        </fieldset>
      )}

      <fieldset className="campo">
        <legend>Forma de pagamento</legend>
        <div className="opcoes opcoes--tres">
          {config.pagamentos.map((p, i) => (
            <label className="opcao" key={p.nome}>
              <input
                type="radio"
                name="pagamento"
                value={String(i)}
                checked={dados.pagamento === String(i)}
                onChange={aoMudar}
              />
              <span>
                <IconePagamento p={p} />
                {nomePagamento(p, dados.tipo)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <CampoTexto
        {...propsCampo("obs")}
        rotulo="Observações"
        multilinha
        rows={2}
        placeholder="Ex.: sem castanha, é presente..."
      />

      {/* Fica grudado no rodapé da gaveta enquanto a pessoa rola o formulário */}
      <div className="rodape-pedido">
        <div className="linha-total">
          <span>Total</span>
          <strong>{textoTotal(resumo)}</strong>
        </div>
        <p className="nota">{nota}</p>
        {pausado && (
          <p className="aviso-pausa" role="status">
            No momento não estamos recebendo pedidos pelo site. Chama a gente no WhatsApp!
          </p>
        )}
        <button className="btn btn--cheio btn--whatsapp" type="submit" disabled={pausado}>
          <Icone nome="whatsapp" />
          Enviar pedido pelo WhatsApp
        </button>
        <p className="nota-privacidade">
          <Lock aria-hidden="true" />
          <span>
            Seus dados estão seguros: usamos só para preparar e entregar seu pedido.{" "}
            <a href="/privacidade" target="_blank" rel="noopener">
              Saiba mais
            </a>
          </span>
        </p>
      </div>
    </form>
  );
}
