// === modules/curl.js ===

import { actualizarBarra } from "./ui.js";
import { calcularAngulo, distanciaEntre } from "./utils.js";

let repeticiones = 0;
let haSubidoPerfecto = false;
let tiempoInicioFase = 0;

const sonidoRepeticion = new Audio("assets/Audio/rep_ok_voice.mp3");

export function detectarCurl(lm) {
  const hombro = lm[11];
  const codo = lm[13];
  const muñeca = lm[15];

  const angulo = calcularAngulo(hombro, codo, muñeca);
  let precision = 0;

  if (angulo >= 45 && angulo <= 55) precision = 100;
  else if (angulo > 55 && angulo <= 140) precision = 85;
  else if (angulo > 30 && angulo <= 150) precision = 60;
  else precision = 25;

  // --- DETECTAR SI EL CODO SE MUEVE MUCHO (posición fija del codo)
  const desplazamientoCodo = distanciaEntre(codo, hombro);
  const codoEstable = desplazamientoCodo < 0.15; // rango en metros

  // Penalización por codo inestable
  if (!codoEstable && precision >= 85) {
    precision = 50;
  }

  actualizarBarra(precision);

  const estaEnArribaPerfecto = angulo >= 40 && angulo <= 65;
  const estaEnAbajoPerfecto = angulo >= 145 && angulo <= 160;

  const debugDiv = document.getElementById("debug");
  debugDiv.innerHTML = `
    <strong>Ángulo:</strong> ${Math.round(angulo)}°<br>
    <strong>Precisión:</strong> ${precision}%<br>
    <strong>¿Codo Estable?:</strong> ${codoEstable ? "Sí" : "No"}<br>
    <strong>¿Arriba Perfecto?:</strong> ${estaEnArribaPerfecto ? 'Sí' : 'No'}<br>
    <strong>¿Abajo Perfecto?:</strong> ${estaEnAbajoPerfecto ? 'Sí' : 'No'}<br>
    <strong>Estado subida previa:</strong> ${haSubidoPerfecto ? 'Sí' : 'No'}
  `;

  const statusDiv = document.getElementById("status");
  const contadorDiv = document.getElementById("contador");

  if (estaEnArribaPerfecto && precision >= 80 && tiempoEnFaseMinimo()) {
    haSubidoPerfecto = true;
    tiempoInicioFase = Date.now();
    statusDiv.innerText = "Arriba perfecto – ahora baja";
  }

  if (haSubidoPerfecto && estaEnAbajoPerfecto && precision >= 80 && tiempoEnFaseMinimo()) {
    repeticiones++;
    contadorDiv.innerText = `Reps: ${repeticiones}`;
    mostrarRepeticionVisual();
    sonidoRepeticion.play();
    haSubidoPerfecto = false;
    tiempoInicioFase = Date.now();
    statusDiv.innerText = "¡Repetición contada!";
  }

  // PUNTO VISUAL EN CODO
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");

  let color = "#ff1a1a";
  if (precision >= 90) color = "#00ff44";
  else if (precision >= 70) color = "#ffaa00";

  ctx.beginPath();
  ctx.arc(codo.x * canvas.width, codo.y * canvas.height, 16, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.fill();
}

function tiempoEnFaseMinimo(ms = 400) {
  return Date.now() - tiempoInicioFase > ms;
}

function mostrarRepeticionVisual() {
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