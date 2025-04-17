// === modules/ui.js ===
// Actualiza elementos visuales: barra de técnica, "+1", status

export function actualizarBarra(precision) {
    const relleno = document.getElementById("relleno");
    const porcentaje = document.getElementById("porcentaje");
    relleno.style.width = `${precision}%`;
    porcentaje.innerText = `${precision}%`;
  
    if (precision >= 90) {
      relleno.style.backgroundColor = "#00ff44";
      relleno.style.boxShadow = "0 0 10px #00ff44";
    } else if (precision >= 70) {
      relleno.style.backgroundColor = "#ffaa00";
      relleno.style.boxShadow = "0 0 10px #ffaa00";
    } else {
      relleno.style.backgroundColor = "#ff1a1a";
      relleno.style.boxShadow = "0 0 10px #ff1a1a";
    }
  }
  
  export function mostrarRepeticionVisual() {
    const rep = document.createElement("div");
    rep.innerText = "+1";
    rep.style.position = "absolute";
    rep.style.top = "60%";
    rep.style.left = "50%";
    rep.style.transform = "translate(-50%, -50%)";
    rep.style.fontSize = "2em";
    rep.style.color = "#00ff00";
    rep.style.animation = "flotar 1s ease-out";
    rep.style.pointerEvents = "none";
    document.body.appendChild(rep);
    setTimeout(() => rep.remove(), 1000);
  }