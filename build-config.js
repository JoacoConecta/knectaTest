// build-config.js
const fs = require('fs');

// 1. Lees las variables de entorno (definidas en Netlify)
const configData = {
  cliente: process.env.STORE_NAME || "DEMO",
  apiBase: process.env.API_URL || "/server",
  imagenHero: process.env.HERO_IMAGE || "default.jpg",
  // Para listas, asumimos que en Netlify la variable viene como string separado por comas
  // Ejemplo en Netlify: "style1.css,style2.css"
  estilosExtra: process.env.EXTRA_STYLES ? process.env.EXTRA_STYLES.split(',') : []
};

// 2. Creas el contenido del archivo JS
// Usamos JSON.stringify para que formatee arrays y strings automáticamente sin errores de sintaxis
const fileContent = `
// ⚠️ ESTE ARCHIVO SE GENERA AUTOMÁTICAMENTE EN EL BUILD. NO EDITAR.
export const CONFIG = ${JSON.stringify(configData, null, 2)};
`;

// 3. Escribes el archivo en tu carpeta de JS
fs.writeFileSync('./js/config.js', fileContent);

console.log("✅ Configuración generada exitosamente en js/config.js");
console.log(configData);