import { useState, useEffect } from "react";
import "../styles/TermoCompromisso.css";

function TermoCompromisso() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

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

  const handleAcceptClick = () => {
    // You can add functionality here when user accepts the terms
    console.log("Termo de compromisso aceito!");
    // Maybe redirect or show a confirmation message
  };

  return (
    <div className="termo-container">
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
          <h2>Termo de Compromisso</h2>
          <div className="letter-content">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in
              dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed
              auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in
              nulla enim.
            </p>
            <p>
              Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer
              euismod lacus luctus magna. Quisque cursus, metus vitae pharetra
              auctor, sem massa mattis sem, at interdum magna augue eget diam.
            </p>
            <p>
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
              posuere cubilia Curae; Morbi lacinia molestie dui. Praesent
              blandit dolor. Sed non quam. In vel mi sit amet augue congue
              elementum. Morbi in ipsum sit amet pede facilisis laoreet.
            </p>
            <p>
              Donec lacus nunc, viverra nec, blandit vel, egestas et, augue.
              Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim.
              Curabitur sit amet mauris. Morbi in dui quis est pulvinar
              ullamcorper.
            </p>
            <button className="accept-button" onClick={handleAcceptClick}>
              Aceito o compromisso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermoCompromisso;
