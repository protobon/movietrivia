CREATE TABLE history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid INT NOT NULL,
    username VARCHAR(250) NOT NULL,
    score INT NOT NULL,
    playedAt DATETIME NOT NULL
)