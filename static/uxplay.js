const button = document.getElementById('submit');
const fondoanime = document.querySelector(".contenedor-fondo-animado")
const generateRandomcolor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const rgbColor = `rgb(${r},${g},${b})`;
    return rgbColor;
};

const setBackground = () => {
    const newColor = generateRandomcolor();
    fondoanime.style.background = newColor;
}


button.addEventListener("click", setBackground);
