const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3030, () => {
      console.log("server is started on http://localhost:3030/");
    });
  } catch (e) {
    console.log(`Error message ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (eachPlayer) => {
  return {
    player_id: eachPlayer.player_id,
    player_name: eachPlayer.player_name,
    jersey_number: eachPlayer.jersey_number,
    role: eachPlayer.role,
  };
};

//API 1

app.get("/players/", async (request, response) => {
  const getPlayesQuery = `
    select * from cricket_team;`;
  const playersArray = await db.all(getPlayesQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const addPlayerDetails = `
  insert into cricket_team(player_name, jersey_number, role )
  values
  ('${player_name}',${jersey_number},'${role}'),`;
  const player = await db.run(addPlayerDetails);
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
  select * from cricket_team where player_id=${playerId}`;
  const playerDetails = await db.get(getPlayer);
  response.send(convertDbObjectToResponseObject(playerDetails));
});

//API4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { player_name, jersey_number, role } = request.body;
  const updatePlayerQuery = `
    update cricket_team
        SET 
            player_name='${player_name}',
            jersey_number=${jersey_number},
            role='${role}'
        where 
            player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete from cricket_team where player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
