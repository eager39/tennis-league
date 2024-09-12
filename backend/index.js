




var express = require('express')
  var fs = require('fs')
  
  const https = require("https");

const options = {
    key: fs.readFileSync("cert/key.pem"),                  //Change Private Key Path here
    cert: fs.readFileSync("cert/certificate.pem"),            //Change Main Certificate Path here
               //Change Intermediate Certificate Path here
    };
// To enable HTTPS
//var app = module.exports = express({key: privateKey, cert: certificate});
const mysql = require('mysql');
const app = express();
app.enable('trust proxy');
const cors = require('cors');
const bodyParser = require('body-parser');

const pdfparse =require("pdf-parse")

const axios = require('axios');
const path = require('path');
const moment = require('moment'); // Use moment.js for date manipulation
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
app.use(cors())
app.use(bodyParser.json());
var getIP = require('ipware')().get_ip;
app.use(function(req, res, next) {
    var ipInfo = getIP(req);
    console.log(ipInfo);
    // { clientIp: '127.0.0.1', clientIpRoutable: false }
    next();
});
// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Replace with your MySQL root password
    database: 'tennis_league_local'
});
https.createServer(options, app)
.listen(8443, function (req, res) {  
      
    console.log(res)                    //Change Port Number here (if required, 443 is the standard port for https)
console.log("Server started at port 3000");   
})
connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

// Utility function to shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

  app.get('/deadline',async (req,res) => {
   
  updateScheduleWithDates();
   res.json(true)
  })
  app.get('/getSeasons',async (req,res) => {
    const query = `
    SELECT 
       *
    FROM 
        season
`;
connection.query(query,  (err, results) => {
  if (err) {
    console.error('Error fetching seasons:', err);
    res.status(500).json({ error: 'An error occurred while fetching matches' });
    return;
  }
  res.json(results);
  
});
  
    
    })
 
    app.get('/getMyMatches', (req, res) => {
        const userid = req.query.id;
        const season = req.headers.season;
    
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
    (hp.id=? or ap.id=?)
    AND ps_home.season_id = ?
ORDER BY 
    s.week;
        `;
        
        // Execute query with the userid and season passed for both home and away players
        connection.query(query, [  userid, userid,season,], (err, data) => {
            if (err) {
                console.error('Error fetching matches:', err);
                res.status(500).json({ error: 'An error occurred while fetching matches' });
                return;
            }
    
            // Return the data or message if no matches found
            if (data.length == 0) {
                res.json({ message: 'No matches found in the league for the user.' });
            } else {
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
        round.forEach(match => {
            const [home, away] = match;

            if (home == null || away == null) {
                // Skip matches with dummy players
                return;
            }

            if (!homeAwayMap.has(home)) homeAwayMap.set(home, 'home');
            if (!homeAwayMap.has(away)) homeAwayMap.set(away, 'away');

            const homeLastWeek = homeAwayMap.get(home);
            const awayLastWeek = homeAwayMap.get(away);

            if (homeLastWeek == 'home') {
                roundMatches.push([away, home]);
                homeAwayMap.set(home, 'away');
                homeAwayMap.set(away, 'home');
            } else {
                roundMatches.push([home, away]);
                homeAwayMap.set(home, 'home');
                homeAwayMap.set(away, 'away');
            }
        });
        updatedSchedule.push(roundMatches);
    });

    return updatedSchedule;
}
// Function to generate a random tennis score


    
const leagueStartDate = new Date('2024-05-19');

// Helper function to calculate the deadline
function calculateDeadline(week) {
    const leagueStartDate = new Date('2024-05-19'); // Adjust the start date if necessary
    const deadlineDate = new Date(leagueStartDate);
    deadlineDate.setDate(deadlineDate.getDate() + (week * 7)); // Add 7 days per week

    // Return the epoch time (timestamp in milliseconds)
    return deadlineDate.getTime();
}
// Endpoint to parse PDFs
app.get('/parsepdfmoski', async (req, res) => {
    const url = 'http://www.tenis-radgona.si/images/stories/liga_2023/';
    let dataBuffer = "";

    for (let i = 1; i < 16; i++) {
        try {
            const config = {
                method: 'get',
                url: `${url}${i}_kolo_objava.pdf`,
                responseType: 'arraybuffer',
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
        pdfparse(dataBuffer).then(async function (data) {
            const lines = data["text"].split('\n').filter(line => line.trim() !== '');
            console.log(lines);
            const results = [];
            let currentLeague = '';
            let currentWeek = '';

            lines.forEach(line => {
                const leagueMatch = line.match(/^(\d+ liga|[^\d].* liga)/);
                const weekMatch = line.match(/^Rezultati\s*(\d+)\s*kolo/);

                if (weekMatch) {
                    currentWeek = weekMatch[1];
                }

                if (leagueMatch) {
                    currentLeague = leagueMatch[0].trim();
                } else {
                    const matchDetails = line.match(/^([^:]+):([^0-9]+)([\d:]+(?:[\d:]+)*)$/);
                    if (matchDetails) {
                        const homePlayer = matchDetails[1].trim();
                        const awayPlayer = matchDetails[2].trim();
                        let sets = matchDetails[3];

                        sets = sets.replace(/:/g, '-').replace(/(\d-\d)(?=\d-\d)/g, '$1,');
                        if (sets == "0-0,0-0,0-0") {
                            sets = ['No result'];
                        } else {
                            sets = sets.split(',').map(set => set.trim()).filter(set => !/^0-0$/.test(set));
                        }

                        if (sets.length > 0) {
                            results.push({
                                league: currentLeague,
                                week: currentWeek,
                                homePlayer,
                                awayPlayer,
                                sets,
                                deadline: calculateDeadline(currentWeek) // Calculate deadline
                            });
                        }
                    }
                }
            });

            await insertScheduleWithResults(results);
        }).catch(error => {
            console.error(`Failed to parse PDF data:`, error);
        });
    }

    res.json("success");

    // Function to insert results into the schedule table
    async function insertScheduleWithResults(parsedResults) {
        for (const result of parsedResults) {
            const { league, week, homePlayer, awayPlayer, sets, deadline } = result;
            const resultStr = sets.join(',');
    
            // Fetch league and season IDs
            const leagueId = await getLeagueIdByName(league);
            const seasonId = await getSeasonIdByName('2023');
    
            if (!leagueId || !seasonId) {
                console.error(`League or Season not found: League = ${league}, Season = 2024`);
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
                const homePlayerSeasonId = await getPlayerSeasonId(homePlayerId, leagueId, seasonId);
                const awayPlayerSeasonId = await getPlayerSeasonId(awayPlayerId, leagueId, seasonId);
    
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
                    console.log(homePlayer,awayPlayer,resultStr)
                    const queryParams = [homePlayerSeasonId, awayPlayerSeasonId, resultStr, week, deadline];
                        console.log(queryParams)
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
                        console.error(`Error inserting match for ${homePlayer} vs ${awayPlayer}:`, error);
                    }
                } else {
                    console.error(`PlayerSeason ID not found for ${homePlayer} or ${awayPlayer}`);
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
    
            connection.query(insertQuery, [playerId, leagueId, seasonId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    
    // Helper function to get player_season.id
    async function getPlayerSeasonId(playerId, leagueId, seasonId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id 
                FROM players_season 
                WHERE player_id = ? AND league_id = ? AND season_id = ?;`;
    
            connection.query(query, [playerId, leagueId, seasonId], (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.length > 0) {
                    resolve(results[0].id); // Return players_season.id
                } else {
                    resolve(null); // No matching record found
                }
            });
        });
    }
    
   // Helper function to get or insert a player and return the player ID
async function getPlayerId(playerName) {
    return new Promise((resolve, reject) => {
        let reversedName = playerName.split(' ').reverse().join(' ');

        // Check if the player exists
        const selectQuery = 'SELECT id FROM players WHERE name=? OR name=?';
        connection.query(selectQuery, [playerName, reversedName], (err, results) => {
            if (err) {
                return reject(err);
            }

            if (results.length > 0) {
                // Player exists
                return resolve(results[0].id);
            }

            // Player does not exist, insert into database
            const insertQuery = 'INSERT INTO players (name) VALUES (?)';
            connection.query(insertQuery, [playerName], (err, insertResults) => {
                if (err) {
                    return reject(err);
                }

                // Return the ID of the newly inserted player
                resolve(insertResults.insertId);
            });
        });
    });
}
    

    // Function to insert players into player_season
    async function insertPlayerSeason(playerId, leagueId, seasonId) {
        return new Promise((resolve, reject) => {
            // First, check if the player is already in the player_season table
            const selectQuery = `SELECT id FROM players_season WHERE player_id=? AND league_id=? AND season_id=?;`;

            connection.query(selectQuery, [playerId, leagueId, seasonId], (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.length > 0) {
                    resolve(); // Player already in player_season
                } else {
                    // Insert the player into the player_season table
                    const insertQuery = `INSERT INTO players_season (player_id, league_id, season_id, promotion_status) VALUES (?, ?, ?, 'active');`;
                    connection.query(insertQuery, [playerId, leagueId, seasonId], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                }
            });
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


app.get('/parsepdfzenske', async (req, res) => {
    const url = 'http://www.tenis-radgona.si/images/stories/liga_2024/rezultati_ženske_2024.pdf';
    let dataBuffer = "";

    // Reading PDF file from local path
    dataBuffer = fs.readFileSync("../../../../../../Users/zan_s/Desktop/rezultati lige/rezultati_ženske_2024.pdf");

    // Parse PDF data
    let data;
    try {
        data = await pdfparse(dataBuffer);
    } catch (error) {
        console.error('Failed to parse PDF data:', error);
        res.status(500).json({ message: 'Failed to parse PDF data' });
        return;
    }

    function parseMatchData(data) {
        const lines = data["text"].split('\n').filter(line => line.trim() !== '');
        const results = [];
        let currentWeek = '';
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
            if (line.includes(':')) {
                [homePlayer, awayPlayer] = line.split(':').map(str => str.trim());
                continue;
            }

            // Handle match results
            if (line == "000000") {
                results.push({
                    week: currentWeek,
                    homePlayer: homePlayer,
                    awayPlayer: awayPlayer,
                    matchResult: 'No result',
                    league: 6, // Assuming league 6 for women's league
                    deadline: calculateDeadline(currentWeek)
                });
            } else if (!isNaN(line)) {
                const pairs = line.match(/(\d{2})/g);
                const filteredPairs = pairs.filter(pair => !(pair[0] == '0' && pair[1] == '0'));
                const resultStr = filteredPairs.map(pair => pair[0] + '-' + pair[1]).join(',');

                results.push({
                    week: currentWeek,
                    homePlayer: homePlayer,
                    awayPlayer: awayPlayer,
                    matchResult: resultStr,
                    league: 6,
                    deadline: calculateDeadline(currentWeek)
                });
            }
        }

        return results;
    }

    const parsedResults = parseMatchData(data);

    // Insert results into the database
    try {
        await insertScheduleWithResults(parsedResults);
        res.json({ message: 'Success', results: parsedResults });
    } catch (error) {
        console.error('Failed to insert results:', error);
        res.status(500).json({ message: 'Failed to insert results' });
    }

    // Function to insert results into the schedule table
    async function insertScheduleWithResults(parsedResults) {
        for (const result of parsedResults) {
            const { homePlayer, awayPlayer, matchResult, league, week, deadline } = result;

            // Fetch league and season IDs
            const leagueId = await getLeagueIdByName(league);
            const seasonId = await getSeasonIdByName('2024');

            if (!leagueId || !seasonId) {
                console.error(`League or Season not found: League = ${league}, Season = 2024`);
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
                const homePlayerSeasonId = await getPlayerSeasonId(homePlayerId, leagueId, seasonId);
                const awayPlayerSeasonId = await getPlayerSeasonId(awayPlayerId, leagueId, seasonId);

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

                const queryParams = [homePlayerSeasonId, awayPlayerSeasonId, matchResult, week, deadline];

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
                    console.error(`Error inserting match for ${homePlayer} vs ${awayPlayer}:`, error);
                }
            } else {
                console.error(`Player ID not found for ${homePlayer} or ${awayPlayer}`);
            }
        }
    }

    // Helper function to get player ID from the database
    async function getPlayerId(playerName) {
        return new Promise((resolve, reject) => {
            let reversedName = playerName.split(' ').reverse().join(' ');

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
            connection.query(query, [playerId, leagueId, seasonId], (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.length > 0) {
                    resolve(results[0].id);
                } else {
                    resolve(null); // Player in the season not found
                }
            });
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
        const deadlineDate = new Date(startDate.getTime() + (week * 7 * 24 * 60 * 60 * 1000)); // Add week number
        return deadlineDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
});


app.get('/getmatches/:leagueId', (req, res) => {
    const leagueId = req.params.leagueId;
    const seasonId=req.headers.season
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
            console.error('Error fetching matches:', err);
            res.status(500).json({ error: 'An error occurred while fetching matches' });
            return;
        }
        console.log(results);
        res.json(results);
    });
});
// Route to generate and store the round-robin schedule
app.get('/generate-schedule', (req, res) => {
    // Fetch player IDs
    connection.query('SELECT id, name FROM players WHERE league_id=6', (err, data) => {
        if (err) {
            console.error('Error fetching players:', err);
            res.status(500).json({ error: 'An error occurred while fetching players' });
            return;
        }

        // Extract player IDs from the query result
        const playerIds = data.map(row => row.id);
        const playerNameMap = new Map(data.map(row => [row.id, row.name])); // Map IDs to names for reference

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
                const query = 'INSERT INTO schedule (week, home_player, away_player, league_id, season, deadline) VALUES (?, ?, ?, ?, ?, ?)';
                connection.query(query, [week + 1, homePlayerId, awayPlayerId, 6, '1', calculateDeadline(week + 1)], (err, results) => {
                    if (err) {
                        console.error('Error inserting match:', err);
                    } else {
                        console.log('Inserted match:', results.insertId);
                    }
                });
            }
        }

        res.json({ message: 'Schedule generated and stored in the database.' });
    });
});






app.get('/calculate-standings/:id', (req, res) => {
    let leagueId = req.params.id;
    let seasonId = req.headers.season || 5; // Assuming seasonId is 1 for now, you can dynamically fetch it if needed

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
    hps.player_id AS player_id
FROM 
    schedule s
JOIN 
    players_season hps ON s.home_player = hps.id AND hps.league_id = ? AND hps.season_id = ?
WHERE 
    hps.league_id = ?
UNION
SELECT DISTINCT 
    aps.id AS player_season_id,
    aps.player_id AS player_id
FROM 
    schedule s
JOIN 
    players_season aps ON s.away_player = aps.id AND aps.league_id = ? AND aps.season_id = ?
WHERE 
    aps.league_id = ?
`;

    // Fetch matches
connection.query(fetchMatchesQuery, [leagueId, seasonId, leagueId, seasonId, leagueId], (err, matches) => {
    if (err) {
        console.error('Error fetching matches:', err);
        res.status(500).json({ error: 'An error occurred while fetching matches' });
        return;
    }
  
    // Fetch players
    connection.query(fetchPlayersQuery, [leagueId, seasonId, leagueId, leagueId, seasonId,leagueId], (err, players) => {
        if (err) {
            console.error('Error fetching players:', err);
            res.status(500).json({ error: 'An error occurred while fetching players' });
            return;
        }
        
            const standings = {};
        console.log(players)
            // Initialize standings for all players
            players.forEach(player => {
                standings[player.player_season_id] = { points: 0, netGamesWon: 0, setsPlayed: 0, netSetsWon: 0, matchesPlayed: 0, matchesWon: 0 };
            });

            matches.forEach(match => {
                if (!match.result) {
                    return;  // Skip matches with no result
                }

                const sets = match.result.split(',').map(set => set.trim());
                if (sets.length < 2) {
                    return;  // Skip invalid match results
                }

                let homeSetsWon = 0;
                let awaySetsWon = 0;

                sets.forEach(set => {
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

                const homeGamesWon = sets.reduce((acc, set) => acc + parseInt(set.split("-")[0]), 0);
                const awayGamesWon = sets.reduce((acc, set) => acc + parseInt(set.split("-")[1]), 0);

                standings[homePlayerSeasonId].netGamesWon += homeGamesWon - awayGamesWon;
                standings[awayPlayerSeasonId].netGamesWon += awayGamesWon - homeGamesWon;

                standings[homePlayerSeasonId].netSetsWon += homeSetsWon - awaySetsWon;
                standings[awayPlayerSeasonId].netSetsWon += awaySetsWon - homeSetsWon;

                standings[homePlayerSeasonId].setsPlayed += homeSetsWon + awaySetsWon;
                standings[awayPlayerSeasonId].setsPlayed += homeSetsWon + awaySetsWon;
            });

           const reorderStandings = () => {
    const playerSeasonIds = Object.keys(standings);

    playerSeasonIds.sort((playerA, playerB) => {
        const pointsDiff = standings[playerB].points - standings[playerA].points;
       
        if (pointsDiff !== 0) {
            return pointsDiff;
        }

        // Handle tie cases
        const tiedPlayers = playerSeasonIds.filter(playerId => standings[playerId].points == standings[playerA].points);

        // If two players are tied
        if (tiedPlayers.length == 2) {
            console.log(tiedPlayers)
            const player1 = tiedPlayers[0];
            const player2 = tiedPlayers[1];
          
            // Find the head-to-head match between the tied players
            const headToHeadMatch = matches.find(match =>
                (match.home_player == player1 && match.away_player == player2) ||
                (match.home_player == player2 && match.away_player == player1)
            );
            console.log(headToHeadMatch)
            if (headToHeadMatch && headToHeadMatch.result) {
                const sets = headToHeadMatch.result.split(',').map(set => set.trim());

let homeGamesWon = 0;
let awayGamesWon = 0;

sets.forEach(set => {
    const [homeScore, awayScore] = set.split("-").map(score => parseInt(score, 10));
    if (homeScore > awayScore) {
        homeGamesWon++;
    } else if (awayScore > homeScore) {
        awayGamesWon++;
    }
});

                if (homeGamesWon > awayGamesWon) {
                    console.log("haha")
                    return headToHeadMatch.home_player == player1 ? 1 : -1;
                } else {
                    return headToHeadMatch.away_player == player2 ? -1 : 1;
                }
            }
        }

        // If more than two players are tied
        if (tiedPlayers.length > 2) {
            const winsAgainstEachOther = {};

            tiedPlayers.forEach(player => {
                winsAgainstEachOther[player] = 0;
            });

            const checkedPairs = new Set();

            // Compare each pair of tied players
            tiedPlayers.forEach((playerA, indexA) => {
                tiedPlayers.slice(indexA + 1).forEach(playerB => {
                    const pairIdentifier = [playerA, playerB].sort().join('-');
                    if (!checkedPairs.has(pairIdentifier)) {
                        checkedPairs.add(pairIdentifier);

                        const match = matches.find(m =>
                            (m.home_player == playerA && m.away_player == playerB) ||
                            (m.home_player == playerB && m.away_player == playerA)
                        );
                            console.log(match)
                        if (match && match.result) {
                            const sets = match.result.split(',').map(set => set.trim());
                            let homeGamesWon = 0;
                            let awayGamesWon = 0;
                            
                            sets.forEach(set => {
                                const [homeScore, awayScore] = set.split("-").map(score => parseInt(score, 10));
                                if (homeScore > awayScore) {
                                    homeGamesWon++;
                                } else if (awayScore > homeScore) {
                                    awayGamesWon++;
                                }
                            });
                            

                            if (match.home_player == playerA) {
                              
                                winsAgainstEachOther[homeGamesWon > awayGamesWon ? playerA : playerB] += 1;
                            } else {
                                winsAgainstEachOther[homeGamesWon > awayGamesWon ? playerB : playerA] += 1;
                            }
                        }
                    }
                });
            });

            // Sort based on wins against each other
            tiedPlayers.sort((playerA, playerB) => {
                return winsAgainstEachOther[playerB] - winsAgainstEachOther[playerA];
            });

            // If still tied, sort by net sets won
            // if (winsAgainstEachOther[tiedPlayers[0]] == winsAgainstEachOther[tiedPlayers[1]]) {
            //     console.log("haha1")
            //     tiedPlayers.sort((playerA, playerB) => standings[playerB].netSetsWon - standings[playerA].netSetsWon);
            // }

            // // If still tied, sort by net games won
            // if (standings[tiedPlayers[0]].netSetsWon == standings[tiedPlayers[1]].netSetsWon) {
            //     console.log("haha2")
            //     tiedPlayers.sort((playerA, playerB) => standings[playerB].netGamesWon - standings[playerA].netGamesWon);
            // }
           
            return tiedPlayers.indexOf(playerA) - tiedPlayers.indexOf(playerB);
        }

        return 0; // Default case
    });

    return playerSeasonIds; // Return the sorted list of playerSeason IDs
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
                            'all',  // Example week
                            index + 1  // Position (index + 1 for 1-based rank)
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
                    res.json({ message: 'Standings calculated, ranked, and updated successfully' });
                })
                .catch(err => {
                    console.error('Error inserting/updating standings:', err);
                    res.status(500).json({ error: 'An error occurred while inserting/updating standings' });
                });
        });
    });
});

// Get standings from MySQL
// Get standings from MySQL
app.get('/standings/:id', (req, res) => {
    const leagueId = req.params.id;
    const seasonId = req.headers.season; // Example season ID, this could be dynamic if necessary.
  
    const query = `
      SELECT 
        standings.*,
        ps.player_id, 
        ps.league_id,
        ps.season_id,
        p.name 
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
        console.error('Error fetching standings:', err);
        res.status(500).json({ error: 'An error occurred while fetching standings' });
        return;
      }
      res.json(results);
    });
  });
  
  
  app.post('/update-match-result', (req, res) => {
    
    const { id, result } = req.body;
    const query = 'UPDATE schedule SET result = ? WHERE id = ?';
  
    connection.query(query, [result, id], (err, results) => {
      if (err) {
        console.error('Error updating match result:', err);
        res.status(500).json({ error: 'An error occurred while updating match result' });
        return;
      }
  
      res.json({ message: 'Match result updated successfully' });
    });
  });
  app.post('/endLeague', (req, res) => {
    
   // const { id, result } = req.body;
    const query = 'UPDATE season SET status = "finished" WHERE year="2024"';
    
    connection.query(query, [], (err, results) => {
      if (err) {
        console.error('Error updating match result:', err);
        res.status(500).json({ error: 'An error occurred while updating match result' });
        return;
      }
  
      res.json({ message: 'Match result updated successfully' });
    });
  });

  app.get('/leagues', (req, res) => {
    const query = 'SELECT * FROM leagues ORDER BY name ASC';
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching standings:', err);
        res.status(500).json({ error: 'An error occurred while fetching standings' });
        return;
      }
      res.json(results);
    });
  });
  app.post('/confirmResult', (req, res) => {
    
    const { id } = req.body;
    const query = 'UPDATE schedule SET result_confirmed = 1 WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
          console.error('Error updating match result:', err);
          res.status(500).json({ error: 'An error occurred while updating match result' });
          return;
        }
    
        res.json({ message: 'Rezultat je bil uspešno potrjen' });
      });
  })
  app.post('/forfeitMatch', (req, res) => {
    
    const { id,result } = req.body;
    const query = 'UPDATE schedule SET result_confirmed = 1,result=? WHERE id = ?';
    connection.query(query, [result,id], (err, results) => {
        if (err) {
          console.error('Error updating match result:', err);
          res.status(500).json({ error: 'An error occurred while updating match result' });
          return;
        }
    
        res.json({ message: 'Tekma je bila predana' });
      });
  })
  app.get('/leagues/:id/players', (req, res) => {
    const leagueId = req.params.id;
    const seasonId=req.headers.season
    const query = `
      SELECT p.*, ps.* 
      FROM players p
      JOIN players_season ps ON p.id = ps.player_id
      WHERE ps.league_id = ? and ps.season_id = ?
      ORDER BY p.name ASC
    `;
    
    connection.query(query, [leagueId,seasonId], (err, results) => {
      if (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ error: 'An error occurred while fetching players' });
        return;
      }
      res.json(results);
    });
  });
  app.get('/unplayedMatches', (req, res) => {
    const leagueId = req.params.id;
    const query = `
 SELECT schedule.id, players.name AS home_player, players2.name AS away_player, schedule.result,schedule.week,schedule.deadline,schedule.league_id FROM schedule JOIN players AS players ON schedule.home_player = players.id JOIN players AS players2 ON schedule.away_player = players2.id WHERE schedule.result = 'No result' ORDER BY schedule.week;
`;
  
    connection.query(query, [leagueId], (err, results) => {
      if (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ error: 'An error occurred while fetching players' });
        return;
      }
      res.json(results);
    });
  });
  app.get('/getplayers', (req, res) => {
    const leagueId = req.params.id;
    const query = 'SELECT * FROM players    ';
  
    connection.query(query, [leagueId], (err, results) => {
      if (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ error: 'An error occurred while fetching players' });
        return;
      }
      res.json(results);
    });
  });
  app.get('/getUsers', (req, res) => {
    const leagueId = req.params.id;
    const query = `
    SELECT *,users.id, users.name, players.id AS playerId
    FROM users
    LEFT JOIN players ON users.id = players.user_id;
  `;
  
    connection.query(query, [leagueId], (err, results) => {
      if (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ error: 'An error occurred while fetching players' });
        return;
      }
      res.json(results);
    });
  });
  app.post('/linkplayer', (req, res) => {
    
    const { userid,playerid } = req.body;
    const query = 'UPDATE players SET user_id = ? WHERE id = ?';
    connection.query(query, [userid,playerid], (err, results) => {
        if (err) {
          console.error('Error updating match result:', err);
          res.status(500).json({ error: 'An error occurred while updating match result' });
          return;
        }
    
        res.json({ message: 'Tekma je bila predana' });
      });
  })
  app.post('/register', (req, res) => {
    users=[]
    const { name,phone,email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    users.push({ email, password: hashedPassword });
    const query = 'INSERT INTO users (name,phone,email,password) VALUES (?,?,?,?)';
  
    connection.query(query, [name,phone,email,hashedPassword], (err, results) => {
      if (err) {
        console.error('Error inserting user', err);
        res.status(500).json({ error: 'error inserting user' });
        return;
      }else{
        res.json(results);
      }
      
    });
    
  });

  app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email=?';
  
    connection.query(query, [email], (err, results) => {
      if (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ error: 'An error occurred while fetching players' });
        return;
      }
      

    if (results[0].email && bcrypt.compareSync(password, results[0].password)) {
      const token = jwt.sign({ email: results[0].email,role:results[0].role,name:results[0].name,id:results[0].id }, 'secret', { expiresIn: '1h' });
      
      res.send({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  });

  })


// app.listen(port, () => {
//     console.log(`Server is running at https://192.168.0.24:${port}`);
// });