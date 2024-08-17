




var express = require('express')
  , fs = require('fs')
  
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
async function updateScheduleWithDates() {
    console.log("haha")
    const startDate = moment('2024-05-26'); // Start date as the last week of May
  
    // Query to get all matches ordered by week
    const query = 'SELECT id, week FROM schedule ORDER BY week ASC';
  
    try {
      const matches = await new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
  
      for (const match of matches) {
        const playDate = startDate.clone().add((match.week - 1) * 7, 'days').format('DD-MM-YYYY');
  
        const updateQuery = 'UPDATE schedule SET deadline = ? WHERE id = ?';
        const queryParams = [playDate, match.id];
  
        await new Promise((resolve, reject) => {
          connection.query(updateQuery, queryParams, (err, results) => {
            if (err) {
                console.log(err)
              reject(err);
            } else {
                
              resolve(results);
            }
          });
        });
       
        console.log(`Match ID ${match.id} updated with play date ${playDate}`);
      }
  
    } catch (error) {
      console.error('Error updating schedule:', error);
    } finally {
    
    }
  }
  app.get('/deadline',async (req,res) => {
   
  updateScheduleWithDates();
   res.json(true)
  })
 
  app.get('/getMyMatches', (req, res) => {
    const userid = req.query.id;

    // Query to fetch all matches in the league for the user
    const query = `
        SELECT s.*, 
               COALESCE(p1.name, 'Unknown') AS home_player, 
               COALESCE(p2.name, 'Unknown') AS away_player,
               COALESCE(p1.user_id, 'Unknown') AS home_player_id, 
               COALESCE(p2.user_id, 'Unknown') AS away_player_id,
               COALESCE(p1.phone, 'Unknown') AS phone_home,
               COALESCE(p2.phone, 'Unknown') AS phone_away
        FROM schedule s
        LEFT JOIN players p1 ON s.home_player = p1.id
        LEFT JOIN players p2 ON s.away_player = p2.id
        WHERE (s.home_player = ? OR s.away_player = ?)
        ORDER BY s.week ASC;
    `;

    connection.query(query, [userid, userid], (err, data) => {
        if (err) {
            console.error('Error fetching matches:', err);
            res.status(500).json({ error: 'An error occurred while fetching matches' });
            return;
        }

        // If data is found, return it; otherwise, you might want to handle the case where no matches are found
        if (data.length === 0) {
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
            if (match === 0) {
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

            if (home === null || away === null) {
                // Skip matches with dummy players
                return;
            }

            if (!homeAwayMap.has(home)) homeAwayMap.set(home, 'home');
            if (!homeAwayMap.has(away)) homeAwayMap.set(away, 'away');

            const homeLastWeek = homeAwayMap.get(home);
            const awayLastWeek = homeAwayMap.get(away);

            if (homeLastWeek === 'home') {
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
    const url = 'http://www.tenis-radgona.si/images/stories/liga_2024/';
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
            console.log(lines)
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
                        if (sets === "0-0,0-0,0-0") {
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

            // Fetch player IDs from the players table
            const homePlayerId = await getPlayerId(homePlayer);
            const awayPlayerId = await getPlayerId(awayPlayer);

            if (homePlayerId && awayPlayerId) {
                const insertQuery = `
                    INSERT INTO schedule (home_player, away_player, result, league_id, week, season, deadline)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;

                const queryParams = [homePlayerId, awayPlayerId, resultStr, league, week, '1', deadline];

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

            // Escape user inputs to prevent SQL injection
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
            if (line === "000000") {
                results.push({
                    week: currentWeek,
                    homePlayer: homePlayer,
                    awayPlayer: awayPlayer,
                    matchResult: 'No result',
                    league: 6,
                    deadline: calculateDeadline(currentWeek)
                });
            } else if (!isNaN(line)) {
                const pairs = line.match(/(\d{2})/g);
                const filteredPairs = pairs.filter(pair => !(pair[0] === '0' && pair[1] === '0'));
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

    // Insert results into database
    console.log(parsedResults);
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

            // Fetch player IDs from the players table
            const homePlayerId = await getPlayerId(homePlayer);
            const awayPlayerId = await getPlayerId(awayPlayer);

            if (homePlayerId && awayPlayerId) {
                const insertQuery = `
                    INSERT INTO schedule (home_player, away_player, result, league_id, week, deadline,season)
                    VALUES (?, ?, ?, ?, ?, ?,?)`;

                const queryParams = [homePlayerId, awayPlayerId, matchResult, league, week, deadline,'1'];

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

            // Escape user inputs to prevent SQL injection
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
});
app.get('/getmatches/:id', (req, res) => {
    
    const leagueId = req.params.id;
    console.log(leagueId)
    const query = `
        SELECT 
            s.id,
            s.home_player,
            hp.name AS home_player,
            s.away_player,
            ap.name AS away_player,
            s.result,
            s.league_id,
            s.week,
            s.deadline
        FROM 
            schedule s
        JOIN 
            players hp ON s.home_player = hp.id
        JOIN 
            players ap ON s.away_player = ap.id
        WHERE 
            s.league_id = ?
        ORDER BY 
            s.week
    `;
    connection.query(query, [leagueId], (err, results) => {
      if (err) {
        console.error('Error fetching matches:', err);
        res.status(500).json({ error: 'An error occurred while fetching matches' });
        return;
      }console.log(results)
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

function updateScores() {
    console.log("Updating scores...");

    connection.query('SELECT id FROM schedule', (err, matches) => {
        if (err) {
            console.error('Error fetching matches:', err);
            return;
        }

        for (const match of matches) {
            const randomScore = generateRandomScore();
            connection.query('UPDATE schedule SET result = ? WHERE id = ?', [randomScore, match.id], (err) => {
                if (err) {
                    console.error('Error updating match:', err);
                } else {
                    console.log(`Updated match ID ${match.id} with score ${randomScore}`);
                }
            });
        }
    });
}

app.get('/randomscores', (req, res) => {
    updateScores();
    res.json({message: "Scores updated!"});
});


app.get('/calculate-standings/:id', (req, res) => {
    let leagueId = req.params.id;
    const fetchMatchesQuery = `
        SELECT 
            s.home_player,
            hp.name AS home_player,
            s.away_player,
            ap.name AS away_player,
            s.result
        FROM 
            schedule s
        JOIN 
            players hp ON s.home_player = hp.id
        JOIN 
            players ap ON s.away_player = ap.id
        WHERE 
            s.league_id = ?
    `;

    const fetchPlayersQuery = `
        SELECT DISTINCT 
            hp.name AS player
        FROM 
            schedule s
        JOIN 
            players hp ON s.home_player = hp.id
        WHERE 
            s.league_id = ?
        UNION
        SELECT DISTINCT 
            ap.name AS player
        FROM 
            schedule s
        JOIN 
            players ap ON s.away_player = ap.id
        WHERE 
            s.league_id = ?
    `;

    console.log('League ID:', leagueId);

    connection.query(fetchMatchesQuery, [leagueId], (err, matches) => {
        if (err) {
            console.error('Error fetching matches:', err);
            res.status(500).json({ error: 'An error occurred while fetching matches' });
            return;
        }

        connection.query(fetchPlayersQuery, [leagueId, leagueId], (err, players) => {
            if (err) {
                console.error('Error fetching players:', err);
                res.status(500).json({ error: 'An error occurred while fetching players' });
                return;
            }

            const standings = {};

            // Initialize standings for all players
            players.forEach(player => {
                standings[player.player] = { points: 0, netGamesWon: 0, matchesPlayed: 0 };
            });

            matches.forEach(match => {
                if (!match.result) {
                    console.log('Skipping match with no result:', match);
                    return;
                }

                // Split the result into sets
                const sets = match.result.split(',').map(set => set.trim());
                if (sets.length < 2) {
                    console.log('Skipping match with insufficient sets:', match);
                    return;
                }

                const [set1, set2, set3] = sets;
                let homeGamesWon = parseInt(set1.split("-")[0]) + parseInt(set2.split("-")[0]);
                let awayGamesWon = parseInt(set1.split("-")[1]) + parseInt(set2.split("-")[1]);

                if (set3) {
                    homeGamesWon += parseInt(set3.split("-")[0]);
                    awayGamesWon += parseInt(set3.split("-")[1]);
                }

                const homePlayer = match.home_player;
                const awayPlayer = match.away_player;

                if (!standings[homePlayer]) {
                    standings[homePlayer] = { points: 0, netGamesWon: 0, matchesPlayed: 0 };
                }
                if (!standings[awayPlayer]) {
                    standings[awayPlayer] = { points: 0, netGamesWon: 0, matchesPlayed: 0 };
                }

                // Increment the matches played count
                standings[homePlayer].matchesPlayed += 1;
                standings[awayPlayer].matchesPlayed += 1;

                // Calculate points and net games won
                if (homeGamesWon > awayGamesWon) {
                    standings[homePlayer].points += 2;
                } else {
                    standings[awayPlayer].points += 2;
                }

                standings[homePlayer].netGamesWon += homeGamesWon - awayGamesWon;
                standings[awayPlayer].netGamesWon += awayGamesWon - homeGamesWon;
            });

            // Clear the existing standings
            const clearStandingsQuery = 'DELETE FROM standings WHERE league_id = ?';

            connection.query(clearStandingsQuery, [leagueId], err => {
                if (err) {
                    console.error('Error clearing standings table:', err);
                    res.status(500).json({ error: 'An error occurred while clearing standings table' });
                    return;
                }

                // Insert new standings
                const insertStandingsQuery = 'INSERT INTO standings (player, points, netGamesWon, matches_played, league_id,season_id,week) VALUES ?';
                const standingsValues = Object.entries(standings).map(([player, stats]) => [player, stats.points, stats.netGamesWon, stats.matchesPlayed, leagueId,'1','all']);

                if (standingsValues.length > 0) {
                    connection.query(insertStandingsQuery, [standingsValues], err => {
                        if (err) {
                            console.error('Error inserting standings:', err);
                            res.status(500).json({ error: 'An error occurred while inserting standings' });
                            return;
                        }

                        res.json({ message: 'Standings calculated and stored successfully' });
                    });
                } else {
                    res.json({ message: 'No standings to insert' });
                }
            });
        });
    });
});
  // Get standings from MySQL
  app.get('/standings/:id', (req, res) => {
    console.log(req.params.id)
    const leagueId = req.params.id;
    const query = 'SELECT * FROM standings WHERE league_id=? ORDER BY points DESC, netGamesWon DESC';
  
    connection.query(query,([leagueId]), (err, results) => {
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
  
  app.get('/leagues/:id/players', (req, res) => {
    const leagueId = req.params.id;
    const query = 'SELECT * FROM players WHERE league_id = ? ORDER BY name ASC';
  
    connection.query(query, [leagueId], (err, results) => {
      if (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ error: 'An error occurred while fetching players' });
        return;
      }
      res.json(results);
    });
  });
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