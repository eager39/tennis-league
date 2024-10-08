




var express = require('express')
  , fs = require('fs')
  
  const https = require("https");
var privateKey = fs.readFileSync('cert/key.pem').toString();
var certificate = fs.readFileSync('cert/certificate.pem').toString();  
const options = {
    key: fs.readFileSync("cert/key.pem"),                  //Change Private Key Path here
    cert: fs.readFileSync("cert/certificate.pem"),            //Change Main Certificate Path here
               //Change Intermediate Certificate Path here
    };
// To enable HTTPS
//var app = module.exports = express({key: privateKey, cert: certificate});
const mysql = require('mysql');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const { abort } = require('process');
const pdfparse =require("pdf-parse")

const axios = require('axios');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { match } = require('assert');
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
    database: 'tennis_league'
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

// Function to generate the round-robin schedule
function generateRoundRobinSchedule(players) {
    const numPlayers = players.length;
    if (numPlayers % 2 !== 0) {
        players.push('BYE'); // Add a dummy player if odd number of players
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
                roundMatches.push([players[home], players[numPlayers - 1]]);
            } else {
                roundMatches.push([players[home], players[away]]);
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
function generateRandomScore() {
    // Generates a valid set score
    const getValidSetScore = () => {
        let winningScore = 6;
        let losingScore;

        // 10% chance for a tie-break scenario
        if (Math.random() < 0.1) {
            return "7-6"; // Tie-break scenario
        } else {
            // Generate losing score between 0 and 4
            losingScore = Math.floor(Math.random() * 5);
            return `${winningScore}-${losingScore}`;
        }
    };

    // Randomly assign set winners
    const determineSetWinner = () => Math.random() < 0.5 ? 'Player1' : 'Player2';

    // Generate scores and determine winners for the first two sets
    const set1Score = getValidSetScore();
    const set2Score = getValidSetScore();

    // Determine the winners based on the scores
    const [set1WinnerScore, set1LoserScore] = set1Score.split('-').map(Number);
    const [set2WinnerScore, set2LoserScore] = set2Score.split('-').map(Number);

    // Determine the set winners
    const set1ActualWinner = set1WinnerScore > set1LoserScore ? 'Player1' : 'Player2';
    const set2ActualWinner = set2WinnerScore > set2LoserScore ? 'Player1' : 'Player2';

    // Decide if a third set is needed
    if (set1ActualWinner === set2ActualWinner) {
        // If the same player wins both sets, no third set is needed
        return `${set1Score}, ${set2Score}`;
    } else {
        // Generate a third set score
        const set3Score = getValidSetScore();
        return `${set1Score}, ${set2Score}, ${set3Score}`;
    }
} 

    
app.get('/parsepdfmoski',async (req,res) => {
    const url = 'http://www.tenis-radgona.si/images/stories/liga_2024/';
const fileName = '_kolo_objava.pdf';
let dataBuffer=""
for (let i = 1; i < 16; i++) {
    try {
        const config = {
            method: 'get',
            url: `http://www.tenis-radgona.si/images/stories/liga_2024/${i}_kolo_objava.pdf`,
            responseType: 'arraybuffer',
            headers: {
                // Put your headers here if required
            },
        };

        console.log(`Fetching ${i}.pdf...`);
        const response = await axios(config);

        const filePath = path.join(__dirname, `${i}_kolo_objava.pdf`);
        dataBuffer= Buffer.from(response.data);
        console.log(dataBuffer)
        console.log(`${i}.pdf saved successfully!`);
    } catch (error) {
        console.error(`Failed to fetch or save ${i}.pdf:`, error);
    }


    
    //let dataBuffer = fs.readFileSync("../../../../../../Users/zan_s/Desktop/rezultati lige/"+i+"_kolo_objava.pdf");
        console.log(dataBuffer)
pdfparse(dataBuffer).then(function(data) {
    const lines = data["text"].split('\n').filter(line => line.trim() !== '');
    const results = [];
    let currentLeague = '';
    let currentWeek = '';

    lines.forEach(line => {
        // Check for league and week information
        const leagueMatch = line.match(/^(\d+ liga|[^\d].* liga)/);
        const weekMatch = line.match(/^Rezultati(\d+) kolo/);

        if (weekMatch) {
            currentWeek = weekMatch[1];
        }

        if (leagueMatch) {
            currentLeague = leagueMatch[0].trim();
        } else {
            // Match result line
            const matchDetails = line.match(/^([^:]+):([^0-9]+)([\d:]+(?:[\d:]+)*)$/);
            if (matchDetails) {
                const homePlayer = matchDetails[1].trim();
                const awayPlayer = matchDetails[2].trim();
                let sets = matchDetails[3];

                // Replace colons with dashes and insert commas between sets if they are missing
                sets = sets.replace(/:/g, '-').replace(/(\d-\d)(?=\d-\d)/g, '$1,');
                if(sets=="0-0,0-0,0-0"){
                    sets = ['No result'];
                }else{
                          sets = sets.split(',').map(set => set.trim()).filter(set => !/^0-0$/.test(set));
                }
                // Filter out "0-0" sets
          
                console.log(sets)
               
                // Proceed only if there are valid sets left
                if (sets.length > 0) {
                    results.push({
                        league: currentLeague,
                        week: currentWeek,
                        homePlayer,
                        awayPlayer,
                        sets
                    });
                }
            }
        }
    });

    console.log(results)
    console.log(insertScheduleWithResults(results));
   
    
    async function insertScheduleWithResults(parsedResults) {
        for (const result of parsedResults) {
            const { league, week, homePlayer, awayPlayer, sets } = result;
            const resultStr = sets.join(',');
    
            // Prepare SQL query for insertion
            const insertQuery = `
                INSERT INTO schedule (home_player, away_player, result, league_id, week)
                VALUES (?, ?, ?, ?, ?)`;
    
            const queryParams = [homePlayer, awayPlayer, resultStr, league, week];
    
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
        }
    }
    
   
})
    }
    res.json("success")
})
app.get('/parsepdfzenske',async (req,res) => {
    const url = 'http://www.tenis-radgona.si/images/stories/liga_2024/rezultati_ženske_2024.pdf';
    let results = [];

    
        // const config = {
        //     method: 'get',
        //     url: `http://www.tenis-radgona.si/images/stories/liga_2024/rezultati_%C5%BEenske_2024.pdf`,
        //     responseType: 'arraybuffer',
        //     headers: {
        //         // Put your headers here if required
        //     }
        // }
        

        // console.log(`Fetching .pdf...`);
        // const response = await axios(config);
        // dataBuffer=response.data
        // console.log(response)
    
    let dataBuffer = fs.readFileSync("../../../../../../Users/zan_s/Desktop/rezultati lige/rezultati_ženske_2024.pdf");
       

    
    data = await pdfparse(dataBuffer);
    function parseMatchData(data) {
        const lines = data["text"].split('\n').filter(line => line.trim() !== '');
        const results = [];
        console.log(lines)
        let currentWeek = '';
        let result
        let result1
        let currentMatch = {};
        let [homePlayer, awayPlayer]=[]
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
    
            // Match the week line with optional period and optional space
            const weekMatch = line.match(/^(\d+\.?\s*kolo)/);
            if (weekMatch) {
                currentWeek = weekMatch[1].match(/\d+/)[0];
                continue;
            }
    
            // Skip the 'rezultat' line
            if (line.includes(':')) {
       
                [homePlayer, awayPlayer] = line.split(':').map(str => str.trim());
             
                
              
               
                
            }
           
            // Handle match results
           
            console.log(!isNaN(line)+"WTF "+line)
           
                if (line === "000000") {
                    result1 = "No result";
                    results.push({
                        week: currentWeek,
                        homePlayer: homePlayer,
                        awayPlayer: awayPlayer,
                        matchResult: result1,
                        league: 6
                    });
                } else {
                    if ( !isNaN(line)) {
                    const pairs = line.match(/(\d{2})/g);
                    const filteredPairs = pairs.filter(pair => !(pair[0] === '0' && pair[1] === '0'));
                    result1 = filteredPairs.map(pair => pair[0] + '-' + pair[1]).join(',');
                        
                        results.push({
                            week: currentWeek,
                            homePlayer: homePlayer,
                            awayPlayer: awayPlayer,
                            matchResult: result1,
                            league: 6
                        });
                    }
                }
             
            
     
               
            // Handle match details
        
        }
    
        return results;
    }
  
    const parsedResults = parseMatchData(data)


    // Insert results into database
   console.log(parsedResults)
    // Insert results into database
   await insertScheduleWithResults(parsedResults);

    res.json({ message: 'Success', results });

async function insertScheduleWithResults(parsedResults) {
    for (const result of parsedResults) {
        console.log(result)
        const { homePlayer, awayPlayer, matchResult, league, week } = result;

        const insertQuery = `
            INSERT INTO schedule (home_player, away_player, result, league_id, week)
            VALUES (?, ?, ?, ?, ?)`;

        const queryParams = [homePlayer, awayPlayer, matchResult, league, week];

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
    }
}
    
    
})

app.get('/getmatches/:id', (req, res) => {
    
    const leagueId = req.params.id;
    console.log(leagueId)
    const query = 'SELECT * FROM schedule WHERE league_id = ? ORDER BY WEEK';
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
    let players = [];

    // Fetch player names
    connection.query('SELECT * FROM players WHERE league_id=6', (err, data) => {
        if (err) {
            console.error('Error fetching players:', err);
            res.status(500).json({ error: 'An error occurred while fetching players' });
            return;
        }

        // Extract player names from the query result
        players = data.map(row => row.name);
        console.log(data[0].league_id)
       let leagueid=6
        console.log(players);
        
    const shuffledPlayers = shuffle(players);
    const schedule = generateRoundRobinSchedule(shuffledPlayers);
    const alternatedSchedule = assignHomeAway(schedule);
    console.log(shuffledPlayers)
    // Insert schedule into the database
    for (let week = 0; week < alternatedSchedule.length; week++) {
        for (let match = 0; match < alternatedSchedule[week].length; match++) {
            const homePlayer = alternatedSchedule[week][match][0];
            const awayPlayer = alternatedSchedule[week][match][1];
            const query = 'INSERT INTO schedule (week, home_player, away_player,league_id) VALUES (?, ?, ?,?)';
            connection.query(query, [week + 1, homePlayer, awayPlayer,leagueid], (err, results) => {
                if (err) {
                  //  console.error('Error inserting match:', err);
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
    const fetchMatchesQuery = 'SELECT * FROM schedule WHERE league_id = ?';
    const fetchPlayersQuery = 'SELECT DISTINCT home_player AS player FROM schedule WHERE league_id = ? UNION SELECT DISTINCT away_player AS player FROM schedule WHERE league_id = ?';

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
                const insertStandingsQuery = 'INSERT INTO standings (player, points, netGamesWon, matches_played, league_id) VALUES ?';
                const standingsValues = Object.entries(standings).map(([player, stats]) => [player, stats.points, stats.netGamesWon, stats.matchesPlayed, leagueId]);

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




// app.listen(port, () => {
//     console.log(`Server is running at https://192.168.0.24:${port}`);
// });