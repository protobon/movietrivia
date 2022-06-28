async function fetch_question() {
    try {
        const response = await fetch('http://localhost:5000/api/fetch-question');
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        const question = await response.json();
        console.log(question);
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

const labels = ['#first', '#second', '#third', '#fourth'];

const display_question = async ()  => {
    const q = document.querySelector('#q');
    const question = await fetch_question();
    q.innerHTML = `${question.q}`;
    const answers = question.opt;
    let show_answers = document.getElementsByName('multiple');
    for (let i = 0; i < answers.length; i++) {
        show_answers[i].value = answers[i];
        document.querySelector(labels[i]).innerHTML = answers[i];
    }
}

var timer = new Timer(function() {
    display_question();
}, 8000);

document.querySelector('#next').addEventListener("click", function() {
    display_question();
    timer.reset()
});

display_question();
timer.start();
