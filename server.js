'use strict'

// express is an npm package for node https://www.npmjs.com/package/express this makes it possible for this server to listen to specific queries
//made from the specified port and other things such as .use() method to set the headers to avoid cors issues.


const express = require('express')
// assign express() to variable app
const app = express()
// if port is not specified used whatever defaulted port or 3000
const port = process.env.PORT || 8000
// set the port to express so that at the very bottom it can listen to it
app.set('port', port)
// installed node-fetch because request is deprecated
const fetch = require('node-fetch');

// MIDDLEWARE (transform stream): allows data to be received by app with no CORS errors.
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// use both SuperHero Search API and Marvel Comics API to retrieve specific data from both:
// the /api/getCharacter endpoint below is similar to how a controller method/class works in C#/.NET that will receive the passcode query
// from the front-end (apiManager) and makes the call directly to the API:
app.get('/api/getCharacter', (req, res) => {
    const rapidHeroApiUrl = `https://superhero-search.p.rapidapi.com/api/?hero=${req.query.characterName}`
    fetch(`${rapidHeroApiUrl}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": "e12f972de0msh5f3353dde969f09p1be95bjsna98e93807839",
        "x-rapidapi-host": "superhero-search.p.rapidapi.com",
        "Accept": '*/*'
      },
  })
  .then((response) => response.json())
    .then((heroApiData) => {
      const marvelApiUrl = `https://gateway.marvel.com/v1/public/characters?nameStartsWith=${heroApiData.name}&apikey=${req.query.publicKey}&hash=${req.query.hash}`
      fetch(`${marvelApiUrl}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Referer": "https://developer.marvel.com/",
          "Accept": '*/*'
        }
    })
    .then((response2) => response2.json())
      .then((marvelApiData) => {
        return res.send([heroApiData, marvelApiData])
      });
    });
});


// GET RANDOM
// the /api/getRandomCharacters endpoint below is similar to how a controller method/class works in C#/.NET that will receive the passcode query
// from the front-end and makes the call directly to the API:
app.get('/api/getRandomCharacters', (req, res) => {
  const baseUrl = `https://superhero-search.p.rapidapi.com/api`
  fetch(`${baseUrl}/heroes`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": "e12f972de0msh5f3353dde969f09p1be95bjsna98e93807839",
      "x-rapidapi-host": "superhero-search.p.rapidapi.com",
      "Accept": '*/*'
    },
})
.then((response) => response.json())
  .then((randomHeroesData) => {
    fetch(`${baseUrl}/villains`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": "e12f972de0msh5f3353dde969f09p1be95bjsna98e93807839",
        "x-rapidapi-host": "superhero-search.p.rapidapi.com",
        "Accept": '*/*'
      },
})
  .then((response2) => response2.json())
    .then((randomVillainsData) => {
      let randomMarvelCharacters = [];
      randomHeroesData.filter((randomHero) => {
          // ensures data retrieved are Marvel characters only and not from other publishers:
        if (randomHero.biography.publisher === "Marvel Comics" || randomHero.biography.publisher === "Anti-Vision") {
          randomMarvelCharacters.push(randomHero);
        };
      });
      randomVillainsData.filter((randomVillain) => {
           // ensures data retrieved are Marvel characters only and not from other publishers:
        if (randomVillain.biography.publisher === "Marvel Comics" || randomVillain.biography.publisher === "Anti-Vision") {
          randomMarvelCharacters.push(randomVillain);
        };
      });
      return res.send(randomMarvelCharacters);
    });
  });
});


// here express is listening to the port for those passcode queries example: /api/getCharacter
app.listen(port, () =>
  console.log(`Listening on port: ${port}`)
)