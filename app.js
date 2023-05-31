const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT 
          movie_name
        FROM
          movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMoviesQuery = `
      INSERT INTO
        movie(director_id,movie_name,lead_actor)
      VALUES
        ('${directorId}','${movieName}','${leadActor}');`;

  const addMovie = await db.run(postMoviesQuery);
  response.send("Movie Successfully Added");
});
//to convert to pasCalCase
const convertDbObjectToPascal = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT 
          *
        FROM
          movie
        WHERE 
          movie_id = ${movieId};`;
  const moviesArray = await db.get(getMovieQuery);
  //console.log(movieId);
  response.send(convertDbObjectToPascal(eachMovie));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
      UPDATE 
        movie
      SET
        director_id = ${directorId},
        movie_name = ${movieName},
        lead_actor = ${leadActor}
      WHERE 
        movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
      DELETE FROM
        movie
      WHERE 
        movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// convert director id to pascal
const convertDirectorDetailsToPascal = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT 
          *
        FROM
          director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDetailsToPascal(eachDirector)
    )
  );
});

//convert movie name to pascal
const convertMovieNameToPascal = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
        SELECT 
          movie_name
        FROM
          director INNER JOIN movie
          ON director.director_id = movie.director_id
        WHERE 
          director.director_id = ${directorId}`;
  const directorMoviesArray = await db.all(getDirectorMoviesQuery);
  //console.log(directorMoviesArray);
  response.send(
    directorMoviesArray.map((eachMovieName) =>
      convertMovieNameToPascal(eachMovieName)
    )
  );
});

module.exports = app;
