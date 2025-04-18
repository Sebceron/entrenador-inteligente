// === ELEMENTOS DOM ===
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const hiddenCanvas = document.getElementById('hiddenCanvas');
const canvasCtx = canvasElement.getContext('2d');
const hiddenCtx = hiddenCanvas.getContext('2d');
const statusDiv = document.getElementById('status');
const contadorDiv = document.getElementById('contador');
const porcentajeDiv = document.getElementById('porcentaje');
const debugDiv = document.getElementById('debug');

// === ESTADO GLOBAL ===
let repeticiones = 0;
let haSubidoPerfecto = false;
let tiempoInicioFase = 0;
let posicionInicialDetectada = false;
let posicionCodoInicial = null;

// === AUDIO ===
const sonidoRepeticion = new Audio("assets/Audio/rep_ok_voice.mp3");

// === FUNCIONES BASE ===
function tiempoEnFaseMinimo(ms = 400) {
  return Date.now() - tiempoInicioFase > ms;
}

function calcularAngulo(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);
  return Math.acos(dot / (magAB * magCB)) * (180 / Math.PI);
}

function actualizarBarra(precision) {
  const relleno = document.getElementById("relleno");
  const porcentaje = document.getElementById("porcentaje");

  relleno.style.width = `${precision}%`;
  porcentaje.innerText = `${precision}%`;

  if (precision >= 90) {
    relleno.style.backgroundColor = "#00ff44";
    relleno.style.boxShadow = "0 0 12px #00ff44";
  } else if (precision >= 75) {
    relleno.style.backgroundColor = "#ffaa00";
    relleno.style.boxShadow = "0 0 12px #ffaa00";
  } else if (precision >= 60) {
    relleno.style.backgroundColor = "#ff7700";
    relleno.style.boxShadow = "0 0 12px #ff7700";
  } else {
    relleno.style.backgroundColor = "#ff1a1a";
    relleno.style.boxShadow = "0 0 12px #ff1a1a";
  }
}

function mostrarRepeticionVisual() {
  const rep = document.createElement("div");
  rep.innerText = `+${repeticiones}`;
  rep.className = "repeticion-float";
  document.body.appendChild(rep);

  setTimeout(() => {
    rep.style.opacity = "0";
    rep.style.transform = "translate(-50%, -120%) scale(1.3)";
  }, 50);

  setTimeout(() => rep.remove(), 1500);
}

function detectarCurl(lm) {
  const hombro = lm[11];
  const codo = lm[13];
  const muneca = lm[15]; // ← corrección nombre

  const angulo = calcularAngulo(hombro, codo, muneca);
  let precision = 0;

  if (angulo >= 45 && angulo <= 55) precision = 100;
  else if (angulo > 55 && angulo <= 140) precision = 85;
  else if (angulo > 30 && angulo <= 150) precision = 60;
  else precision = 25;

  actualizarBarra(precision);

  const estaEnArribaPerfecto = angulo >= 40 && angulo <= 65;
  const estaEnAbajoPerfecto = angulo >= 145 && angulo <= 160;

  if (!posicionInicialDetectada && estaEnAbajoPerfecto && precision >= 60) {
    posicionInicialDetectada = true;
    posicionCodoInicial = { x: codo.x, y: codo.y };
    statusDiv.innerText = "¡Posición inicial detectada! Puedes comenzar.";
    statusDiv.classList.add("actualizado");
    setTimeout(() => statusDiv.classList.remove("actualizado"), 400);
    return;
  }

  if (!posicionInicialDetectada) {
    statusDiv.innerText = "Ubícate con el brazo extendido para iniciar.";
    return;
  }

  let movimientoCodo = 0;
  let tecnicaValida = true;

  if (posicionCodoInicial) {
    const dx = Math.abs(codo.x - posicionCodoInicial.x);
    const dy = Math.abs(codo.y - posicionCodoInicial.y);
    movimientoCodo = Math.sqrt(dx * dx + dy * dy);
    if (movimientoCodo > 0.08) tecnicaValida = false;
  }

  debugDiv.innerHTML = `
    <strong>Ángulo:</strong> ${Math.round(angulo)}°<br>
    <strong>Precisión:</strong> ${precision}%<br>
    <strong>¿Arriba Perfecto?:</strong> ${estaEnArribaPerfecto ? 'Sí' : 'No'}<br>
    <strong>¿Abajo Perfecto?:</strong> ${estaEnAbajoPerfecto ? 'Sí' : 'No'}<br>
    <strong>Movimiento codo:</strong> ${movimientoCodo.toFixed(3)}<br>
    <strong>Técnica válida:</strong> ${tecnicaValida ? 'Sí' : 'No'}<br>
    <strong>Estado subida previa:</strong> ${haSubidoPerfecto ? 'Sí' : 'No'}
  `;

  // Subida
  if (estaEnArribaPerfecto && tecnicaValida && tiempoEnFaseMinimo(400)) {
    haSubidoPerfecto = true;
    tiempoInicioFase = Date.now();
    statusDiv.innerText = "Subida perfecta – ahora baja";
    statusDiv.classList.add("actualizado");
    setTimeout(() => statusDiv.classList.remove("actualizado"), 400);
  }

  // Bajada
  if (haSubidoPerfecto && estaEnAbajoPerfecto && tecnicaValida && tiempoEnFaseMinimo(400)) {
    repeticiones++;
    contadorDiv.innerText = `Reps: ${repeticiones}`;
    mostrarRepeticionVisual();
    sonidoRepeticion.play();
    statusDiv.innerText = "¡Repetición contada!";
    statusDiv.classList.add("actualizado");
    setTimeout(() => statusDiv.classList.remove("actualizado"), 400);
    haSubidoPerfecto = false;
    tiempoInicioFase = Date.now();
  }

  // Visual feedback en el codo
  let color = "#ff1a1a";
  if (precision >= 90 && tecnicaValida) color = "#00ff44";
  else if (precision >= 75 && tecnicaValida) color = "#ffaa00";
  else if (precision >= 60 && tecnicaValida) color = "#ff7700";

  canvasCtx.beginPath();
  canvasCtx.arc(codo.x * canvasElement.width, codo.y * canvasElement.height, 16, 0, 2 * Math.PI);
  canvasCtx.fillStyle = color;
  canvasCtx.shadowColor = color;
  canvasCtx.shadowBlur = 15;
  canvasCtx.fill();
}

// === PROCESAR RESULTADOS DE MEDIA PIPE ===
function onResults(results) {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    const lm = results.poseLandmarks;

    // Validación: cuerpo visible con buena confianza
    const cuerpoVisible = lm[11].visibility > 0.6 && lm[13].visibility > 0.6 && lm[15].visibility > 0.6;

    if (!cuerpoVisible) {
      statusDiv.innerText = "No se detecta bien el cuerpo – acércate o mejora la luz.";
      actualizarBarra(0);
      haSubidoPerfecto = false;
      posicionInicialDetectada = false;
      return;
    }

    detectarCurl(lm);

    // Conexiones del esqueleto
    drawConnectors(canvasCtx, lm, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 2
    });

  } else {
    statusDiv.innerText = "Esperando detección...";
    actualizarBarra(0);
    haSubidoPerfecto = false;
    posicionInicialDetectada = false;
  }

  canvasCtx.restore();
}

// === CONFIGURAR MODELO MEDIA PIPE POSE ===
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

// === INICIAR CÁMARA Y LOOP ===
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  videoElement.srcObject = stream;

  videoElement.onloadedmetadata = () => {
    videoElement.play();

    // Ocultar loader una vez la cámara esté activa
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";

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
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
});