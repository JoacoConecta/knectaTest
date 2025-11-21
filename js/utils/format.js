export function formatearPrecio(valor) {
  const n = Number(valor);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2
  }).format(Number.isFinite(n) ? n : 0);
}

// Reemplaza prefijos ../ o rutas raras que te lleguen del sheet
export function limpiarPath(src = "") {
  return String(src).replace(/^(\.\.\/)+/, "");
}

// Coercea "TRUE"/"FALSE" (string) a booleano
export function boolStr(v) {
  return String(v).toUpperCase() === "TRUE";
}