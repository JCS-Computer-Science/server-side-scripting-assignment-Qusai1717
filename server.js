const express = require("express");
const uuid = require("uuid");
const server = express();
server.use(express.json());
server.use(express.static("public"));

// All your code goes here
let activeSessions = {};

// async function check(){
//     let response = await fetch("https://random-word-api.vercel.app/api?words=1&length=5")
//     let results =await response.json()
//     randWord = results[0]
// }

server.get("/newgame", (req, res) => {
    let newID = uuid.v4();
    let newgame = {
        wordToGuess: "chase",
        guesses: [],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
    };
    activeSessions[newID] = newgame;
    res.status(201).send({ sessionID: newID });
});

server.get('/gamestate', (req, res) => {
    let sessionID = req.query.sessionID;

    if (!sessionID) {
        return res.status(400).send({ error: "Session ID is missing" });
    } else if (activeSessions[sessionID]) {
        return res.status(200).send({ gameState: activeSessions[sessionID] });
    } else {
        return res.status(404).send({ error: "Game doesn't exist" });
    }
});

server.post('/guess', (req, res) => {
    let sessionID = req.body.sessionID;
    let userGuess = req.body.guess;

    if (!sessionID) {
        return res.status(400).send({ error: "Session ID is missing" });
    }
    let session = activeSessions[sessionID];
    if (!session) {
        return res.status(404).send({ error: "Session doesn't exist" });
    }
    if (userGuess.length !== 5) {
        return res.status(400).send({ error: "Guess must be 5 letters" });
    }

    let realValue = session.wordToGuess.split("");
    let guess = [];
    session.remainingGuesses -= 1;

    
    for (let i = 0; i < userGuess.length; i++) {
        let letter = userGuess[i].toLowerCase();
        let result = "WRONG";

        
        if (letter === realValue[i]) {
            result = "RIGHT";
            if (!session.rightLetters.includes(letter)) {
                session.rightLetters.push(letter);
            }
        } 
        
        else if (realValue.includes(letter)) {
            result = "CLOSE";
            if (!session.closeLetters.includes(letter)) {
                session.closeLetters.push(letter);
            }
        } 
        // Otherwise, it hass to be wrong
        else {
            if (!session.wrongLetters.includes(letter)) {
                session.wrongLetters.push(letter);
            }
        }

        guess.push({ value: letter, result });
    }

    session.guesses.push(guess);

    
    if (userGuess === session.wordToGuess) {
        session.gameOver = true;
    } else if (session.remainingGuesses <= 0) {
        session.gameOver = true;
    }

    res.status(201).send({ gameState: session });
});

// server.delete(/)

// Do not remove this line. This allows the test suite to start
// multiple instances of your server on different ports
module.exports = server;
