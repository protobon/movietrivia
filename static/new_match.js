async function fetch_question() {
    try {
        const response = await fetch('http://localhost:5000/api/fetch-question');
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        const question = await response.json();
        return (question);
    } catch (err) {
        console.log(err);
    }
}


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

// Render question and multiple choice answer
const labels = ['#first', '#second', '#third', '#fourth'];
var question;
var count = 0;
var radioAnswers = document.getElementsByName('multiple');

const display_question = async ()  => {
    const q = document.querySelector('#q');
    question = await fetch_question();
    q.innerHTML = `${question.q}`;
    const answers = question.opt;
    for (let i = 0; i < answers.length; i++) {
        radioAnswers[i].value = answers[i];
        document.querySelector(labels[i]).innerHTML = answers[i];
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
    alert(result.score);
    return result;
}


document.querySelector('#send').addEventListener("click", () => {
    save_result();
    if (count === 5) {
        timer.stop();
        finish_game();
    } else {
        display_question();
        timer.reset();
    }
});

const finish_game = () => {
    get_score();
}

var timer = new Timer(function() {
    document.querySelector('#send').click();
}, 5000);


document.querySelector('#send').click();
