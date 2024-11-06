const express = require("express");
const uuid = require("uuid");
const server = express();
server.use(express.json());
server.use(express.static("public"));

// All your code goes here
let activeSessions = {};

async function wordGen(){
    let response = await fetch("https://random-word-api.vercel.app/api?words=1&length=5")
    let results =await response.json()
    let randWord = results[0]
    return randWord
}
// async function check(){
//      await fetch ("https://api.dictionaryapi.dev/api/v2/entries/en/" + userGuess)
// }

server.get("/newgame", async(req, res) => {
    let newID = uuid.v4();
    let newgame = {
        wordToGuess: await wordGen(),
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

server.post('/guess', async (req, res) => {
    let sessionID = req.body.sessionID;
    let userGuess = req.body.guess;
    let r = await fetch ("https://api.dictionaryapi.dev/api/v2/entries/en/" + userGuess)
    let resuls =await r.json()
    if(resuls.title === "No Definitions Found"){
        return res.status(400).send({error: "Not a real word"})
    }
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

    
       
    
    
    for(let i = 0; i < userGuess.length; i++) {
        let letter = userGuess[i].toLowerCase();
        let correctness = "WRONG";
        if (!letter.match(/[a-z]/)) {
            res.status(400).send({error: "must contain letters"})
        }
        if (letter === realValue[i]) {
            correctness = "RIGHT";
            if (!session.rightLetters.includes(letter)) {
                session.rightLetters.push(letter);
            }
            if (session.closeLetters.includes(letter)) {
                let index = session.closeLetters.indexOf(letter)
                session.closeLetters.splice(index,1)
            }
           
        } 
        
        else if (realValue.includes(letter)) {
            correctness = "CLOSE";
            if (!session.closeLetters.includes(letter) && !session.rightLetters.includes(letter)) {
                session.closeLetters.push(letter);
            }

        } 
        // if not than it hass to be wrong
        else {
            if (!session.wrongLetters.includes(letter)) {
                session.wrongLetters.push(letter);
            }
        }

        guess.push({ value: letter, result: correctness });
    }

    session.guesses.push(guess);

    
    if (userGuess === session.wordToGuess) {
        session.gameOver = true;
    } else if (session.remainingGuesses <= 0) {
        session.gameOver = true;
    }

    res.status(201).send({ gameState: session });

});

server.delete('/reset', (req,res) => {
    let ID = req.query.sessionID;
    if (!ID) {
        res.status(400).send({error: "id is missing" });
        return;
    }
    if (activeSessions[ID]) {
        activeSessions[ID] = {
            wordToGuess:undefined,
            guesses:[],
            wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
        };
        res.status(200).send({gameState: activeSessions[ID]});

    } 
    if (!activeSessions) {
        res.status(404).send({gameState: activeSessions[ID]})
    }
        
    
}
)
server.delete("/delete", (req,res)=> {
    let sessionId = req.query.sessionID;
    if (!sessionId) {
        res.status(400).send({error: "Id is missing"})
    }
    if (activeSessions[sessionId]) {
        delete activeSessions[sessionId]
        res.status(204).send({ error: "Id is missing"})
    }else {
        res.status(404).send({error: "Session dont exist"})
    }
})
server.get("/hint", async(req,res)=>{
    let sessionId = req.query.sessionID
    if (!sessionId) {
        res.status(400).send({error: "Id is missing"})
    }else
    if (!activeSessions[sessionId]) {
        res.status(404).send({error: "Session does not exist"})
    }else{
        let resp = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + userGuess)
        let reslts = await resp.json()
        let def= reslts[0].meanings.definitions[0].definition
        return def
    }
})
// Do not remove this line. This allows the test suite to start
// multiple instances of your server on different ports
module.exports = server;
