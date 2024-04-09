const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

const dbPath = path.join(__dirname, 'moviesData.db')

app.use(express.json())
let db = null

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`Server running at http://localhost:3000`)
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    prcess.exit(1)
  }
}

initilizeDBAndServer()

const convertMovieObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorobjToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//GET API (Return a list of all movie naes in the movie table)

app.get('/movies/', async (request, response) => {
  const getmoviesOf = `
    SELECT 
    movie_name
    FROM 
    movie;
    `
  const movieArray = await db.all(getmoviesOf)
  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//GET API (Return a movie based on the movie id)
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getmoviesOf = `
  SELECT 
    * 
  FROM 
    movie
  WHERE 
    movie_id = ${movieId};
  `
  const movie_info = await db.get(getmoviesOf)
  response.send(convertMovieObjectToResponseObject(movie_info))
})

//POST API  (Creates a new movie in the movie table. movie_id is auto-incremented)

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postmovieQuery = `
    INSERT INTO
      movie_id (director_id, movie_name, lead_actor)
    VALUE 
      ('${directorId}', '${movieName}' '${leadActor}');
  `

  const movies = await db.run(postmovieQuery)
  response.send('Movie Successfully Added')
})

//PUT API (Update the details of a movie in the movie table based on the movie id)

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
  UPDATE 
    movie
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor =  '${leadActor}'
  WHERE 
    movie_id = ${movieId};
  `

  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//DELETE API (Delete a movie from the movie table based on the movie id)

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieArray = `
  DELETE FROM 
    movie_id
  WHERE 
    movie_id = ${movieId};
  `

  await db.run(deleteMovieArray)
  response.send('Movie Removed')
})

//GET API (Return a list of all director in the director table)

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
  SELECT
    * 
  FROM 
    director;`

  const directorArray = await db.all(getDirectorQuery)
  response.send(directorArray.map(e => convertDirectorobjToResponseObject(e)))
})

//GET API (Returns a list of all movie names directed by a specific director)

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieName = `
  SELECT 
    movie_name
  FROM 
    movie
  WHERE 
    director_id = '${directorId}';`

  const movieArray = await db.all(getMovieName)
  response.send(movieArray.map(e => ({movieName: e.movie_name})))
})

module.exports = app;
