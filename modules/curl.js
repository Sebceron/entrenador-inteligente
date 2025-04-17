// === modules/curl.js ===
// Lógica específica para el curl de bíceps

import { calcularAngulo, tiempoEnFaseMinimo } from './utils.js';
import { actualizarBarra, mostrarRepeticionVisual } from './ui.js';

let repeticiones = 0;
let tiempoInicioFase = 0;
let haSubidoPerfecto = false;
const sonidoRepeticion = new Audio("assets/audio/rep_ok_voice.mp3");

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

  actualizarBarra(precision);

  const estaEnArribaPerfecto = angulo >= 45 && angulo <= 55;
  const estaEnAbajoPerfecto = angulo >= 145 && angulo <= 160;

  const statusDiv = document.getElementById("status");
  const contadorDiv = document.getElementById("contador");
  const debugDiv = document.getElementById("debug");

  debugDiv.innerHTML = `
    <strong>Ángulo:</strong> ${Math.round(angulo)}°<br>
    <strong>Precisión:</strong> ${precision}%<br>
    <strong>¿Arriba Perfecto?:</strong> ${estaEnArribaPerfecto ? 'Sí' : 'No'}<br>
    <strong>¿Abajo Perfecto?:</strong> ${estaEnAbajoPerfecto ? 'Sí' : 'No'}<br>
    <strong>Subida previa:</strong> ${haSubidoPerfecto ? 'Sí' : 'No'}
  `;

  if (estaEnArribaPerfecto && tiempoEnFaseMinimo(400, tiempoInicioFase)) {
    haSubidoPerfecto = true;
    tiempoInicioFase = Date.now();
    statusDiv.innerText = "Arriba perfecto – ahora baja";
  }

  if (haSubidoPerfecto && estaEnAbajoPerfecto && tiempoEnFaseMinimo(400, tiempoInicioFase)) {
    repeticiones++;
    contadorDiv.innerText = `Reps: ${repeticiones}`;
    mostrarRepeticionVisual();
    sonidoRepeticion.play();
    haSubidoPerfecto = false;
    tiempoInicioFase = Date.now();
    statusDiv.innerText = "¡Repetición contada!";
  }

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