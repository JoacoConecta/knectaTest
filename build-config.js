const fs = require('fs');

// 1. Leemos la configuración del tema (JSON)
let themeOverrides = {};
if (process.env.THEME_CONFIG) {
  try {
    themeOverrides = JSON.parse(process.env.THEME_CONFIG);
  } catch (e) {
    console.error("⚠️ Error: El JSON de THEME_CONFIG no es válido. Se usarán estilos por defecto.");
    // No detenemos el build, simplemente no aplicamos temas custom
  }
}

// 2. Preparamos el objeto de configuración
const configData = {
  cliente: process.env.STORE_NAME || "DEMO",
  apiBase: process.env.API_URL || "/server",
  imagenHero: process.env.HERO_IMAGE || "default.jpg",
  // Inyectamos solo los overrides
  theme: themeOverrides
};

// 3. Generamos el archivo
const fileContent = `
// ⚠️ AUTO-GENERADO
export const CONFIG = ${JSON.stringify(configData, null, 2)};
`;

fs.writeFileSync('./js/config.js', fileContent);
