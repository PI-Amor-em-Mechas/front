import { useState } from "react";
import "./SiteOng.css";
import logo from "../../assets/logo amor em mechas.png";

function Seta() {
    return (
        <svg className="siteSeta" viewBox="0 0 12 8" aria-hidden="true">
            <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Tela simulada do site amoremmechas.com
// Só existe para a apresentação: o botão rosa leva para o nosso formulário.
function SiteOng({ irParaFormulario }) {
    const [aba, setAba] = useState("home");

    return (
        <div className="site">
            {/* Faixa rosa do topo */}
            <div className="siteFaixa">
                <span>🌱 Aqui sua doação transforma vidas - DOAR AGORA 🌱</span>
            </div>

            {/* Menu */}
            <nav className="siteMenu">
                <button type="button" className={aba === "home" ? "siteLink ativo" : "siteLink"}
                    onClick={() => setAba("home")}>Home</button>
                <button type="button" className="siteLink">O Projeto <Seta /></button>
                <button type="button" className={aba === "peruca" ? "siteLink ativo" : "siteLink"}
                    onClick={() => setAba("peruca")}>Quero uma peruca</button>
                <button type="button" className="siteLink">Como doar</button>
                <button type="button" className="siteLink">Campanhas</button>
                <button type="button" className="siteLink">Pontos de coleta</button>
                <button type="button" className="siteLink">Parcerias</button>
                <button type="button" className="siteLink">Mais <Seta /></button>
            </nav>

            <main className="siteConteudo">
                <img src={logo} alt="Instituto Amor em Mechas - Transformando Vidas" className="siteLogo" />

                {aba === "home" && (
                    <>
                        <h1 className="siteTitulo">Transforme vidas com ações sociais</h1>
                        <div className="siteBanner">
                            <span>Instituto Amor em Mechas</span>
                        </div>
                    </>
                )}

                {aba === "peruca" && (
                    <>
                        <h1 className="siteTitulo">Quero uma peruca</h1>
                        <section className="siteFormulario">
                            <p>Para ganhar nossa Peruca do Amor basta preencher o formulário abaixo</p>
                            <button type="button" className="siteBotao" onClick={irParaFormulario}>
                                Click para preencher com os dados da paciente
                            </button>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
export default SiteOng;