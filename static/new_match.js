// Utils
function getRandomInt(max) {
    return Math.floor(1 + Math.random() * max);
}

// For Modal
document.querySelector("#triggerModal").style.visibility = 'hidden';
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


// Se guarda id de pregunta para no repetir la misma
queries = [];

// Fetch one question from api
async function fetch_question() {
    try {
        const id = getRandomInt(5);
        while (true) {
            if (queries.includes(id)) {
                id = getRandomInt(5);
            } else {
                break;
            }
        }
        const response = await fetch('http://localhost:5000/api/fetch-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'questionId': id})
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
    myProgress.style.backgroundColor = 'grey';

    var myBar = document.createElement('div');
    myBar.setAttribute('id', 'myBar');
    myBar.style.width = "0%";
    myBar.style.height = "25px";
    myBar.style.backgroundColor = 'green';

    myProgress.appendChild(myBar);
    document.querySelector('#bar-holder').appendChild(myProgress);
    var width = 0.25;
    myBar.style.width = width + "%";
    var barId = setInterval(frame, 30);
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
    const q = document.querySelector('#q');
    question = await fetch_question();
    q.innerHTML = `${question.q}`;
    const answers = question.opt;
    for (let i = 0; i < answers.length; i++) {
        radioAnswers[i].value = answers[i];
        document.querySelector(labels[i]).innerHTML = answers[i];
    }
    progressBar();
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

// Funcionalidad del botón 'enviar'
document.querySelector('#submit').addEventListener("click", () => {
    save_result();
    display_question();
    timer.reset();
});

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
                document.querySelector("#triggerModal").click();
                document.querySelector("#modal-show-result").innerHTML = `Tu puntaje: ${score.score}`;
                document.querySelector("#triggerModal").click();
            }
        } catch (err) {
            alert(err);
        }
    })();
}

// Activar loop de Questions, 15s
var timer = new Timer(function() {
    document.querySelector('#submit').click();
}, 12000); //ms

// Traer primera pregunta haciendo click
document.querySelector('#submit').click();

setTimeout(() => {
    finish_game();
}, 45000);
