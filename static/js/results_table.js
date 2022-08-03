export function populateResultsTable(stats) {

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