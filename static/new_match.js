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


const div = document.createElement("div");
const p = document.createElement("p");
const next = document.createElement("button");
next.setAttribute("id", "next");
next.innerText = "Siguiente";
div.appendChild(p);
div.appendChild(next);
document.body.appendChild(div);


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

const display_question = async (tag)  => {
    const question = await fetch_question();
    tag.innerHTML = question.q;
}

var timer = new Timer(function() {
    display_question(p);
}, 3000);

document.querySelector('#next').addEventListener("click", function() {
    display_question(p);
    timer.reset()
});

display_question(p);
timer.start();
