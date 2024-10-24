const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static("public"))

//All your code goes here
let activeSessions={}
let randWord;
async function check(){
    let response = await fetch("https://random-word-api.vercel.app/api?words=1&length=5")
    let results =await response.json()
    randWord = results[0]
}

server.get("/newgame", function(req,res){
    let newID = uuid.v4()
    let newgame = {
        wordToguess: "chase",
        wrongLetters: [],
        closeLetters: [],
        rightLetters:[],
        remainingGuesses:6,
        gameOver :false
    }
    activeSessions[newID]= newgame
    res.status(201)
    res.send({sessionID: newID})
})
server.get('/gamestate',(req,res) => {
   let sessionID =  req.query.sessionID
    ///////////////////////////////
   res.send({sessionID: newID})
    // if (req.query.sessionID== undefined) {
    //     res.status(404)
    //     }  
    // if (req.query.sessionID == null) {
    //     res.status(400)
    // }  
    //     res.json.stringify(newgame.)
    
)


//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;