const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const statusDiv = document.getElementById('status');
const exerciseSelector = document.getElementById('exerciseSelector');

// Inicializar MediaPipe Pose
const pose = new Pose.Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
pose.onResults(onResults);

// Acceso a cámara
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  videoElement.srcObject = stream;
});







function calcularAngulo(a, b, c) {
    const angulo = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    return Math.abs((angulo * 180) / Math.PI);
  }
  
  function onResults(results) {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
    if (results.poseLandmarks) {
      const lm = results.poseLandmarks;
  
      // Ejemplo: Curl de bíceps derecho
      const hombro = lm[12]; // RIGHT_SHOULDER
      const codo = lm[14];   // RIGHT_ELBOW
      const muñeca = lm[16]; // RIGHT_WRIST
  
      const angulo = calcularAngulo(hombro, codo, muñeca);
      let color = 'green';
      let mensaje = "¡Bien hecho!";
  
      if (angulo < 30 || angulo > 160) {
        color = 'red';
        mensaje = "Corrige el ángulo del codo";
      }
  
      canvasCtx.beginPath();
      canvasCtx.arc(codo.x * canvasElement.width, codo.y * canvasElement.height, 10, 0, 2 * Math.PI);
      canvasCtx.fillStyle = color;
      canvasCtx.fill();
  
      statusDiv.innerText = `${mensaje} (Ángulo: ${Math.round(angulo)}°)`;
      drawConnectors(canvasCtx, lm, Pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
    }
  
    canvasCtx.restore();
  }
