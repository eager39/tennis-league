// Endpoint to parse PDFs
// app.get("/parsepdfmoski", async (req, res) => {
//   const url = "http://www.tenis-radgona.si/images/stories/liga_2024/";
//   let dataBuffer = "";
//   start_date=''
  



// //   console.log(start_date)
// console.log("asd"+this.start_date)
//   for (let i = 1; i < 16; i++) {
//     try {
//       const config = {
//         method: "get",
//         url: `${url}${i}_kolo_objava.pdf`,
//         responseType: "arraybuffer",
//       };

//      // console.log(`Fetching ${i}.pdf...`);
//       const response = await axios(config);

//       dataBuffer = Buffer.from(response.data);
//     //  console.log(`${i}.pdf fetched successfully!`);
//     } catch (error) {
//       console.error(`Failed to fetch ${i}.pdf:`, error);
//       continue; // Skip to the next iteration if fetching fails
//     }

//     // Process the PDF data
//     pdfparse(dataBuffer)
//       .then(async function (data) {
//         this.start_date=await getDate(1)
//         const lines = data["text"]
//           .split("\n")
//           .filter((line) => line.trim() !== "");
//        // console.log(lines);
//         const results = [];
//         let currentLeague = "";
//         let currentWeek = "";
//         //console.log(lines);
//         lines.forEach((line) => {
//           const leagueMatch = line.match(/^(\d+ liga|[^\d].* liga)/);
//           const weekMatch = line.match(/^Rezultati\s*(\d+)\s*kolo/);

//           if (weekMatch) {
//             currentWeek = weekMatch[1];
//           }

//           if (leagueMatch) {
//             currentLeague = leagueMatch[0].trim();
//           } else {
//             const matchDetails = line.match(
//               /^([^:]+):([^0-9]+)([\d:]+(?:[\d:]+)*)$/
//             );
//             if (matchDetails) {
//               const homePlayer = matchDetails[1].trim();
//               const awayPlayer = matchDetails[2].trim();
//               let sets = matchDetails[3];

//               sets = sets
//                 .replace(/:/g, "-")
//                 .replace(/(\d-\d)(?=\d-\d)/g, "$1,");
//               if (sets == "0-0,0-0,0-0") {
//                 sets = ["No result"];
//               } else {
//                 sets = sets
//                   .split(",")
//                   .map((set) => set.trim())
//                   .filter((set) => !/^0-0$/.test(set));
//               }

//               if (sets.length > 0) {
              
//                 results.push({
//                   league: currentLeague,
//                   week: currentWeek,
//                   homePlayer,
//                   awayPlayer,
//                   sets,
//                   deadline: calculateDeadline(currentWeek,this.start_date), // Calculate deadline
//                 });
//               }
//             }
//           }
//         });

//         await insertScheduleWithResults(results);
//       })
//       .catch((error) => {
//         console.error(`Failed to parse PDF data:`, error);
//       });
//   }

//   res.json("success");

//   // Function to insert results into the schedule table
//   async function insertScheduleWithResults(parsedResults) {
//     for (const result of parsedResults) {
//       const { league, week, homePlayer, awayPlayer, sets, deadline } = result;
//       const resultStr = sets.join(",");

//       // Fetch league and season IDs
//       const leagueId = await getLeagueIdByName(league);
//       const seasonId = await getSeasonIdByName("2024");

//       if (!leagueId || !seasonId) {
//         console.error(
//           `League or Season not found: League = ${league}, Season = 2024`
//         );
//         continue;
//       }

//       // Fetch player IDs from the players table
//       const homePlayerId = await getPlayerId(homePlayer);
//       const awayPlayerId = await getPlayerId(awayPlayer);

//       if (homePlayerId && awayPlayerId) {
//         // Insert players into player_season for the 2024 season and current league
//         await insertPlayerSeason(homePlayerId, leagueId, seasonId);
//         await insertPlayerSeason(awayPlayerId, leagueId, seasonId);

//         // Retrieve players_season IDs for the home and away players
//         const homePlayerSeasonId = await getPlayerSeasonId(
//           homePlayerId,
//           leagueId,
//           seasonId
//         );
//         const awayPlayerSeasonId = await getPlayerSeasonId(
//           awayPlayerId,
//           leagueId,
//           seasonId
//         );

//         if (homePlayerSeasonId && awayPlayerSeasonId) {
//           // Insert match into schedule
//           const insertQuery = `
//                         INSERT INTO schedule (home_player, away_player, result, week, deadline)
//                         VALUES (?, ?, ?, ?, ?)
//                         ON DUPLICATE KEY UPDATE 
//                         result = CASE 
//                             WHEN result = 'No result' THEN VALUES(result) 
//                             ELSE result 
//                         END,  
//                         week = VALUES(week), 
//                         deadline = VALUES(deadline);`;
//           console.log(homePlayer, awayPlayer, resultStr);
//           const queryParams = [
//             homePlayerSeasonId,
//             awayPlayerSeasonId,
//             resultStr,
//             week,
//             deadline,
//           ];
//           console.log(queryParams);
//           try {
//             await new Promise((resolve, reject) => {
//               connection.query(insertQuery, queryParams, (err, results) => {
//                 if (err) {
//                   reject(err);
//                 } else {
//                   resolve(results);
//                 }
//               });
//             });
//           } catch (error) {
//             console.error(
//               `Error inserting match for ${homePlayer} vs ${awayPlayer}:`,
//               error
//             );
//           }
//         } else {
//           console.error(
//             `PlayerSeason ID not found for ${homePlayer} or ${awayPlayer}`
//           );
//         }
//       } else {
//         console.error(`Player ID not found for ${homePlayer} or ${awayPlayer}`);
//       }
//     }
//   }

//   // Helper function to insert into player_season table
//   async function insertPlayerSeason(playerId, leagueId, seasonId) {
//     return new Promise((resolve, reject) => {
//       const insertQuery = `
//                 INSERT INTO players_season (player_id, league_id, season_id)
//                 VALUES (?, ?, ?)
//                 ON DUPLICATE KEY UPDATE league_id = VALUES(league_id), season_id = VALUES(season_id);`;

//       connection.query(
//         insertQuery,
//         [playerId, leagueId, seasonId],
//         (err, results) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(results);
//           }
//         }
//       );
//     });
//   }

//   // Helper function to get player_season.id
//   async function getPlayerSeasonId(playerId, leagueId, seasonId) {
//     return new Promise((resolve, reject) => {
//       const query = `
//                 SELECT id 
//                 FROM players_season 
//                 WHERE player_id = ? AND league_id = ? AND season_id = ?;`;

//       connection.query(
//         query,
//         [playerId, leagueId, seasonId],
//         (err, results) => {
//           if (err) {
//             reject(err);
//           } else if (results.length > 0) {
//             resolve(results[0].id); // Return players_season.id
//           } else {
//             resolve(null); // No matching record found
//           }
//         }
//       );
//     });
//   }

//   // Helper function to get or insert a player and return the player ID
//   async function getPlayerId(playerName) {
//     return new Promise((resolve, reject) => {
//       let reversedName = playerName.split(" ").reverse().join(" ");

//       // Check if the player exists
//       const selectQuery = "SELECT id FROM players WHERE name=? OR name=?";
//       connection.query(
//         selectQuery,
//         [playerName, reversedName],
//         (err, results) => {
//           if (err) {
//             return reject(err);
//           }

//           if (results.length > 0) {
//             // Player exists
//             return resolve(results[0].id);
//           }

//           // Player does not exist, insert into database
//           const insertQuery = "INSERT INTO players (name) VALUES (?)";
//           connection.query(insertQuery, [playerName], (err, insertResults) => {
//             if (err) {
//               return reject(err);
//             }

//             // Return the ID of the newly inserted player
//             resolve(insertResults.insertId);
//           });
//         }
//       );
//     });
//   }

//   // Function to insert players into player_season
//   async function insertPlayerSeason(playerId, leagueId, seasonId) {
//     return new Promise((resolve, reject) => {
//       // First, check if the player is already in the player_season table
//       const selectQuery = `SELECT id FROM players_season WHERE player_id=? AND league_id=? AND season_id=?;`;

//       connection.query(
//         selectQuery,
//         [playerId, leagueId, seasonId],
//         (err, results) => {
//           if (err) {
//             reject(err);
//           } else if (results.length > 0) {
//             resolve(); // Player already in player_season
//           } else {
//             // Insert the player into the player_season table
//             const insertQuery = `INSERT INTO players_season (player_id, league_id, season_id, promotion_status) VALUES (?, ?, ?, 'active');`;
//             connection.query(
//               insertQuery,
//               [playerId, leagueId, seasonId],
//               (err, results) => {
//                 if (err) {
//                   reject(err);
//                 } else {
//                   resolve(results);
//                 }
//               }
//             );
//           }
//         }
//       );
//     });
//   }

//   // Helper function to get league ID by league name
//   async function getLeagueIdByName(leagueName) {
//     return new Promise((resolve, reject) => {
//       const query = `SELECT id FROM leagues WHERE name=?;`;
//       connection.query(query, [leagueName], (err, results) => {
//         if (err) {
//           reject(err);
//         } else if (results.length > 0) {
//           resolve(results[0].id);
//         } else {
//           resolve(null); // League not found
//         }
//       });
//     });
//   }

//   // Helper function to get season ID by season name
//   async function getSeasonIdByName(seasonName) {
//     return new Promise((resolve, reject) => {
//       const query = `SELECT id FROM season WHERE year=?;`;
//       connection.query(query, [seasonName], (err, results) => {
//         if (err) {
//           reject(err);
//         } else if (results.length > 0) {
//           resolve(results[0].id);
//         } else {
//           resolve(null); // Season not found
//         }
//       });
//     });
//   }
// });