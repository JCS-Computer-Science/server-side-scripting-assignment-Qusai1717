const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static("public"))

//All your code goes here
let activeSessions={}

// async function check(){
//     let response = await fetch("https://random-word-api.vercel.app/api?words=1&length=5")
//     let results =await response.json()
//     randWord = results[0]
// }

server.get("/newgame", (req,res) => {
    let newID = uuid.v4()
    let newgame = {
        wordToGuess: "chase",
        guesses: [],
        wrongLetters: [],
        closeLetters: [],
        rightLetters:[],
        remainingGuesses:6,
        gameOver:false
        
    }
    activeSessions[newID]= newgame
    res.status(201)
    res.send({sessionID: newID})
})
server.get('/gamestate',(req,res) => {
   let sessionID =  req.query.sessionID
 
    if (!sessionID) {
        res.status(400).send({error: "id is missing"})
    }else if(activeSessions[sessionID]){
               res.status(200).send({gameState:activeSessions[sessionID]})
    } else {
    res.status(404).send({error:"Game doesn't exist"})
}
    }
)

server.post('/guess',(req,res) => { 
    let sessionID =req.body.sessionID
    let userGuess = req.body.guess;
    let session = activeSessions[sessionID]
    let guess = []
    let value = userGuess.split("").toString()
     session.remainingGuesses-= 1
   if (!sessionID) {
        res.status(400).send({error: "Session ID is missing"})
    }
    if(!session) {
        res.status(404).send({error: "Session doesn't exist"})
    }
   
    if (value.length != 5) {
        res.status(400).send({error: "Must be 5 letters"})
    } 
        
    if(activeSessions[sessionID]) {
    let result;
        let realValue = session.wordToGuess.split("")
    for (let i = 0; i < value.length; i++) {
        
        let letter = value[i].toLowerCase()
        if (!letter.match(/[a-z]/)) {
            res.status(400).send({error: "Only takes letters" })
        }

       if (letter == realValue[i]) {

          result = "RIGHT"
          session.rightLetters.push(result) 
        }
        
        for (let j = 0; j <= 5; j++) {
        if(letter== realValue[j]){
            if (i == j) {
               if (session.closeLetters.includes(letter)) {
                let index = session.closeLetters.indexOf(letter)
                session.closeLetters.splice(index,1)
               } 
               session.rightLetters.push(letter)
               result = "RIGHT"
            } else{
                if (!session.closeLetters.includes(letter)) {
                    game.closeLetters.push(letter)
                }
            }


            result = "CLOSE"
            session.closeLetters.push(result) 
        } 
              
        }
        if (result = null) {
            result = "WRONG"
            session.wrongLetters.push(result) 
        }
          
          let obj ={
        value:letter, 
        result: result
        }
         guess.push(obj)
        
         session.guesses.push(guess)
        //  console.log( session.guesses.push(obj))
    }   
    
    
    res.status(201).send({gameState:activeSessions[sessionID]})
    }
   
    }
   

    //else {
    //      res.status(404).send({error: "Session doesn't exist"})
    // }
    

)
// server.delete(/)


//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;