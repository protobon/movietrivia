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

const labels = ['#first', '#second', '#third', '#fourth'];
var question;

const display_question = async ()  => {
    const q = document.querySelector('#q');
    question = await fetch_question();
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


document.querySelector('#send').addEventListener("click", async () => {
    const radioAnswers = document.getElementsByName('multiple');
    for (let i = 0; i < radioAnswers.length; i++) {
        if (radioAnswers[i].checked) {
            const answer = radioAnswers[i].value;
            const response = await fetch('http://localhost:5000/api/check-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q_id: question.id,
                    answer: answer
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('EXITOOOOOOO!!!!!');
            }
        }
    }
    display_question();
    timer.reset();
});

display_question();
timer.start();
