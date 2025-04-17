// === ELEMENTOS DOM ===
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const hiddenCanvas = document.getElementById('hiddenCanvas');
const canvasCtx = canvasElement.getContext('2d');
const hiddenCtx = hiddenCanvas.getContext('2d');
const statusDiv = document.getElementById('status');
const contadorDiv = document.getElementById('contador');
const porcentajeDiv = document.getElementById('porcentaje');
const exerciseSelector = document.getElementById('exerciseSelector');
const debugDiv = document.getElementById('debug');

// === ESTADO GLOBAL ===
let repeticiones = 0;
let tiempoInicioFase = 0;
let haSubidoPerfecto = false;
const sonidoRepeticion = new Audio("rep_ok_voice.mp3");

// === TIEMPO MÍNIMO ENTRE FASES ===
function tiempoEnFaseMinimo(ms = 300) {
  return Date.now() - tiempoInicioFase > ms;
}

// === CALCULAR ÁNGULO ENTRE 3 PUNTOS ===
function calcularAngulo(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const magAB = Math.sqrt(ab.x**2 + ab.y**2 + ab.z**2);
  const magCB = Math.sqrt(cb.x**2 + cb.y**2 + cb.z**2);
  return Math.acos(dot / (magAB * magCB)) * (180 / Math.PI);
}

// === ACTUALIZAR BARRA DE TÉCNICA ===
function actualizarBarra(precision) {
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

// === MOSTRAR "+1" VISUAL ===
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

// === DETECCIÓN CURL BÍCEPS ===
function detectarCurl(lm) {
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

  debugDiv.innerHTML = `
    <strong>Ángulo:</strong> ${Math.round(angulo)}°<br>
    <strong>Precisión:</strong> ${precision}%<br>
    <strong>¿Arriba Perfecto?:</strong> ${estaEnArribaPerfecto ? 'Sí' : 'No'}<br>
    <strong>¿Abajo Perfecto?:</strong> ${estaEnAbajoPerfecto ? 'Sí' : 'No'}<br>
    <strong>Estado subida previa:</strong> ${haSubidoPerfecto ? 'Sí' : 'No'}
  `;

  if (estaEnArribaPerfecto && tiempoEnFaseMinimo(400)) {
    haSubidoPerfecto = true;
    tiempoInicioFase = Date.now();
    statusDiv.innerText = "Arriba perfecto – ahora baja";
  }

  if (haSubidoPerfecto && estaEnAbajoPerfecto && tiempoEnFaseMinimo(400)) {
    repeticiones++;
    contadorDiv.innerText = `Reps: ${repeticiones}`;
    mostrarRepeticionVisual();
    sonidoRepeticion.play();
    haSubidoPerfecto = false;
    tiempoInicioFase = Date.now();
    statusDiv.innerText = "¡Repetición contada!";
  }

  // === CÍRCULO VISUAL EN CODO SEGÚN PRECISIÓN ===
  let color = "#ff1a1a";
  if (precision >= 90) color = "#00ff44";
  else if (precision >= 70) color = "#ffaa00";

  canvasCtx.beginPath();
  canvasCtx.arc(codo.x * canvasElement.width, codo.y * canvasElement.height, 16, 0, 2 * Math.PI);
  canvasCtx.fillStyle = color;
  canvasCtx.shadowColor = color;
  canvasCtx.shadowBlur = 15;
  canvasCtx.fill();
}

// === PROCESAR RESULTADOS DE POSE ===
function onResults(results) {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    detectarCurl(results.poseLandmarks);
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 2
    });
  } else {
    statusDiv.innerText = "No se detecta cuerpo.";
  }

  canvasCtx.restore();
}

// === CONFIGURAR MEDIA PIPE POSE ===
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);

// === INICIAR CÁMARA Y LOOP OCULTO ===
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  videoElement.srcObject = stream;

  videoElement.onloadedmetadata = () => {
    videoElement.play();

    const loop = async () => {
      hiddenCanvas.width = videoElement.videoWidth;
      hiddenCanvas.height = videoElement.videoHeight;
      hiddenCtx.drawImage(videoElement, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
      await pose.send({ image: hiddenCanvas });
      requestAnimationFrame(loop);
    };

    loop();
  };
}).catch((err) => {
  alert("Error accediendo a la cámara: " + err.message);
});
