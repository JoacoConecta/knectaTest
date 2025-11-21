const botonFixed = document.getElementById("whatsapp");
const numero = "5492235931153";
const mensaje="wachinn";

botonFixed.addEventListener('click',()=>{
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
});
