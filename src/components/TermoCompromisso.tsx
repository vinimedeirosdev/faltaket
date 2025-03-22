import { useState, useEffect } from "react";
import "../styles/TermoCompromisso.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

function TermoCompromisso() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [hearts, setHearts] = useState<
    { id: number; left: number; animationDuration: number }[]
  >([]);

  useEffect(() => {
    // Trigger the entrance animation after component mounts
    const timer = setTimeout(() => {
      setIsEntered(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleEnvelopeClick = () => {
    setIsOpen(true);
  };

  const createHearts = () => {
    const newHearts = [];
    // Criar 30 corações com posições aleatórias
    for (let i = 0; i < 30; i++) {
      newHearts.push({
        id: i,
        left: Math.random() * 100, // posição horizontal aleatória (0-100%)
        animationDuration: 2 + Math.random() * 3, // duração da animação entre 2-5s
      });
    }
    setHearts(newHearts);
  };

  const handleAcceptClick = () => {
    // Mostrar os corações
    setShowHearts(true);
    createHearts();

    // Esconder os corações após 5 segundos
    setTimeout(() => {
      setShowHearts(false);
      navigate("/home");
    }, 5000);
    // Maybe redirect or show a confirmation message
  };

  return (
    <div className="termo-container">
      {showHearts && (
        <div className="hearts-container">
          {hearts.map((heart) => (
            <div
              key={heart.id}
              className="heart"
              style={{
                left: `${heart.left}%`,
                animationDuration: `${heart.animationDuration}s`,
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      <div className={`envelope-wrapper ${isEntered ? "entered" : ""}`}>
        <div
          className={`envelope ${isOpen ? "open" : ""}`}
          onClick={handleEnvelopeClick}
        >
          <div className="envelope-front">
            <div className="envelope-flap"></div>
            <div className="envelope-body"></div>
          </div>
        </div>
        <div className={`letter ${isOpen ? "visible" : ""}`}>
          <h2
            style={{
              fontFamily: "Dancing Script",
            }}
          >
            Termo de Compromisso
          </h2>
          <div className="letter-content">
            <p>
              Eu, Ketlen, após ler e refletir sobre o que está escrito, concordo
              em estabelecer com o Vinícius, daqui em diante chamado de "Amor",
              um compromisso baseado em respeito, amizade e muito carinho.
            </p>
            <p>
              Este Termo tem como objetivo oficializar o que estamos prestes a
              começar: uma jornada cheia de confiança, comunicação aberta e
              diversão. Com isso, me comprometo a compartilhar momentos alegres
              e a construir juntos uma história de apoio mútuo.
            </p>
            <p>Ambas as partes acordam em:</p>
            <p> - Dividir risadas, bons momentos e muito carinho;</p>
            <p>
              - Apoiar um ao outro em todas as situações, com empatia e
              dedicação;
            </p>
            <p>
              - Ser sinceros e transparentes, para manter um ambiente leve e
              saudável.
            </p>
            <p>
              Esse compromisso não tem data para acabar. Ele vai durar enquanto
              o respeito e a vontade de seguir juntos forem recíprocos. O futuro
              depende das nossas escolhas e do amor que decidirmos cultivar ao
              longo do caminho.
            </p>
            <p>Agora, para formalizar tudo isso, só falta um detalhe:</p>
            <p>
              <strong>Você aceita namorar comigo?</strong>
            </p>
            <Button
              fullWidth
              sx={{ mt: 2, backgroundColor: "#e879f9", color: "white" }}
              onClick={handleAcceptClick}
            >
              Aceito o compromisso
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermoCompromisso;
