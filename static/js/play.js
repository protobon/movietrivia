// Utils
function getRandomInt(max) {
    return Math.floor(1 + Math.random() * max);
}

// All questions (id)
const orderQuestions = [...Array(66).keys()]

// function to shuffle the array of questions (id)
function shuffle(array) {
    var i = array.length,
        j = 0,
        temp;

    while (i--) {

        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;

    }

    return array;
}

// All questions (id) in random order
var randQuestions = shuffle(orderQuestions);


// Fetch one question from api
async function fetch_question() {
    try {
        var questionId = randQuestions.pop();
        const response = await fetch('http://localhost:5000/api/fetch-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'questionId': questionId})
        });
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        const question = await response.json();
        return (question);
    } catch (err) {
        alert(err);
    }
}


// Save each question result in Array to calculate at the end.
var results = [];

const save_result = () => {
    for (let i = 0; i < radioAnswers.length; i++) {
        if (radioAnswers[i].checked) {
            results.push([radioAnswers[i].value, question.id]);
            count++;
        }
    }
}


// Fetch score from the game just played
const get_score = async () => {
    const response = await fetch('http://localhost:5000/api/calculate-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(results)
    });
    const result = await response.json();
    return result;
}


// Timer for each question
function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new or original interval, stop current interval
    this.reset = function(newT = t) {
        t = newT;
        return this.stop().start();
    }
}


// Progress Bar
function progressBar() {
    const tmp = document.querySelector('#myBar');
    if (tmp) {
        tmp.remove();
    }

    var myProgress = document.createElement('div');
    myProgress.setAttribute('id', 'myProgress');
    myProgress.style.width = "100%";
    myProgress.style.backgroundColor = 'white';
    myProgress.style.borderRadius = '10px 10px'
    myProgress.style.marginBottom = '10px'

    var myBar = document.createElement('div');
    myBar.setAttribute('id', 'myBar');
    myBar.style.width = "0%";
    myBar.style.height = "25px";
    myBar.style.backgroundColor = '#cbcbcb';
    myBar.style.borderRadius = '10px 10px';
    myBar.style.marginBottom = '10px';
    myProgress.appendChild(myBar);
    document.querySelector('#bar-holder').appendChild(myProgress);
    var width = 0.25;
    myBar.style.width = width + "%";
    var barId = setInterval(frame, 37.5);
    function frame() {
        if (width >= 100) {
            clearInterval(barId);
            return;
        }
        width += 0.25;
        myBar.style.width = width + "%";
    }
}


// Render question and multiple choice answer
const labels = ['#first', '#second', '#third', '#fourth'];
var question;
var count = 0;
var radioAnswers = document.getElementsByName('multiple');

const display_question = async ()  => {
    for (const rb of radioAnswers) {
        rb.checked = false;
    }
    question = null;
    while (question == null) {
        question = await fetch_question();
    }
    const q = document.querySelector('#q');
    q.innerHTML = `${question.q}`;
    const answers = question.opt;
    for (let i = 0; i < answers.length; i++) {
        radioAnswers[i].value = answers[i];
        document.querySelector(labels[i]).innerHTML = answers[i];
    }
    progressBar();
}


// Background Styles Change Color
const fondoanime = document.querySelector(".contenedor-fondo-animado");
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

// Funcionalidad click on respuesta
for (const radio of radioAnswers) {
    radio.onclick = () => {
        save_result();
        display_question();
        timer.reset();
        setBackground();
    }
}

// Funcionalidad al final del juego
const finish_game = async () => {
    timer.stop();
    const score = await get_score();
    (async () => {
        try {
            const response = await fetch('http://localhost:5000/api/history/save', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({"score": score.score})
            });
            const result = await response.json();
            if (result.success == true) {
                // document.querySelector("#modal-show-result").
                //     innerHTML = `Tu puntaje: ${score.score}`;
                document.querySelector("#modal-show-result").
                    appendChild(populateResultsTable(result.stats));
                document.querySelector("#triggerModal").click();
            }
        } catch (err) {
            alert(err);
        }
    })();
}


var timer;

setTimeout(() => {
    display_question();
    document.querySelector('div.preloader').style.display = 'none';
    // Activar loop de Questions, 12s
    timer = new Timer(function() {
        display_question();
    }, 15000); //ms
}, 3000);


setTimeout(() => {
    finish_game();
}, 15000);

//-------------------------------------------------------------------------------------

// For Modal
document.querySelector("#triggerModal").style.display = 'none';
document.querySelector("#play-again").addEventListener("click", () => {
    window.location.reload();
});
document.querySelector("#home").addEventListener("click", () => {
    window.location.href = "http://localhost:5000/home";
});
document.querySelector("#scoreboard").addEventListener("click", () => {
    window.location.href = "http://localhost:5000/scoreboard";
});
document.querySelector("#logout").addEventListener("click", () => {
    window.location.href = "http://localhost:5000/logout";
});

function populateResultsTable(stats) {

    // creates a <table> element and a <tbody> element
    const tbl = document.createElement("table");
    tbl.classList.add("match-results");
    const tblBody = document.createElement("tbody");
    const tblHead = document.createElement("thead");
    const question = document.createElement("th");
    const answer = document.createElement("th");

    tblHead.appendChild(question).
        appendChild(document.createTextNode("Pregunta"));
    tblHead.appendChild(answer).
            appendChild(document.createTextNode("Tu respuesta"));

    tbl.appendChild(tblHead);

    stats.forEach((result) => {
        const row = document.createElement("tr");

        const cellQuestion = document.createElement("td");
        const cellQuestionText = document.createTextNode(`${result.question}`);
        cellQuestion.appendChild(cellQuestionText);
        
        const cellAnswer = document.createElement("td");
        const cellAnswerText = document.createTextNode(`${result.answer}`);
        cellAnswer.appendChild(cellAnswerText);

        row.appendChild(cellQuestion);
        row.appendChild(cellAnswer);

        // add the row to the end of the table body
        tblBody.appendChild(row);
    });

    tbl.appendChild(tblBody);
    return tbl;
}