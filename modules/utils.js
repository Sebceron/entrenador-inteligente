// === modules/utils.js ===
// Funciones utilitarias para cálculos geométricos y temporales

export function calcularAngulo(a, b, c) {
    const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
    const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
    const magAB = Math.sqrt(ab.x**2 + ab.y**2 + ab.z**2);
    const magCB = Math.sqrt(cb.x**2 + cb.y**2 + cb.z**2);
    return Math.acos(dot / (magAB * magCB)) * (180 / Math.PI);
  }
  
  export function tiempoEnFaseMinimo(ms, inicio) {
    return Date.now() - inicio > ms;
  }