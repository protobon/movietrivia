const button = document.getElementById('send');
const fondoanime = document.querySelector(".contenedor-fondo-animado")
const newspaper = document.querySelector(".question")

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

const newspaperSpinning = [
    { transform: 'rotate(-10deg) scale(5)'},
    { transform: 'rotate(0deg) scale(0)'}
  ];
  
  const newspaperTiming = {
    duration: 300,
    iterations: 1,
  }


button.addEventListener('click', () => {
newspaper.animate(newspaperSpinning, newspaperTiming);
  });
  