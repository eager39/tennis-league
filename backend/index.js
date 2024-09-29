var express = require("express");
var fs = require("fs");

const https = require("https");

const options = {
  key: fs.readFileSync("cert/key.pem"), //Change Private Key Path here
  cert: fs.readFileSync("cert/certificate.pem"), //Change Main Certificate Path here
  //Change Intermediate Certificate Path here
};
// To enable HTTPS
//var app = module.exports = express({key: privateKey, cert: certificate});
const mysql = require("mysql2");
const app = express();
app.enable("trust proxy");
const cors = require("cors");
const bodyParser = require("body-parser");

const pdfparse = require("pdf-parse");

const axios = require("axios");
const path = require("path");
const moment = require("moment"); // Use moment.js for date manipulation
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
app.use(cors());
app.use(bodyParser.json());
var getIP = require("ipware")().get_ip;
app.use(function (req, res, next) {
  var ipInfo = getIP(req);
  console.log(ipInfo);
  // { clientIp: '127.0.0.1', clientIpRoutable: false }
  next();
});
// Create MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Replace with your MySQL root password
  database: "tennis_league_local",
});
https.createServer(options, app).listen(8443, function (req, res) {
  console.log(res); //Change Port Number here (if required, 443 is the standard port for https)
  console.log("Server started at port 3000");
});
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
});

// Utility function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get("/deadline", async (req, res) => {
  updateScheduleWithDates();
  res.json(true);
});
app.get("/getSeasons", async (req, res) => {
  const query = `
    SELECT 
       *
    FROM 
        season
`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching seasons:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching matches" });
      return;
    }
    res.json(results);
  });
});

app.get("/getMyMatches", (req, res) => {

  const userid = req.query.id;
  const season = req.headers.season;
console.log(userid)
  // Updated query to fetch player details from both players_season and players tables
  const query = `
      SELECT *, 
    s.id,
    ps_home.player_id AS home_player_id,
    hp.name AS home_player,
    ps_away.player_id AS away_player_id,
    ap.name AS away_player,
    s.result,
    ps_home.league_id,
    s.week,
    s.deadline
FROM 
    schedule s
JOIN 
    players_season ps_home ON s.home_player = ps_home.id
JOIN 
    players hp ON ps_home.player_id = hp.id
JOIN 
    players_season ps_away ON s.away_player = ps_away.id
JOIN 
    players ap ON ps_away.player_id = ap.id
WHERE 
    (hp.user_id=? or ap.user_id=?)
    AND ps_home.season_id = ?
ORDER BY 
    s.week;
        `;

  // Execute query with the userid and season passed for both home and away players
  connection.query(query, [userid, userid, season], (err, data) => {
    if (err) {
      console.error("Error fetching matches:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching matches" });
      return;
    }

    // Return the data or message if no matches found
    if (data.length == 0) {
      res.json({ message: "No matches found in the league for the user." });
    } else {
        console.log(data)
      res.json(data);
    }
  });
});

// Function to generate the round-robin schedule
function generateRoundRobinSchedule(playerIds) {
  const numPlayers = playerIds.length;
  if (numPlayers % 2 !== 0) {
    playerIds.push(null); // Add a dummy player if odd number of players
  }

  const schedule = [];
  const totalRounds = numPlayers - 1;
  const matchesPerRound = numPlayers / 2;

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches = [];
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (numPlayers - 1);
      const away = (numPlayers - 1 - match + round) % (numPlayers - 1);
      if (match == 0) {
        roundMatches.push([playerIds[home], playerIds[numPlayers - 1]]);
      } else {
        roundMatches.push([playerIds[home], playerIds[away]]);
      }
    }
    schedule.push(roundMatches);
  }

  return schedule;
}

// Function to ensure home and away alternation
function assignHomeAway(schedule) {
  const homeAwayMap = new Map();
  const updatedSchedule = [];

  schedule.forEach((round, roundIndex) => {
    const roundMatches = [];
    round.forEach((match) => {
      const [home, away] = match;

      if (home == null || away == null) {
        // Skip matches with dummy players
        return;
      }

      if (!homeAwayMap.has(home)) homeAwayMap.set(home, "home");
      if (!homeAwayMap.has(away)) homeAwayMap.set(away, "away");

      const homeLastWeek = homeAwayMap.get(home);
      const awayLastWeek = homeAwayMap.get(away);

      if (homeLastWeek == "home") {
        roundMatches.push([away, home]);
        homeAwayMap.set(home, "away");
        homeAwayMap.set(away, "home");
      } else {
        roundMatches.push([home, away]);
        homeAwayMap.set(home, "home");
        homeAwayMap.set(away, "away");
      }
    });
    updatedSchedule.push(roundMatches);
  });

  return updatedSchedule;
}
// Function to generate a random tennis score

const leagueStartDate = new Date("2024-05-19");

// Helper function to calculate the deadline
function calculateDeadline(week) {
  const leagueStartDate = new Date("2024-05-19"); // Adjust the start date if necessary
  const deadlineDate = new Date(leagueStartDate);
  deadlineDate.setDate(deadlineDate.getDate() + week * 7); // Add 7 days per week

  // Return the epoch time (timestamp in milliseconds)
  return deadlineDate.getTime();
}
// Endpoint to parse PDFs
app.get("/parsepdfmoski", async (req, res) => {
  const url = "http://www.tenis-radgona.si/images/stories/liga_2024/";
  let dataBuffer = "";

  for (let i = 1; i < 16; i++) {
    try {
      const config = {
        method: "get",
        url: `${url}${i}_kolo_objava.pdf`,
        responseType: "arraybuffer",
      };

      console.log(`Fetching ${i}.pdf...`);
      const response = await axios(config);

      dataBuffer = Buffer.from(response.data);
      console.log(`${i}.pdf fetched successfully!`);
    } catch (error) {
      console.error(`Failed to fetch ${i}.pdf:`, error);
      continue; // Skip to the next iteration if fetching fails
    }

    // Process the PDF data
    pdfparse(dataBuffer)
      .then(async function (data) {
        const lines = data["text"]
          .split("\n")
          .filter((line) => line.trim() !== "");
        console.log(lines);
        const results = [];
        let currentLeague = "";
        let currentWeek = "";
        console.log(lines);
        lines.forEach((line) => {
          const leagueMatch = line.match(/^(\d+ liga|[^\d].* liga)/);
          const weekMatch = line.match(/^Rezultati\s*(\d+)\s*kolo/);

          if (weekMatch) {
            currentWeek = weekMatch[1];
          }

          if (leagueMatch) {
            currentLeague = leagueMatch[0].trim();
          } else {
            const matchDetails = line.match(
              /^([^:]+):([^0-9]+)([\d:]+(?:[\d:]+)*)$/
            );
            if (matchDetails) {
              const homePlayer = matchDetails[1].trim();
              const awayPlayer = matchDetails[2].trim();
              let sets = matchDetails[3];

              sets = sets
                .replace(/:/g, "-")
                .replace(/(\d-\d)(?=\d-\d)/g, "$1,");
              if (sets == "0-0,0-0,0-0") {
                sets = ["No result"];
              } else {
                sets = sets
                  .split(",")
                  .map((set) => set.trim())
                  .filter((set) => !/^0-0$/.test(set));
              }

              if (sets.length > 0) {
                results.push({
                  league: currentLeague,
                  week: currentWeek,
                  homePlayer,
                  awayPlayer,
                  sets,
                  deadline: calculateDeadline(currentWeek), // Calculate deadline
                });
              }
            }
          }
        });

        await insertScheduleWithResults(results);
      })
      .catch((error) => {
        console.error(`Failed to parse PDF data:`, error);
      });
  }

  res.json("success");

  // Function to insert results into the schedule table
  async function insertScheduleWithResults(parsedResults) {
    for (const result of parsedResults) {
      const { league, week, homePlayer, awayPlayer, sets, deadline } = result;
      const resultStr = sets.join(",");

      // Fetch league and season IDs
      const leagueId = await getLeagueIdByName(league);
      const seasonId = await getSeasonIdByName("2024");

      if (!leagueId || !seasonId) {
        console.error(
          `League or Season not found: League = ${league}, Season = 2024`
        );
        continue;
      }

      // Fetch player IDs from the players table
      const homePlayerId = await getPlayerId(homePlayer);
      const awayPlayerId = await getPlayerId(awayPlayer);

      if (homePlayerId && awayPlayerId) {
        // Insert players into player_season for the 2024 season and current league
        await insertPlayerSeason(homePlayerId, leagueId, seasonId);
        await insertPlayerSeason(awayPlayerId, leagueId, seasonId);

        // Retrieve players_season IDs for the home and away players
        const homePlayerSeasonId = await getPlayerSeasonId(
          homePlayerId,
          leagueId,
          seasonId
        );
        const awayPlayerSeasonId = await getPlayerSeasonId(
          awayPlayerId,
          leagueId,
          seasonId
        );

        if (homePlayerSeasonId && awayPlayerSeasonId) {
          // Insert match into schedule
          const insertQuery = `
                        INSERT INTO schedule (home_player, away_player, result, week, deadline)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                        result = CASE 
                            WHEN result = 'No result' THEN VALUES(result) 
                            ELSE result 
                        END,  
                        week = VALUES(week), 
                        deadline = VALUES(deadline);`;
          console.log(homePlayer, awayPlayer, resultStr);
          const queryParams = [
            homePlayerSeasonId,
            awayPlayerSeasonId,
            resultStr,
            week,
            deadline,
          ];
          console.log(queryParams);
          try {
            await new Promise((resolve, reject) => {
              connection.query(insertQuery, queryParams, (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              });
            });
          } catch (error) {
            console.error(
              `Error inserting match for ${homePlayer} vs ${awayPlayer}:`,
              error
            );
          }
        } else {
          console.error(
            `PlayerSeason ID not found for ${homePlayer} or ${awayPlayer}`
          );
        }
      } else {
        console.error(`Player ID not found for ${homePlayer} or ${awayPlayer}`);
      }
    }
  }

  // Helper function to insert into player_season table
  async function insertPlayerSeason(playerId, leagueId, seasonId) {
    return new Promise((resolve, reject) => {
      const insertQuery = `
                INSERT INTO players_season (player_id, league_id, season_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE league_id = VALUES(league_id), season_id = VALUES(season_id);`;

      connection.query(
        insertQuery,
        [playerId, leagueId, seasonId],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  }

  // Helper function to get player_season.id
  async function getPlayerSeasonId(playerId, leagueId, seasonId) {
    return new Promise((resolve, reject) => {
      const query = `
                SELECT id 
                FROM players_season 
                WHERE player_id = ? AND league_id = ? AND season_id = ?;`;

      connection.query(
        query,
        [playerId, leagueId, seasonId],
        (err, results) => {
          if (err) {
            reject(err);
          } else if (results.length > 0) {
            resolve(results[0].id); // Return players_season.id
          } else {
            resolve(null); // No matching record found
          }
        }
      );
    });
  }

  // Helper function to get or insert a player and return the player ID
  async function getPlayerId(playerName) {
    return new Promise((resolve, reject) => {
      let reversedName = playerName.split(" ").reverse().join(" ");

      // Check if the player exists
      const selectQuery = "SELECT id FROM players WHERE name=? OR name=?";
      connection.query(
        selectQuery,
        [playerName, reversedName],
        (err, results) => {
          if (err) {
            return reject(err);
          }

          if (results.length > 0) {
            // Player exists
            return resolve(results[0].id);
          }

          // Player does not exist, insert into database
          const insertQuery = "INSERT INTO players (name) VALUES (?)";
          connection.query(insertQuery, [playerName], (err, insertResults) => {
            if (err) {
              return reject(err);
            }

            // Return the ID of the newly inserted player
            resolve(insertResults.insertId);
          });
        }
      );
    });
  }

  // Function to insert players into player_season
  async function insertPlayerSeason(playerId, leagueId, seasonId) {
    return new Promise((resolve, reject) => {
      // First, check if the player is already in the player_season table
      const selectQuery = `SELECT id FROM players_season WHERE player_id=? AND league_id=? AND season_id=?;`;

      connection.query(
        selectQuery,
        [playerId, leagueId, seasonId],
        (err, results) => {
          if (err) {
            reject(err);
          } else if (results.length > 0) {
            resolve(); // Player already in player_season
          } else {
            // Insert the player into the player_season table
            const insertQuery = `INSERT INTO players_season (player_id, league_id, season_id, promotion_status) VALUES (?, ?, ?, 'active');`;
            connection.query(
              insertQuery,
              [playerId, leagueId, seasonId],
              (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              }
            );
          }
        }
      );
    });
  }

  // Helper function to get league ID by league name
  async function getLeagueIdByName(leagueName) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM leagues WHERE name=?;`;
      connection.query(query, [leagueName], (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length > 0) {
          resolve(results[0].id);
        } else {
          resolve(null); // League not found
        }
      });
    });
  }

  // Helper function to get season ID by season name
  async function getSeasonIdByName(seasonName) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM season WHERE year=?;`;
      connection.query(query, [seasonName], (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length > 0) {
          resolve(results[0].id);
        } else {
          resolve(null); // Season not found
        }
      });
    });
  }
});

app.get("/parsepdfzenske", async (req, res) => {
  const url =
    "http://www.tenis-radgona.si/images/stories/liga_2024/rezultati_ženske_2023.pdf";
  let dataBuffer = "";

  // Reading PDF file from local path
  dataBuffer = fs.readFileSync(
    "../../../../../../Users/zan_s/Desktop/rezultati lige/rezultati_ženske_2024.pdf"
  );

  // Parse PDF data
  let data;
  try {
    data = await pdfparse(dataBuffer);
  } catch (error) {
    console.error("Failed to parse PDF data:", error);
    res.status(500).json({ message: "Failed to parse PDF data" });
    return;
  }

  function parseMatchData(data) {
    const lines = data["text"].split("\n").filter((line) => line.trim() !== "");

    const results = [];
    let currentWeek = "";
    let homePlayer, awayPlayer;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match the week line
      const weekMatch = line.match(/^(\d+\.?\s*kolo)/);
      if (weekMatch) {
        currentWeek = weekMatch[1].match(/\d+/)[0];
        continue;
      }

      // Skip the 'rezultat' line
      if (line.includes(":")) {
        [homePlayer, awayPlayer] = line.split(":").map((str) => str.trim());
        continue;
      }

      // Handle match results
      if (line == "000000") {
        results.push({
          week: currentWeek,
          homePlayer: homePlayer,
          awayPlayer: awayPlayer,
          matchResult: "No result",
          league: 6, // Assuming league 6 for women's league
          deadline: calculateDeadline(currentWeek),
        });
      } else if (!isNaN(line)) {
        const pairs = line.match(/(\d{2})/g);
        const filteredPairs = pairs.filter(
          (pair) => !(pair[0] == "0" && pair[1] == "0")
        );
        const resultStr = filteredPairs
          .map((pair) => pair[0] + "-" + pair[1])
          .join(",");

        results.push({
          week: currentWeek,
          homePlayer: homePlayer,
          awayPlayer: awayPlayer,
          matchResult: resultStr,
          league: 6,
          deadline: calculateDeadline(currentWeek),
        });
      }
    }

    return results;
  }

  const parsedResults = parseMatchData(data);

  // Insert results into the database
  try {
    await insertScheduleWithResults(parsedResults);
    res.json({ message: "Success", results: parsedResults });
  } catch (error) {
    console.error("Failed to insert results:", error);
    res.status(500).json({ message: "Failed to insert results" });
  }

  // Function to insert results into the schedule table
  async function insertScheduleWithResults(parsedResults) {
    for (const result of parsedResults) {
      const { homePlayer, awayPlayer, matchResult, league, week, deadline } =
        result;

      // Fetch league and season IDs
      const leagueId = await getLeagueIdByName(league);
      const seasonId = await getSeasonIdByName("2024");

      if (!leagueId || !seasonId) {
        console.error(
          `League or Season not found: League = ${league}, Season = 2024`
        );
        continue;
      }

      // Fetch player IDs from the players table
      const homePlayerId = await getPlayerId(homePlayer);
      const awayPlayerId = await getPlayerId(awayPlayer);

      if (homePlayerId && awayPlayerId) {
        // Insert players into player_season for the 2024 season and current league
        await insertPlayerSeason(homePlayerId, leagueId, seasonId);
        await insertPlayerSeason(awayPlayerId, leagueId, seasonId);

        // Fetch players_season.id after inserting into players_season
        const homePlayerSeasonId = await getPlayerSeasonId(
          homePlayerId,
          leagueId,
          seasonId
        );
        const awayPlayerSeasonId = await getPlayerSeasonId(
          awayPlayerId,
          leagueId,
          seasonId
        );

        // Insert match into schedule
        const insertQuery = `
                    INSERT INTO schedule (home_player, away_player, result, week, deadline)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    result = CASE 
                        WHEN result = 'No result' THEN VALUES(result) 
                        ELSE result 
                    END,  
                    week = VALUES(week), 
                    deadline = VALUES(deadline);`;

        const queryParams = [
          homePlayerSeasonId,
          awayPlayerSeasonId,
          matchResult,
          week,
          deadline,
        ];

        try {
          await new Promise((resolve, reject) => {
            connection.query(insertQuery, queryParams, (err, results) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
              }
            });
          });
        } catch (error) {
          console.error(
            `Error inserting match for ${homePlayer} vs ${awayPlayer}:`,
            error
          );
        }
      } else {
        console.error(`Player ID not found for ${homePlayer} or ${awayPlayer}`);
      }
    }
  }

  // Helper function to get player ID from the database
  async function getPlayerId(playerName) {
    return new Promise((resolve, reject) => {
      let reversedName = playerName.split(" ").reverse().join(" ");

      const query = `SELECT id FROM players WHERE name=? OR name=?;`;
      connection.query(query, [playerName, reversedName], (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length > 0) {
          resolve(results[0].id);
        } else {
          resolve(null); // Player not found
        }
      });
    });
  }

  // Helper function to insert player into player_season table
  async function insertPlayerSeason(playerId, leagueId, seasonId) {
    const insertQuery = `
            INSERT INTO players_season (player_id, league_id, season_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE league_id = VALUES(league_id), season_id = VALUES(season_id);`;

    const queryParams = [playerId, leagueId, seasonId];

    return new Promise((resolve, reject) => {
      connection.query(insertQuery, queryParams, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Helper function to get players_season.id after inserting the player
  async function getPlayerSeasonId(playerId, leagueId, seasonId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM players_season WHERE player_id=? AND league_id=? AND season_id=?;`;
      connection.query(
        query,
        [playerId, leagueId, seasonId],
        (err, results) => {
          if (err) {
            reject(err);
          } else if (results.length > 0) {
            resolve(results[0].id);
          } else {
            resolve(null); // Player in the season not found
          }
        }
      );
    });
  }

  // Helper function to get league ID by its name
  async function getLeagueIdByName(leagueName) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM leagues WHERE id=?;`;
      connection.query(query, [leagueName], (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length > 0) {
          resolve(results[0].id);
        } else {
          resolve(null); // League not found
        }
      });
    });
  }

  // Helper function to get season ID by its name
  async function getSeasonIdByName(seasonName) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM season WHERE year=?;`;
      connection.query(query, [seasonName], (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length > 0) {
          resolve(results[0].id);
        } else {
          resolve(null); // Season not found
        }
      });
    });
  }

  // Helper function to calculate deadlines based on the week
  function calculateDeadline(week) {
    // Logic to calculate the deadline for the match week
    const startDate = new Date(2024, 0, 1); // Assuming season starts in January 2024
    const deadlineDate = new Date(
      startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000
    ); // Add week number
    return deadlineDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }
});

app.get("/getmatches/:leagueId", (req, res) => {
  const leagueId = req.params.leagueId;
  const seasonId = req.headers.season;
  console.log(leagueId, seasonId);

  const query = `
     SELECT 
    s.id,
    ps_home.player_id AS home_player_id,
    hp.name AS home_player,
    ps_away.player_id AS away_player_id,
    ap.name AS away_player,
    s.result,
    ps_home.league_id,
    s.week,
    s.deadline
FROM 
    schedule s
JOIN 
    players_season ps_home ON s.home_player = ps_home.id
JOIN 
    players hp ON ps_home.player_id = hp.id
JOIN 
    players_season ps_away ON s.away_player = ps_away.id
JOIN 
    players ap ON ps_away.player_id = ap.id
WHERE 
    ps_home.league_id = ?
    AND ps_home.season_id = ?
ORDER BY 
    s.week;

    `;

  connection.query(query, [leagueId, seasonId], (err, results) => {
    if (err) {
      console.error("Error fetching matches:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching matches" });
      return;
    }
    console.log(results);
    res.json(results);
  });
});
// Route to generate and store the round-robin schedule
app.get("/generate-schedule", (req, res) => {
  // Fetch player IDs
  connection.query(
    "SELECT id, name FROM players WHERE league_id=6",
    (err, data) => {
      if (err) {
        console.error("Error fetching players:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching players" });
        return;
      }

      // Extract player IDs from the query result
      const playerIds = data.map((row) => row.id);
      const playerNameMap = new Map(data.map((row) => [row.id, row.name])); // Map IDs to names for reference

      console.log(playerIds);

      const shuffledPlayerIds = shuffle(playerIds);
      const schedule = generateRoundRobinSchedule(shuffledPlayerIds);
      const alternatedSchedule = assignHomeAway(schedule);
      console.log(shuffledPlayerIds);

      // Insert schedule into the database
      for (let week = 0; week < alternatedSchedule.length; week++) {
        for (let match = 0; match < alternatedSchedule[week].length; match++) {
          const homePlayerId = alternatedSchedule[week][match][0];
          const awayPlayerId = alternatedSchedule[week][match][1];
          const query =
            "INSERT INTO schedule (week, home_player, away_player, league_id, season, deadline) VALUES (?, ?, ?, ?, ?, ?)";
          connection.query(
            query,
            [
              week + 1,
              homePlayerId,
              awayPlayerId,
              6,
              "1",
              calculateDeadline(week + 1),
            ],
            (err, results) => {
              if (err) {
                console.error("Error inserting match:", err);
              } else {
                console.log("Inserted match:", results.insertId);
              }
            }
          );
        }
      }

      res.json({ message: "Schedule generated and stored in the database." });
    }
  );
});

app.get("/calculate-standings/:id", (req, res) => {
  let leagueId = req.params.id;
  let seasonId = req.headers.season || 1; // Assuming seasonId is 1 for now, you can dynamically fetch it if needed

  const fetchMatchesQuery = `
    SELECT 
        s.home_player,
        hps.player_id AS home_player_id,
        s.away_player,
        aps.player_id AS away_player_id,
        s.result
    FROM 
        schedule s
    JOIN 
        players_season hps ON s.home_player = hps.id AND hps.league_id = ? AND hps.season_id = ?
    JOIN 
        players_season aps ON s.away_player = aps.id AND aps.league_id = ? AND aps.season_id = ?
    WHERE 
        aps.league_id = ?
`;

const fetchPlayersQuery = `
SELECT DISTINCT 
  hps.id AS player_season_id,
  hps.player_id AS player_id,
  p.name AS name
FROM 
  schedule s
JOIN 
  players_season hps ON s.home_player = hps.id AND hps.league_id = ? AND hps.season_id = ?
JOIN 
  players p ON hps.player_id = p.id
WHERE 
  hps.league_id = ?
UNION
SELECT DISTINCT 
  aps.id AS player_season_id,
  aps.player_id AS player_id,
  p.name AS name
FROM 
  schedule s
JOIN 
  players_season aps ON s.away_player = aps.id AND aps.league_id = ? AND aps.season_id = ?
JOIN 
  players p ON aps.player_id = p.id
WHERE 
  aps.league_id = ?
`;

  // Fetch matches
  connection.query(
    fetchMatchesQuery,
    [leagueId, seasonId, leagueId, seasonId, leagueId],
    (err, matches) => {
      if (err) {
        console.error("Error fetching matches:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching matches" });
        return;
      }

      // Fetch players
      connection.query(
        fetchPlayersQuery,
        [leagueId, seasonId, leagueId, leagueId, seasonId, leagueId],
        (err, players) => {
          if (err) {
            console.error("Error fetching players:", err);
            res
              .status(500)
              .json({ error: "An error occurred while fetching players" });
            return;
          }

          const standings = {};
          console.log(players);
          // Initialize standings for all players
          players.forEach((player) => {
            standings[player.player_season_id] = {
              points: 0,
              netGamesWon: 0,
              setsPlayed: 0,
              netSetsWon: 0,
              matchesPlayed: 0,
              matchesWon: 0,
              name:player.name
            };
          });

          matches.forEach((match) => {
            if (!match.result) {
              return; // Skip matches with no result
            }

            const sets = match.result.split(",").map((set) => set.trim());
            if (sets.length < 2) {
              return; // Skip invalid match results
            }

            let homeSetsWon = 0;
            let awaySetsWon = 0;

            sets.forEach((set) => {
              const [homeGames, awayGames] = set.split("-").map(Number);
              if (homeGames > awayGames) {
                homeSetsWon += 1;
              } else if (awayGames > homeGames) {
                awaySetsWon += 1;
              }
            });

            const homePlayerSeasonId = match.home_player;
            const awayPlayerSeasonId = match.away_player;

            standings[homePlayerSeasonId].matchesPlayed += 1;
            standings[awayPlayerSeasonId].matchesPlayed += 1;

            if (homeSetsWon > awaySetsWon) {
              standings[homePlayerSeasonId].points += 2;
              standings[homePlayerSeasonId].matchesWon += 1;
            } else {
              standings[awayPlayerSeasonId].points += 2;
              standings[awayPlayerSeasonId].matchesWon += 1;
            }

            const homeGamesWon = sets.reduce(
              (acc, set) => acc + parseInt(set.split("-")[0]),
              0
            );
            const awayGamesWon = sets.reduce(
              (acc, set) => acc + parseInt(set.split("-")[1]),
              0
            );

            standings[homePlayerSeasonId].netGamesWon +=
              homeGamesWon - awayGamesWon;
            standings[awayPlayerSeasonId].netGamesWon +=
              awayGamesWon - homeGamesWon;

            standings[homePlayerSeasonId].netSetsWon +=
              homeSetsWon - awaySetsWon;
            standings[awayPlayerSeasonId].netSetsWon +=
              awaySetsWon - homeSetsWon;

            standings[homePlayerSeasonId].setsPlayed +=
              homeSetsWon + awaySetsWon;
            standings[awayPlayerSeasonId].setsPlayed +=
              homeSetsWon + awaySetsWon;
          });

          const reorderStandings = () => {
            const playerSeasonIds = Object.keys(standings);
          
            // Sort first by points
            playerSeasonIds.sort((playerA, playerB) => standings[playerB].points - standings[playerA].points);
          
            // Find groups of tied players based on points
            let currentTiedGroup = [];
            let sortedPlayers = [];
          
            for (let i = 0; i < playerSeasonIds.length; i++) {
              const playerId = playerSeasonIds[i];
              
              if (i == 0 || standings[playerId].points == standings[playerSeasonIds[i - 1]].points) {
                // Add player to the current tied group if points are the same as the previous player
                currentTiedGroup.push(playerId);
              } else {
                // Process the previous group of tied players
                if (currentTiedGroup.length > 1) {
                  sortedPlayers.push(...sortTiedPlayers(currentTiedGroup));
                } else {
                  sortedPlayers.push(currentTiedGroup[0]); // Only one player, no need to sort
                }
          
                // Reset the tied group with the current player
                currentTiedGroup = [playerId];
              }
            }
          
            // Handle the last tied group
            if (currentTiedGroup.length > 1) {
              sortedPlayers.push(...sortTiedPlayers(currentTiedGroup));
            } else {
              sortedPlayers.push(currentTiedGroup[0]);
            }
          
            return sortedPlayers;
          };
          
          // Helper function to sort tied players and store match results
          const sortTiedPlayers = (tiedPlayers) => {
            const playerStatsInTieGroup = tiedPlayers.reduce((acc, player) => {
              acc[player] = {
                name: standings[player].name, // Store player name
                wins: 0,
                headToHeadResults: {},
                netSetsWon: 0,
                netGamesWon: 0,
                opponents: [], // Store match results against each opponent
              };
              return acc;
            }, {});
          
            const checkedPairs = new Set();
          
        // Compare each pair of tied players
// Compare each pair of tied players
tiedPlayers.forEach((playerA, indexA) => {
  tiedPlayers.slice(indexA + 1).forEach((playerB) => {
    const pairIdentifier = [playerA, playerB].sort().join("-");
    
    if (!checkedPairs.has(pairIdentifier)) {
      checkedPairs.add(pairIdentifier);

      const match = matches.find(
        (m) =>
          (m.home_player == playerA && m.away_player == playerB) ||
          (m.home_player == playerB && m.away_player == playerA)
      );
      
      if (match && match.result) {
        const sets = match.result.split(",").map((set) => set.trim());
        let homeSetsWon = 0, awaySetsWon = 0, homeGamesWon = 0, awayGamesWon = 0;

        sets.forEach((set) => {
          const [homeScore, awayScore] = set.split("-").map(Number);
          if (homeScore > awayScore) homeSetsWon++;
          else awaySetsWon++;
          homeGamesWon += homeScore;
          awayGamesWon += awayScore;
        });

        // Save match result for both Player A and Player B
        const matchResultA = {
          opponent: standings[playerB].name,
          sets: match.result,
          result: homeSetsWon > awaySetsWon ? 'Win' : 'Loss',
          netSetsWon: homeSetsWon - awaySetsWon,
          netGamesWon: homeGamesWon - awayGamesWon,
        };

        const matchResultB = {
          opponent: standings[playerA].name,
          sets: match.result,
          result: awaySetsWon > homeSetsWon ? 'Win' : 'Loss',
          netSetsWon: awaySetsWon - homeSetsWon,
          netGamesWon: awayGamesWon - homeGamesWon,
        };

        // Update stats for Player A and Player B
        if (match.home_player == playerA) {
          // Player A is home, Player B is away
          if (homeSetsWon > awaySetsWon) {
            playerStatsInTieGroup[playerA].wins++;
            playerStatsInTieGroup[playerA].headToHeadResults[playerB] = "Win"; // Store head-to-head win
              playerStatsInTieGroup[playerB].headToHeadResults[playerA] = "Loss"; // Store head-to-head loss
          } else {
            playerStatsInTieGroup[playerB].wins++;
            playerStatsInTieGroup[playerB].headToHeadResults[playerA] = "Win"; // Store head-to-head win
            playerStatsInTieGroup[playerA].headToHeadResults[playerB] = "Loss"; // Store head-to-head loss
          
          }
          
          playerStatsInTieGroup[playerA].netSetsWon += homeSetsWon - awaySetsWon;
          playerStatsInTieGroup[playerB].netSetsWon += awaySetsWon - homeSetsWon;
          playerStatsInTieGroup[playerA].netGamesWon += homeGamesWon - awayGamesWon;
          playerStatsInTieGroup[playerB].netGamesWon += awayGamesWon - homeGamesWon;
          
          // Store correct results for both players' perspectives
          playerStatsInTieGroup[playerA].opponents.push({
            opponent: standings[playerB].name,
            sets: match.result,
            result: homeSetsWon > awaySetsWon ? 'Win' : 'Loss', // Player A's result (Home perspective)
            netSetsWon: homeSetsWon - awaySetsWon,
            netGamesWon: homeGamesWon - awayGamesWon,
          });
          
          playerStatsInTieGroup[playerB].opponents.push({
            opponent: standings[playerA].name,
            sets: match.result,
            result: awaySetsWon > homeSetsWon ? 'Win' : 'Loss', // Player B's result (Away perspective)
            netSetsWon: awaySetsWon - homeSetsWon,
            netGamesWon: awayGamesWon - homeGamesWon,
          });
        } else {
          // Player A is away, Player B is home
          if (awaySetsWon > homeSetsWon) {
            playerStatsInTieGroup[playerA].wins++;
            playerStatsInTieGroup[playerA].headToHeadResults[playerB] = "Win"; // Store head-to-head win
            playerStatsInTieGroup[playerB].headToHeadResults[playerA] = "Loss"; // Store head-to-head loss
          } else {
            playerStatsInTieGroup[playerB].wins++;
            playerStatsInTieGroup[playerB].headToHeadResults[playerA] = "Win"; // Store head-to-head win
            playerStatsInTieGroup[playerA].headToHeadResults[playerB] = "Loss"; // Store head-to-head loss
          }

          playerStatsInTieGroup[playerA].netSetsWon += awaySetsWon - homeSetsWon;
          playerStatsInTieGroup[playerB].netSetsWon += homeSetsWon - awaySetsWon;
          playerStatsInTieGroup[playerA].netGamesWon += awayGamesWon - homeGamesWon;
          playerStatsInTieGroup[playerB].netGamesWon += homeGamesWon - awayGamesWon;

          // Store correct results for both players' perspectives
          playerStatsInTieGroup[playerA].opponents.push({
            opponent: standings[playerB].name,
            sets: match.result,
            result: awaySetsWon > homeSetsWon ? 'Win' : 'Loss', // Player A's result (Away perspective)
            netSetsWon: awaySetsWon - homeSetsWon,
            netGamesWon: awayGamesWon - homeGamesWon,
          });

          playerStatsInTieGroup[playerB].opponents.push({
            opponent: standings[playerA].name,
            sets: match.result,
            result: homeSetsWon > awaySetsWon ? 'Win' : 'Loss', // Player B's result (Home perspective)
            netSetsWon: homeSetsWon - awaySetsWon,
            netGamesWon: homeGamesWon - awayGamesWon,
          });
        }
      }
    }
  });
});

           // console.log(Object.keys(playerStatsInTieGroup)[0])
            Object.keys(playerStatsInTieGroup).forEach((playerId) => {
           
          
           
              const saveIndividualTieBreakerStatsQuery = `
                UPDATE standings
                SET tie_breaker_stats = ?
                WHERE player = ?;
              `;
           
              connection.query(
                saveIndividualTieBreakerStatsQuery,
                [JSON.stringify(playerStatsInTieGroup[playerId]), playerId],
                (err) => {
                  if (err) {
                    console.error("Error saving tie-breaker stats:", err);
                  } else {
                    console.log(`Tie-breaker stats saved successfully for player ${playerId}`);
                  }
                }
              );
            });  
            
            // Sort tied players based on wins, net sets won, and net games won
            return tiedPlayers.sort((playerA, playerB) => {
        
               // 2. If tied, compare by head-to-head result
    const headToHeadResult = playerStatsInTieGroup[playerA].headToHeadResults[playerB];
    if (headToHeadResult === "Win") return -1;
    if (headToHeadResult === "Loss") return 1;

              const winsDiff = playerStatsInTieGroup[playerB].wins - playerStatsInTieGroup[playerA].wins;
              if (winsDiff != 0) return winsDiff;
          
              const netSetsDiff = playerStatsInTieGroup[playerB].netSetsWon - playerStatsInTieGroup[playerA].netSetsWon;
              if (netSetsDiff != 0) return netSetsDiff;
          
              return playerStatsInTieGroup[playerB].netGamesWon - playerStatsInTieGroup[playerA].netGamesWon;
            });
          };
          
          
          const orderedPlayerIds = reorderStandings();

          const updateOrInsertStandingsQuery = `
                INSERT INTO standings (player, points, netGamesWon, setsPlayed, netSetsWon, matches_played, week, position)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    points = VALUES(points),
                    netGamesWon = VALUES(netGamesWon),
                    setsPlayed = VALUES(setsPlayed),
                    netSetsWon = VALUES(netSetsWon),
                    matches_played = VALUES(matches_played),
                    position = VALUES(position)
            `;

          // Execute one insert/update per player
          let promises = orderedPlayerIds.map((playerSeasonId, index) => {
            return new Promise((resolve, reject) => {
              connection.query(
                updateOrInsertStandingsQuery,
                [
                  playerSeasonId,
                  standings[playerSeasonId].points,
                  standings[playerSeasonId].netGamesWon,
                  standings[playerSeasonId].setsPlayed,
                  standings[playerSeasonId].netSetsWon,
                  standings[playerSeasonId].matchesPlayed,
                  // Use the correct season_id
                  "all", // Example week
                  index + 1, // Position (index + 1 for 1-based rank)
                ],
                (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                }
              );
            });
          });

          // Wait for all queries to finish
          Promise.all(promises)
            .then(() => {
              res.json({
                message:
                  "Standings calculated, ranked, and updated successfully",
              });
            })
            .catch((err) => {
              console.error("Error inserting/updating standings:", err);
              res
                .status(500)
                .json({
                  error: "An error occurred while inserting/updating standings",
                });
            });
        }
      );
    }
  );
});


// Get standings from MySQL
app.get("/standings/:id", (req, res) => {
  const leagueId = req.params.id;
  const seasonId = req.headers.season; // Example season ID, this could be dynamic if necessary.

  const query = `
      SELECT 
        standings.*,
        ps.player_id, 
        ps.league_id,
        ps.season_id,
        p.name,
        tie_breaker_stats as tieBreakerStats
      FROM 
        standings 
       
       JOIN players_season ps 
        ON standings.player = ps.id 
       JOIN players p 
        ON ps.player_id = p.id
          WHERE ps.league_id=? and ps.season_id=?
      ORDER BY standings.position ASC
    `;

  connection.query(query, [leagueId, seasonId], (err, results) => {
    if (err) {
      console.error("Error fetching standings:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching standings" });
      return;
    }
    res.json(results);
  });
});

app.post("/update-match-result", (req, res) => {
  const { id, result } = req.body;
  const query = "UPDATE schedule SET result = ? WHERE id = ?";

  connection.query(query, [result, id], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }

    res.json({ message: "Match result updated successfully" });
  });
});
app.post("/promote", (req, res) => {
  const { id, status,seasonid } = req.body;
  const query = "UPDATE players_season SET promotion_status = ? WHERE id = ? and season_id=?";

  connection.query(query, [status, id,seasonid], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }

    res.status(200).json({ message: "Match result updated successfully" });
  });
});
app.post("/demote", (req, res) => {
  const { id, status,seasonid } = req.body;
  const query = "UPDATE players_season SET promotion_status = ? WHERE id = ? and season_id=?";

  connection.query(query, [status, id,seasonid], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }

    res.status(200).json({ message: "Match result updated successfully" });
  });
});
app.get("/fetchpromotedanddemoted", (req, res) => {
  const sql = `
    WITH TopPlayers AS (
        SELECT s.player, p.name, s.points, s.position, ps.league_id,l.name as liga,ps.season_id,ps.promotion_status,
               ROW_NUMBER() OVER (PARTITION BY ps.league_id ORDER BY s.position ASC) AS rank
        FROM standings s
        JOIN players_season ps ON s.player = ps.id
        JOIN players p ON ps.player_id = p.id
        JOIN leagues l ON ps.league_id=l.id
        WHERE ps.league_id IN (2, 3, 4, 5) 
          AND ps.injured = 0
          AND s.position IN (1, 2, 3) 
    ),
    BottomPlayers AS (
        SELECT s.player, p.name, s.points, s.position, ps.league_id,l.name as liga,ps.season_id,ps.promotion_status,
               ROW_NUMBER() OVER (PARTITION BY ps.league_id ORDER BY s.position DESC) AS rank
        FROM standings s
        JOIN players_season ps ON s.player = ps.id
        JOIN players p ON ps.player_id = p.id
         JOIN leagues l ON ps.league_id=l.id
        WHERE ps.league_id IN (1, 2, 3, 4) 
          AND ps.injured = 0 
    )
    SELECT * FROM TopPlayers WHERE rank <= 3 and promotion_status=''
    UNION ALL
    SELECT * FROM BottomPlayers WHERE rank <= 3 and promotion_status=''
  `;

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log(results)
    // Sending the results
    res.json(results);
  });
});

app.post("/endLeague", (req, res) => {
  // const { id, result } = req.body;
  const query = 'UPDATE season SET status = "finished" WHERE year="2024"';

  connection.query(query, [], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }

    res.json({ message: "Match result updated successfully" });
  });
});

app.get("/leagues", (req, res) => {
  const seasonId = req.headers.season;

  const query = `
        SELECT DISTINCT ps.league_id,l.*
        FROM players_season ps
        JOIN leagues l on ps.league_id=l.id
        WHERE ps.season_id = ?
    `;

  connection.query(query, [seasonId], (err, results) => {
    if (err) {
      console.error("Error fetching played leagues:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching played leagues" });
      return;
    }

    res.json(results);
  });
});
app.post("/confirmResult", (req, res) => {
  const { id } = req.body;
  const query = "UPDATE schedule SET result_confirmed = 1 WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }

    res.json({ message: "Rezultat je bil uspešno potrjen" });
  });
});
app.post("/forfeitMatch", (req, res) => {
  const { id, result } = req.body;
  const query =
    "UPDATE schedule SET result_confirmed = 1,result=? WHERE id = ?";
  connection.query(query, [result, id], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }

    res.json({ message: "Tekma je bila predana" });
  });
});
app.get("/leagues/:id/players", (req, res) => {
  const leagueId = req.params.id;
  const seasonId = req.headers.season;
  const query = `
      SELECT p.*, ps.* 
      FROM players p
      JOIN players_season ps ON p.id = ps.player_id
      WHERE ps.league_id = ? and ps.season_id = ?
      ORDER BY p.name ASC
    `;

  connection.query(query, [leagueId, seasonId], (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching players" });
      return;
    }
    res.json(results);
  });
});
app.get("/unplayedMatches", (req, res) => {
  const leagueId = req.query.leagueId;
  const seasonId = req.headers.season;

  const query = `
     SELECT 
    s.id,
    ps_home.player_id AS home_player,
    hp.name AS home_player,
    ps_away.player_id AS away_player,
    ap.name AS away_player,
    s.result,
    ps_home.league_id,
    s.week,
    s.deadline
FROM 
    schedule s
JOIN 
    players_season ps_home ON s.home_player = ps_home.id
JOIN 
    players hp ON ps_home.player_id = hp.id
JOIN 
    players_season ps_away ON s.away_player = ps_away.id
JOIN 
    players ap ON ps_away.player_id = ap.id
WHERE 
    s.result="No result"
    AND ps_home.season_id = ?
ORDER BY 
    s.week ASC; 
    `;

  connection.query(query, [seasonId], (err, data) => {
    if (err) {
      console.error("Error fetching unplayed matches:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching unplayed matches" });
      return;
    }

    res.json(data);
  });
});
app.get("/getplayers", (req, res) => {
  const leagueId = req.params.id;
  const query = "SELECT * FROM players    ";

  connection.query(query, [leagueId], (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching players" });
      return;
    }
    res.json(results);
  });
});
app.get("/getUsers", (req, res) => {
  const leagueId = req.params.id;
  const query = `
    SELECT *,users.id, users.name, players.id AS playerId
    FROM users
    LEFT JOIN players ON users.id = players.user_id;
  `;

  connection.query(query, [leagueId], (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching players" });
      return;
    }
    res.json(results);
  });
});
app.post("/linkplayer", (req, res) => {
  const { userid, playerid } = req.body;
  const query = "UPDATE players SET user_id = ? WHERE id = ?";
  connection.query(query, [userid, playerid], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }

    res.json({ message: "Tekma je bila predana" });
  });
});
app.post("/register", (req, res) => {
  users = [];
  const { name, phone, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  users.push({ email, password: hashedPassword });
  const query =
    "INSERT INTO users (name,phone,email,password) VALUES (?,?,?,?)";

  connection.query(
    query,
    [name, phone, email, hashedPassword],
    (err, results) => {
      if (err) {
        console.error("Error inserting user", err);
        res.status(500).json({ error: "error inserting user" });
        return;
      } else {
        res.json(results);
      }
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email=?";

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching players" });
      return;
    }

    if (results[0].email && bcrypt.compareSync(password, results[0].password)) {
      const token = jwt.sign(
        {
          email: results[0].email,
          role: results[0].role,
          name: results[0].name,
          id: results[0].id,
        },
        "secret",
        { expiresIn: "24h" }
      );

      res.send({ token });
    } else {
      res.status(401).send("Invalid credentials");
    }
  });
});
app.post("/registerForLeagueNonUserPlayers", (req, res) => {
  const { fullName, phoneNumber, email, gender, password } = req.body.form;

  // Function to register a player for a league with tier adjustment based on promotion/relegation
  const registerPlayerForLeague = (fullName, leagueId, seasonId, phone, email, password, callback) => {
    let league_id;
    if (gender === "ž") {
      league_id = 6; // Women's league ID
    } else {
      league_id = 5; // Men's league ID
    }

    // Step 1: Check if the player exists using either "first name last name" or "last name first name"
    const checkPlayerQuery = `
      SELECT id 
      FROM players 
      WHERE name = ? OR name = ?
    `;

    const [firstName, lastName] = fullName.split(' ');
    const reversedName = `${lastName} ${firstName}`;

    connection.query(checkPlayerQuery, [fullName, reversedName], (err, results) => {
      if (err) {
        console.error('Error checking player:', err);
        callback(err, null);
        return;
      }

      let playerId;

      if (results.length > 0) {
        // Player already exists, get the player ID
        playerId = results[0].id;
        console.log('Player already exists, ID:', playerId);

        // Step 2: Check promotion status and current tier from players_season and leagues table
        const checkPromotionAndTierQuery = `
          SELECT ps.league_id, ps.promotion_status, l.tier
          FROM players_season ps 
          JOIN leagues l ON ps.league_id = l.id 
          JOIN season ON season.id = ps.season_id
          WHERE ps.player_id = ? 
          ORDER BY season.year DESC 
          LIMIT 1
        `;

        connection.query(checkPromotionAndTierQuery, [playerId], (err, promotionResults) => {
          if (err) {
            console.error('Error checking promotion status and tier:', err);
            callback(err, null);
            return;
          }

          if (promotionResults.length > 0) {
            const currentLeagueId = promotionResults[0].league_id;
            const promotionStatus = promotionResults[0].promotion_status;
            let currentTier = promotionResults[0].tier;

            // Adjust the tier based on promotion status
            if (promotionStatus === 'promoted') {
              console.log('Player promoted, adjusting to tier:', currentTier - 1);
              currentTier -= 1; // Promotion means moving to a higher tier
            } else if (promotionStatus === 'relegated') {
              console.log('Player relegated, adjusting to tier:', currentTier + 1);
              currentTier += 1; // Relegation means moving to a lower tier
            }

            // Step 3: Find the new league_id for the adjusted tier
            const getNewLeagueIdQuery = `
              SELECT id 
              FROM leagues 
              WHERE tier = ?
            `;

            connection.query(getNewLeagueIdQuery, [currentTier], (err, leagueResults) => {
              if (err) {
                console.error('Error fetching league for the new tier:', err);
                callback(err, null);
                return;
              }

              if (leagueResults.length > 0) {
                const newLeagueId = leagueResults[0].id;
                console.log('New league ID for tier', currentTier, 'is', newLeagueId);

                // Step 4: Insert or update the player in the players_season table
                insertIntoPlayersSeason(playerId, newLeagueId, seasonId, callback);
              } else {
                console.error('No league found for the adjusted tier');
                callback('No league found for the adjusted tier', null);
              }
            });
          } else {
            console.error('No promotion data found for player');
            callback('No promotion data found for player', null);
          }
        });

      } else {
        // Step 5: Player doesn't exist, insert into the players table
        const insertPlayerQuery = 'INSERT INTO players (name, phone, email) VALUES (?, ?, ?)';

        connection.query(insertPlayerQuery, [fullName, phone, email], (err, result) => {
          if (err) {
            console.error('Error inserting player:', err);
            callback(err, null);
            return;
          }

          // Use the newly inserted player's ID
          playerId = result.insertId;
          console.log('New player inserted, ID:', playerId);

          // Step 6: Insert user account if password is provided
          if (password) {
            createUserAccount(fullName, email,phone, password, (err, userResult) => {
              if (err) {
                console.error('Error creating user account:', err);
                callback(err, null);
                return;
              }

              const userId = userResult.insertId;
              console.log('User account created for player:', userId);

              // Link the user_id to the players table
              const updatePlayerWithUserQuery = `
                UPDATE players 
                SET user_id = ? 
                WHERE id = ?
              `;

              connection.query(updatePlayerWithUserQuery, [userId, playerId], (err, result) => {
                if (err) {
                  console.error('Error updating player with user_id:', err);
                  callback(err, null);
                  return;
                }

                console.log('Player updated with user_id:', userId);

                // Step 7: Insert into players_season table for the new player
                insertIntoPlayersSeason(playerId, leagueId, seasonId, callback);
              });
            });
          } else {
            // If no password, just insert into players_season table
            insertIntoPlayersSeason(playerId, leagueId, seasonId, callback);
          }
        });
      }
    });
  };

  // Function to insert into players_season table
  const insertIntoPlayersSeason = (playerId, leagueId, seasonId, callback) => {
    const insertPlayersSeasonQuery = `
      INSERT INTO players_season (player_id, league_id, season_id) 
      VALUES (?, ?, ?)
    `;

    connection.query(insertPlayersSeasonQuery, [playerId, leagueId, seasonId], (err, result) => {
      if (err) {
        console.error('Error inserting into players_season:', err);
        callback(err, null);
        return;
      }

      console.log('Player registered for league and season');
      callback(null, result);
    });
  };

  // Function to create a user account when password is provided
  const createUserAccount = (fullName, email,phone, password, callback) => {
    const createUserQuery = `
      INSERT INTO users (name, email,phone, password) 
      VALUES (?, ?, ?,?)
    `;

    // Hash the password before saving it into the database
    const hashedPassword = bcrypt.hashSync(password, 8);// Ensure to implement the hashing logic

    connection.query(createUserQuery, [fullName, email,phone, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error creating user account:', err);
        callback(err, null);
        return;
      }

      console.log('User account created:', result.insertId);
      callback(null, result);
    });
  };

  // Example usage
  const leagueId = 5;
  const seasonId = 4; // Example season ID

  registerPlayerForLeague(fullName, leagueId, seasonId, phoneNumber, email, password, (err, result) => {
    if (err) {
      console.error('Error registering player:', err);
      res.status(500).json({ error: err });
    } else {
      console.log('Player registration successful:', result);
      res.status(200).json({ message: 'Player registered successfully!' });
    }
  });
});
app.post("/registerForLeagueRegisteredPlayers", (req, res) => {
  const  userId = req.body.form; // We assume userId is passed directly

 

  const seasonId = 4; // Example season ID

  // Step 1: Check if the player exists and retrieve their player_id using the known user_id
  const findPlayerQuery = `
    SELECT id 
    FROM players 
    WHERE user_id = ?
  `;

  connection.query(findPlayerQuery, [userId], (err, playerResults) => {
    if (err) {
      console.error('Error finding player:', err);
      res.status(500).json({ error: "Error finding player" });
      return;
    }

    if (playerResults.length === 0) {
      console.error('Player not found for user');
      res.status(404).json({ error: "Player not found" });
      return;
    }

    const playerId = playerResults[0].id;

    // Step 2: Check player's promotion status and current tier, if needed
    const checkPromotionAndTierQuery = `
      SELECT ps.league_id, ps.promotion_status, l.tier
      FROM players_season ps 
      JOIN leagues l ON ps.league_id = l.id 
      JOIN season ON season.id = ps.season_id
      WHERE ps.player_id = ? 
      ORDER BY season.year DESC 
      LIMIT 1
    `;

    connection.query(checkPromotionAndTierQuery, [playerId], (err, promotionResults) => {
      if (err) {
        console.error('Error checking promotion status and tier:', err);
        res.status(500).json({ error: "Error checking promotion status" });
        return;
      }

      let currentTier = 5; // Default tier
      if (promotionResults.length > 0) {
        const promotionStatus = promotionResults[0].promotion_status;
        currentTier = promotionResults[0].tier;

        if (promotionStatus === 'promoted') {
          currentTier -= 1; // Move to a higher tier
        } else if (promotionStatus === 'relegated') {
          currentTier += 1; // Move to a lower tier
        }
      }

      // Step 3: Find the new league ID for the updated tier, if needed
      const getNewLeagueIdQuery = `
        SELECT id 
        FROM leagues 
        WHERE tier = ?
      `;

      connection.query(getNewLeagueIdQuery, [currentTier], (err, leagueResults) => {
        if (err) {
          console.error('Error fetching league for the new tier:', err);
          res.status(500).json({ error: "Error fetching league" });
          return;
        }

        if (leagueResults.length > 0) {
          const newLeagueId = leagueResults[0].id;

          // Step 4: Insert or update the player in the players_season table
          const insertPlayersSeasonQuery = `
            INSERT INTO players_season (player_id, league_id, season_id) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE league_id = VALUES(league_id), season_id = VALUES(season_id)
          `;

          connection.query(insertPlayersSeasonQuery, [playerId, newLeagueId, seasonId], (err, result) => {
            if (err) {
              console.error('Error inserting into players_season:', err);
              res.status(500).json({ error: "Error inserting into players_season" });
              return;
            }

            console.log('Player successfully registered for the league and season');
            res.status(200).json({ message: 'Player registered successfully!' });
          });
        } else {
          console.error('No league found for the adjusted tier');
          res.status(500).json({ error: "No league found for the adjusted tier" });
        }
      });
    });
  });
});
app.get("/getTiedPlayers", (req, res) => {

  // SQL query to retrieve players with tied points
  let query = `
    SELECT 
        
        ps.league_id,
        ps.season_id,
        l.name AS league_name,
        p.id AS player_id,
        p.name AS player_name,
        s1.*
        
    FROM 
        standings s1
    JOIN 
        players_season ps ON s1.player = ps.id  -- Join standings to players_season via player id
    JOIN 
        players p ON ps.player_id = p.id  -- Join players_season to players table
    JOIN 
        leagues l ON ps.league_id = l.id  -- Join players_season to leagues to get league info
    JOIN 
        (
            -- Subquery to find points ties in each league and season
            SELECT 
                ps.league_id, 
                ps.season_id, 
                s.points
            FROM 
                standings s
            JOIN 
                players_season ps ON s.player = ps.id
            GROUP BY 
                ps.league_id, ps.season_id, s.points
            HAVING 
                COUNT(s.player) > 1 -- Only include points where more than 1 player has the same points
        ) s2 ON ps.league_id = s2.league_id 
           AND ps.season_id = s2.season_id 
           AND s1.points = s2.points
    WHERE 
        ps.season_id = 1  -- Replace with your season filter
    ORDER BY 
        ps.league_id ASC , s1.position ASC;
  `;

  // Execute the query
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database query error' });
      return;
    }

    // Send the results back to the client as JSON
    res.status(200).json(results);
  });
});
  

// app.listen(port, () => {
//     console.log(`Server is running at https://192.168.0.24:${port}`);
// });
