    // === modules/utils.js ===

    export function calcularAngulo(a, b, c) {
        const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
        const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
        const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
        const magAB = Math.sqrt(ab.x**2 + ab.y**2 + ab.z**2);
        const magCB = Math.sqrt(cb.x**2 + cb.y**2 + cb.z**2);
        return Math.acos(dot / (magAB * magCB)) * (180 / Math.PI);
    }
    
    export function distanciaEntre(p1, p2) {
        return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
    }