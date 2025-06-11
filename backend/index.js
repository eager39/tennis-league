var express = require("express");
var fs = require("fs");
const dotenv=require("dotenv")
dotenv.config();
const https = require("https");
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const options = {
  key: fs.readFileSync("cert/key.pem"), 
  cert: fs.readFileSync("cert/certificate.pem"), 

};
// To enable HTTPS
//var app = module.exports = express({key: privateKey, cert: certificate});
const mysql = require("mysql2");
const app = express();
app.enable("trust proxy");
const cors = require("cors");
const bodyParser = require("body-parser");
const verifyToken = require('./authmiddleware');
//const cron = require('node-cron');


const path = require("path");
const moment = require("moment"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('fontkit'); //
const { match } = require("assert");
const { timeout } = require("rxjs");
app.use(cors())


app.use(bodyParser.json());
var getIP = require("ipware")().get_ip;
app.use(function (req, res, next) {
  var ipInfo = getIP(req);
  console.log(ipInfo);
  
  next();
});

const connection = mysql.createPool({
  host: 'localhost',
  user: process.env.DBuser,
  password: process.env.DBpass,
  database: 'tennis_league_local',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
https.createServer(options, app).listen(process.env.PORT, function (req, res) {
  console.log("Server started at port "+process.env.PORT);
});

// Utility function to shuffle an array
const mysqldump = require('mysqldump');


const fsp = require('fs/promises');

// // Config
// const BACKUP_FOLDER = '/mnt/nas/mysql_backups'; // Change to your NAS mount path
// const FILE_NAME = `backup_${new Date().toISOString().slice(0,10)}.sql`;
// const LOCAL_PATH = path.join(__dirname, FILE_NAME);
// const NAS_PATH = path.join(BACKUP_FOLDER, FILE_NAME);

// async function backupAndCopy() {
//   try {
//     // Step 1: Create the dump
//     await mysqldump({
//       connection: {
//         host: 'localhost',
//         user: "eager39",
//         password: "krizanic",
//         database: 'tennis_league_local',
//       },
//     //  dumpToFile: LOCAL_PATH,
//     });

//     // console.log('✅ Dump created at', LOCAL_PATH);

//     // // Step 2: Copy to NAS
//     // await fsp.copyFile(LOCAL_PATH, NAS_PATH);
//     // console.log('✅ Backup copied to NAS at', NAS_PATH);

//     // // Optionally: Delete local file
//     // await fsp.unlink(LOCAL_PATH);
//    // console.log('🧹 Local dump file removed');
//   } catch (err) {
//     console.error('❌ Backup failed:', err.message);
//   }
// }

// backupAndCopy();

// async function generatePdf(dataSource, logoPath, option = 'matches') {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]); // A4
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const logoBytes = fs.readFileSync(logoPath);
//   const logoImage = await pdfDoc.embedPng(logoBytes);
//   const pageHeight = page.getHeight();
//   const pageWidth = page.getWidth();
//   const logoDims = logoImage.scale(0.15);

//   let currentY = pageHeight - 50;

//   const drawText = (text, x, y, size = 10, color = rgb(0, 0, 0)) => {
//     page.drawText(text, { x, y, size, font, color });
//   };

//   const drawRow = (row, y, widths) => {
//     let x = 50;
//     row.forEach((cell, i) => {
//       drawText(String(cell), x, y, 10);
//       x += widths[i];
//     });
//   };

//   // Embed logo at top
//   page.drawImage(logoImage, {
//     x: (pageWidth - logoDims.width) / 1.1,
//     y: currentY,
//     width: logoDims.width,
//     height: logoDims.height,
//   });

//   currentY -= 60;

//   const grouped = groupByWeek(dataSource);

//   for (const [week, matches] of grouped) {
//     const filteredMatches =
//       option === 'result'
//         ? matches.filter(m => m.result && m.result.toLowerCase() !== 'no result')
//         : matches;

//     if (filteredMatches.length === 0) continue;

//     drawText(`${week}. kolo`, 50, currentY, 12, rgb(0, 0.38, 0.18));
//     currentY -= 20;

//     // Draw headers
//     const headers = option === 'result'
//       ? ['Domacin', 'Gost', 'Rezultat']
//       : ['Domacin', 'Gost', 'Rok za tekmo', 'Telefon'];
//     const widths = option === 'result' ? [150, 150, 100] : [130, 130, 130, 100];

//     drawRow(headers, currentY, widths);
//     currentY -= 15;

//     for (const match of filteredMatches) {
//       const deadlineFormatted = new Date(+match.deadline).toLocaleDateString('sl-SI', {
//         weekday: 'long',
//         month: 'long',
//         day: 'numeric',
//       });

//       const row = option === 'result'
//         ? [match.home_player, match.away_player, match.result]
//         : [match.home_player, match.away_player, deadlineFormatted, match.away_phone];

//       drawRow(row, currentY, widths);
//       currentY -= 15;

//       // Add new page if needed
//       if (currentY < 60) {
//         const newPage = pdfDoc.addPage([595, 842]);
//         page = newPage;
//         currentY = page.getHeight() - 50;
//       }
//     }

//     currentY -= 20;
//   }

//   const pdfBytes = await pdfDoc.save();
//   fs.writeFileSync('schedule.pdf', pdfBytes);
//   console.log('PDF saved as schedule.pdf');
// }

// // Group by week (utility function)
// function groupByWeek(matches) {
//   const map = new Map();
//   for (const match of matches) {
//     const week = match.week || 1;
//     if (!map.has(week)) map.set(week, []);
//     map.get(week).push(match);
//   }
//   return map;
// }

// // 👇 Dummy test
// const sampleData = [
//   { week: 1, home_player: 'Player A', away_player: 'Player B', result: '3:2', deadline: Date.now(), away_phone: '041 123 456' },
//   { week: 1, home_player: 'Player C', away_player: 'Player D', result: 'no result', deadline: Date.now(), away_phone: '041 654 321' },
//   { week: 2, home_player: 'Player E', away_player: 'Player F', result: '2:2', deadline: Date.now(), away_phone: '041 000 111' },
// ];

// generatePdf(sampleData, path.join(__dirname, 'logo.png'), 'schedule');
async function generateStyledPdf(dataSource, logoPath) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;
  let page = pdfDoc.addPage([595, 842]); // A4 size
  let pageWidth = page.getWidth();
  let currentY = 750;
  let weekmap=[]
  pdfDoc.registerFontkit(fontkit);
  matches: any=[]
  const fontBytes = fs.readFileSync(path.join(__dirname, 'fonts/DejaVuSans.ttf'));
  const customFont = await pdfDoc.embedFont(fontBytes);

  const logoBytes = fs.readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.40);


  const drawText = (text, x, y, options = {}) => {
    page.drawText(text, {
      x,
      y,
      size: options.size || fontSize,
      color: options.color || rgb(0, 0, 0),
      font:customFont
    });
  };

  const drawRect = (x, y, w, h, color) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  const grouped = groupByWeek(dataSource);
  // page.drawImage(logoImage, {
  //   x: pageWidth - logoDims.width - 20,
  //   y: currentY,
  //   width: logoDims.width,
  //   height: logoDims.height
  // });
  for (const [week, matches] of grouped) {
    // Filter if in result mode
    const filtered = option === 'result'
      ? matches.filter(m => m.result && m.result.toLowerCase() == 'no result')
      : matches;

    if (filtered.length === 0) continue;

    const estimatedHeight = 20 + 20 + (filtered.length * 18) + 20 ;

    if (currentY - estimatedHeight < 60) {
      page = pdfDoc.addPage([595, 842]);
      currentY = 750;
      page.drawImage(logoImage, {
        x: pageWidth - logoDims.width - 20,
        y: currentY,
        width: logoDims.width,
        height: logoDims.height
      });
    }
    // Add logo top right
  

    currentY -= 30;
    drawText(`${week}. kolo`, 50, currentY, {
      size: 12,
      color: rgb(0, 0.38, 0.18)
    });
    currentY -= 20;

    const headers = option === 'result'
      ? ['liga','Domačin', 'Gost', 'Rezultat']
      : ['Domačin', 'Gost', 'Rok za tekmo', 'Telefon'];
    const widths = option === 'result' ? [100,130, 130, 100] : [150, 150, 130, 100];

    const drawTableRow = (row, y, bgColor = null) => {
      let x = 50;
      row.forEach((cell, i) => {
        const w = widths[i];
        if (bgColor) drawRect(x - 2, y - 2, w, 16, bgColor);
        drawText(String(cell), x, y, { size: fontSize });
        x += w;
      });
    };

    // Draw table header
    drawTableRow(headers, currentY, rgb(0, 0.38, 0.18));
    headers.forEach((text, i) => {
      drawText(text, 50 + widths.slice(0, i).reduce((a, b) => a + b, 0), currentY, {
        size: fontSize,
        color: rgb(1, 1, 1)
      });
    });

    currentY -= 20;

    for (const [i, match] of filtered.entries()) {
      const deadlineFormatted = new Date(+match.deadline).toLocaleDateString('sl-SI', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      if(weekmap.includes(match.week)){

      }else{
        weekmap.push(match.week)
      }
      const row = option === 'result'
        ? [match.name,match.home_player, match.away_player, match.result]
        : [match.home_player, match.away_player, deadlineFormatted, match.away_phone];

      const stripeColor = i % 2 === 0 ? rgb(0.95, 0.95, 0.95) : null;
      drawTableRow(row, currentY, stripeColor);
      currentY -= 18;

      if (currentY < 60) {
        page = pdfDoc.addPage([595, 842]);
        currentY = 780;
      }
    }

    currentY -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('neodigra tekme'+weekmap+' tedna.pdf', pdfBytes);
  console.log('✅ PDF saved as styled_schedule.pdf');
}
async function generateunplayedmatchespdfthatarepastdeadline(dataSource, logoPath,gender,filelocation) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  let page = pdfDoc.addPage([595, 842]); // A4 size
  let pageWidth = page.getWidth();
  let currentY = 730;
  let weekmap=[]
  pdfDoc.registerFontkit(fontkit);
  matches: any=[]
  const fontBytes = fs.readFileSync(path.join(__dirname, 'fonts/DejaVuSans.ttf'));
  const customFont = await pdfDoc.embedFont(fontBytes);

  const logoBytes = fs.readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.60);


  const drawText = (text, x, y, options = {}) => {
    page.drawText(text, {
      x,
      y,
      size: options.size || fontSize,
      color: options.color || rgb(0, 0, 0),
      font:customFont
    });
  };

  const drawRect = (x, y, w, h, color) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  const grouped = groupByWeek(dataSource);
  page.drawImage(logoImage, {
    x: pageWidth - logoDims.width - 20,
    y: currentY,
    width: logoDims.width,
    height: logoDims.height
  });
 
// const latestDate = new Date(Math.max(...dataSource.map(o => new Date(now()))));
// console.log(latestDate);
   const textWidth = font.widthOfTextAtSize("Neodigrane tekme", 24);
    drawText("Neodigrane tekme", (pageWidth-textWidth)/2, 770, {
      size: 24,
      color: rgb(0, 0.38, 0.18)
    });

      
  const options = {
    hour:"numeric",
  weekday: 'long',   // full day name like "sobota"
  day: 'numeric',    // day number, e.g. 21
  month: 'long',     // full month name like "september"
  year: 'numeric'    // year number
};

// Use Slovak locale 'sk-SK'
const formatted = new Intl.DateTimeFormat('sl-si', options).format(new Date());

  drawText(formatted, (pageWidth - textWidth) / 2, 750, {
    size: 12,
    color: rgb(0, 0.38, 0.18)
  });



  for (const [week, matches] of grouped) {
    // Filter if in result mode
   


    const estimatedHeight = 20 + 20 + (matches.length * 18) + 20 ;

    if (currentY - estimatedHeight < 60) {
      page = pdfDoc.addPage([595, 842]);
      currentY = 820;
      // page.drawImage(logoImage, {
      //   x: pageWidth - logoDims.width - 20,
      //   y: currentY,
      //   width: logoDims.width,
      //   height: logoDims.height
      // });
    }
    // Add logo top right
  

    currentY -= 30;
    drawText(`${week}. kolo`, 50, currentY, {
      size: 12,
      color: rgb(0, 0.38, 0.18)
    });
    currentY -= 20;
    let headers=[]
     let widths=[]

      if(gender=="m"){
headers = 
      ['Liga','Domačin', 'Gost', 'Rezultat']
       widths = [150, 150, 130, 100];
      }else{
       headers =  ['Domačin', 'Gost', 'Rezultat']
       widths = [ 176, 176, 176];
      }
   

 const drawTableRow = (row, y, bgColor = null,textColor = rgb(0, 0, 0)) => {
  let x = 50;
  row.forEach((cell, i) => {
    const w = widths[i];
    
    // Replace "No result" with "Neodigrano"
    const content = String(cell).trim() === "No result" ? "Neodigrano" : String(cell);

    if (bgColor) drawRect(x - 2, y - 2, w, 16, bgColor);
    drawText(content, x, y, { size: fontSize ,color: textColor });
    x += w;
  });
};
    // Draw table header
    drawTableRow(headers, currentY, rgb(0, 0.38, 0.18),rgb(1, 1,1));
    // headers.forEach((text, i) => {
    //   // drawText(text, 50 + widths.slice(0, i).reduce((a, b) => a + b, 0), currentY, {
    //   //   size: fontSize,
    //   //   color: rgb(1, 1, 1)
    //   // });
    // });

    currentY -= 20;

for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  const currentLeague = match.name;

  let row = gender === "m"
    ? [match.name, match.home_player, match.away_player, match.result]
    : [match.home_player, match.away_player, match.result];

  const stripeColor = i % 2 === 0 ? rgb(0.95, 0.95, 0.95) : null;
  drawTableRow(row, currentY, stripeColor);
  currentY -= 18;

  // 🧱 Draw border if league changes or it's the last match
  const nextLeague = matches[i + 1]?.name;
  if (currentLeague !== nextLeague) {
     drawRect(50, currentY+10, 530, 5, rgb(0, 0.38, 0.18)); // 3cm thick border
    currentY -= 5;
  }

      if (currentY < 60) {
        page = pdfDoc.addPage([595, 842]);
        currentY = 780;
      }
    }

    currentY -= 20;
  }

  const pdfBytes = await pdfDoc.save();
try{
   fs.writeFileSync(filelocation+".pdf", pdfBytes);
}catch(error){
  console.log(error)
}
 
  console.log('✅ PDF saved as unplayedmatches.pdf');
}

 
async function generatepdfwithplayedmatches(dataSource, logoPath,gender,filelocation) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  let page = pdfDoc.addPage([595, 842]); // A4 size
  let pageWidth = page.getWidth();
  let currentY = 730;
  let weekmap=[]
  pdfDoc.registerFontkit(fontkit);
  matches: any=[]
  const fontBytes = fs.readFileSync(path.join(__dirname, 'fonts/DejaVuSans.ttf'));
  const customFont = await pdfDoc.embedFont(fontBytes);

  const logoBytes = fs.readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.60);


  const drawText = (text, x, y, options = {}) => {
    page.drawText(text, {
      x,
      y,
      size: options.size || fontSize,
      color: options.color || rgb(0, 0, 0),
      font:customFont
    });
  };

  const drawRect = (x, y, w, h, color) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  const grouped = groupByWeek(dataSource);
  page.drawImage(logoImage, {
    x: pageWidth - logoDims.width - 20,
    y: currentY,
    width: logoDims.width,
    height: logoDims.height
  });
  const latestDate = new Date(Math.max(...dataSource.map(o => new Date(o.last_update))));
console.log(latestDate);
   const textWidth = font.widthOfTextAtSize("Odigrane tekme", 24);
    drawText("Odigrane tekme", (pageWidth-textWidth)/2, 770, {
      size: 24,
      color: rgb(0, 0.38, 0.18)
    });

   
  const options = {
    hour:'numeric',
  weekday: 'long',   // full day name like "sobota"
  day: 'numeric',    // day number, e.g. 21
  month: 'long',     // full month name like "september"
  year: 'numeric'    // year number
};

// Use Slovak locale 'sk-SK'
const formatted = new Intl.DateTimeFormat('sl-si', options).format(latestDate);

  drawText(formatted, (pageWidth - textWidth) / 2, 750, {
    size: 12,
    color: rgb(0, 0.38, 0.18)
  });



  for (const [week, matches] of grouped) {
    // Filter if in result mode
   


    const estimatedHeight = 20 + 20 + (matches.length * 18) + 20 ;

    if (currentY - estimatedHeight < 60) {
      page = pdfDoc.addPage([595, 842]);
      currentY = 820;
      // page.drawImage(logoImage, {
      //   x: pageWidth - logoDims.width - 20,
      //   y: currentY,
      //   width: logoDims.width,
      //   height: logoDims.height
      // });
    }
    // Add logo top right
  

    currentY -= 30;
    drawText(`${week}. kolo`, 50, currentY, {
      size: 12,
      color: rgb(0, 0.38, 0.18)
    });
    currentY -= 20;
    let headers=[]
     let widths=[]

      if(gender=="m"){
headers = 
      ['Liga','Domačin', 'Gost', 'Rezultat']
       widths = [150, 150, 130, 100];
      }else{
       headers =  ['Domačin', 'Gost', 'Rezultat']
       widths = [ 176, 176, 176];
      }
   

 const drawTableRow = (row, y, bgColor = null,textColor = rgb(0, 0, 0)) => {
  let x = 50;
  row.forEach((cell, i) => {
    const w = widths[i];
    
    // Replace "No result" with "Neodigrano"
    const content = String(cell).trim() === "No result" ? "Neodigrano" : String(cell);

    if (bgColor) drawRect(x - 2, y - 2, w, 16, bgColor);
    drawText(content, x, y, { size: fontSize ,color: textColor });
    x += w;
  });
};
    // Draw table header
    drawTableRow(headers, currentY, rgb(0, 0.38, 0.18),rgb(1, 1,1));
    // headers.forEach((text, i) => {
    //   // drawText(text, 50 + widths.slice(0, i).reduce((a, b) => a + b, 0), currentY, {
    //   //   size: fontSize,
    //   //   color: rgb(1, 1, 1)
    //   // });
    // });

    currentY -= 20;

 let previousLeague = null;

for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  const currentLeague = match.name;

  let row = gender === "m"
    ? [match.name, match.home_player, match.away_player, match.result]
    : [match.home_player, match.away_player, match.result];

  const stripeColor = i % 2 === 0 ? rgb(0.95, 0.95, 0.95) : null;
  drawTableRow(row, currentY, stripeColor);
  currentY -= 18;

  // 🧱 Draw border if league changes or it's the last match
  const nextLeague = matches[i + 1]?.name;
  if (currentLeague !== nextLeague) {
  
        drawRect(50, currentY+10, 530, 5, rgb(0, 0.38, 0.18)); // 3cm thick border
    currentY -= 5;
    
  
  }

  // Handle page break
  if (currentY < 60) {
    page = pdfDoc.addPage([595, 842]);
    currentY = 780;
  }
}

    currentY -= 20;
  }

  const pdfBytes = await pdfDoc.save();
try{
   fs.writeFileSync(filelocation+".pdf", pdfBytes);
}catch(error){
  console.log(error)
}
 
  console.log('✅ PDF saved as unplayedmatches.pdf');
}



function groupByWeek(matches) { //group by week and order by league same pdf
  const map = new Map();

  for (const match of matches) {
    const week = match.week || 1;

    if (!map.has(week)) {
      map.set(week, []);
    }

    map.get(week).push(match);
  }

  // Sort matches in each week group by league_id DESC
  for (const [week, matchList] of map) {
    matchList.sort((a, b) => a.league_id - b.league_id);
  }

  return map;
}
// // Group data by week // group by week for different pdfs
// function groupByWeek(matches) {
//   const map = new Map();
//   for (const match of matches) {
//     const week = match.week || 1;
//     if (!map.has(week)) map.set(week, []);
//     map.get(week).push(match);
//   }
//   return map;
// }
// function groupByWeek(matches) { //group by week and order by league same pdf
//   const map = new Map();

//   for (const match of matches) {
//     const week = match.week || 1;

//     if (!map.has(week)) {
//       map.set(week, []);
//     }

//     map.get(week).push(match);
//   }

//   // Sort matches in each week group by league_id DESC
//   for (const [week, matchList] of map) {
//     matchList.sort((a, b) => a.league_id - b.league_id);
//   }

//   return map;
// }


function getStandingsperleague(seasonId,league_id) {
  const query = `
 SELECT p.name,standings.position,standings.points,standings.netsetswon,standings.netgameswon,standings.matches_played,standings.num_of_penalty,l.name as liga,standings.last_update FROM standings 
 JOIN players_season ps 
        ON standings.player = ps.id 
       JOIN players p 
        ON ps.player_id = p.id
        join leagues l on ps.league_id=l.id
          WHERE ps.league_id=? and ps.season_id=? and p.name!='prosta' and p.name!='prost'
      ORDER BY standings.position ASC
  `;

  return new Promise((resolve, reject) => {
    connection.query(query, [seasonId,league_id], (err, data) => {
      if (err) {
        console.error("Error fetching unplayed matches:", err);
        reject(err);
      } else {
       // console.log(data)
        resolve(data);
      }
    });
  });
}
function getUnplayedMatchesmoški(seasonId) {
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
  s.deadline,
  s.home_player AS home_player_s_id,
  s.away_player AS away_player_s_id,
  l.name,
   s.last_update
FROM schedule s
JOIN players_season ps_home ON s.home_player = ps_home.id
JOIN players hp ON ps_home.player_id = hp.id
JOIN players_season ps_away ON s.away_player = ps_away.id
JOIN players ap ON ps_away.player_id = ap.id
JOIN leagues l on ps_home.league_id=l.id
WHERE s.result = "No result"
  AND ps_home.season_id = ?
  AND s.deadline < (UNIX_TIMESTAMP()*1000 + 0 * 24 * 60 * 60*1000)
  and ps_home.league_id!=6
ORDER BY s.week ASC;
  `;

  return new Promise((resolve, reject) => {
    connection.query(query, [seasonId], (err, data) => {
      if (err) {
        console.error("Error fetching unplayed matches:", err);
        reject(err);
      } else {
      
        resolve(data);
      }
    });
  });
}
function getPlayedMatchesmoški(seasonId) {
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
  s.deadline,
  s.home_player AS home_player_s_id,
  s.away_player AS away_player_s_id,
  l.name,
  s.last_update
FROM schedule s
JOIN players_season ps_home ON s.home_player = ps_home.id
JOIN players hp ON ps_home.player_id = hp.id
JOIN players_season ps_away ON s.away_player = ps_away.id
JOIN players ap ON ps_away.player_id = ap.id
JOIN leagues l on ps_home.league_id=l.id
WHERE s.result != "No result"
  AND ps_home.season_id = ?

  and ps_home.league_id!=6
ORDER BY s.week ASC;
  `;

  return new Promise((resolve, reject) => {
    connection.query(query, [seasonId], (err, data) => {
      if (err) {
        console.error("Error fetching unplayed matches:", err);
        reject(err);
      } else {
      
        resolve(data);
      }
    });
  });
}
function getPlayedMatchesženske(seasonId) {
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
  s.deadline,
  s.home_player AS home_player_s_id,
  s.away_player AS away_player_s_id,
  l.name,
  s.last_update
FROM schedule s
JOIN players_season ps_home ON s.home_player = ps_home.id
JOIN players hp ON ps_home.player_id = hp.id
JOIN players_season ps_away ON s.away_player = ps_away.id
JOIN players ap ON ps_away.player_id = ap.id
JOIN leagues l on ps_home.league_id=l.id
WHERE s.result != "No result"
  AND ps_home.season_id = ?

  and ps_home.league_id=6
ORDER BY s.week ASC;
  `;

  return new Promise((resolve, reject) => {
    connection.query(query, [seasonId], (err, data) => {
      if (err) {
        console.error("Error fetching unplayed matches:", err);
        reject(err);
      } else {
      
        resolve(data);
      }
    });
  });
}
function getUnplayedMatchesženske(seasonId) {
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
  s.deadline,
  s.home_player AS home_player_s_id,
  s.away_player AS away_player_s_id,
  l.name,
  s.last_update
FROM schedule s
JOIN players_season ps_home ON s.home_player = ps_home.id
JOIN players hp ON ps_home.player_id = hp.id
JOIN players_season ps_away ON s.away_player = ps_away.id
JOIN players ap ON ps_away.player_id = ap.id
JOIN leagues l on ps_home.league_id=l.id
WHERE s.result = "No result"
  AND ps_home.season_id = ?
  AND s.deadline < (UNIX_TIMESTAMP()*1000 + 0 * 24 * 60 * 60*1000)
  and ps_home.league_id=6
  and (hp.name!='prosta' and ap.name!='prosta')

ORDER BY s.week ASC;
  `;

  return new Promise((resolve, reject) => {
    connection.query(query, [seasonId], (err, data) => {
      if (err) {
        console.error("Error fetching unplayed matches:", err);
        reject(err);
      } else {
       
        resolve(data);
      }
    });
  });
}
// async function getLeaguesWithUnplayedMatches(seasonid) {
//   const query = `
//     SELECT DISTINCT ps_home.league_id AS league_id, l.name
//     FROM schedule s
//     JOIN players_season ps_home ON s.home_player = ps_home.id
//     JOIN players_season ps_away ON s.away_player = ps_away.id
//     JOIN leagues l ON ps_home.league_id = l.id
//     WHERE s.result = "No result"
//       AND ps_home.season_id = ?
//       AND s.deadline < (UNIX_TIMESTAMP() * 1000 + 7 * 24 * 60 * 60 * 1000)
//     ORDER BY ps_home.league_id ASC
//   `;
//   return new Promise((resolve, reject) => {
//     connection.query(query, [seasonid], (err, data) => {
//       if (err) {
//         console.error("Error fetching unplayed matches:", err);
//         reject(err);
//       } else {
//         //console.log(data)
//         resolve(data);
//       }
//     });
//   });
// }

// async function getLeaguesWithUnplayedMatchesmoški(seasonid) {
//   const query = `
//     SELECT DISTINCT ps_home.league_id AS league_id, l.name
//     FROM schedule s
//     JOIN players_season ps_home ON s.home_player = ps_home.id
//     JOIN players_season ps_away ON s.away_player = ps_away.id
//     JOIN leagues l ON ps_home.league_id = l.id
//     WHERE s.result = "No result"
//       AND ps_home.season_id = ?
//       AND s.deadline < (UNIX_TIMESTAMP() * 1000 + 0 * 24 * 60 * 60 * 1000)
//       and ps_home.league_id!=6
//     ORDER BY ps_home.league_id ASC
//   `;
//   return new Promise((resolve, reject) => {
//     connection.query(query, [seasonid], (err, data) => {
//       if (err) {
//         console.error("Error fetching unplayed matches:", err);
//         reject(err);
//       } else {
//         //console.log(data)
//         resolve(data);
//       }
//     });
//   });
// }

async function generatepdfmenunplayed(seasonid,league,filelocation) {
  try {
    let matches=[]
   // const leagues = await getLeaguesWithUnplayedMatches(seasonid);
   // console.log(leagues)
   // for (const league of leagues) {
     // const leagueId = league.league_id;
     // const matches = await getUnplayedMatches(seasonid, leagueId);
     if(league=="m"){
       matches = await getUnplayedMatchesmoški(seasonid);
     }else{
  matches = await getUnplayedMatchesženske(seasonid);
     }
      
    
      if (matches.length > 0) {
        await generateunplayedmatchespdfthatarepastdeadline(
          matches,
          path.join(__dirname, 'logo.png'),
          league,
          filelocation
        );
        //console.log(`✅ Report generated for league ${leagueId}`);
      } else {
       // console.log(`ℹ️ No matches to report for league ${leagueId}`);
      }
   // }
  } catch (err) {
    console.error('❌ Failed to generate reports:', err);
  }
}
async function generepdfwithplayedmatches(seasonid,league,filelocation) {
  try {
    let matches=[]
   // const leagues = await getLeaguesWithUnplayedMatches(seasonid);
   // console.log(leagues)
   // for (const league of leagues) {
     // const leagueId = league.league_id;
     // const matches = await getUnplayedMatches(seasonid, leagueId);
     if(league=="m"){
       matches = await getPlayedMatchesmoški(seasonid);
     }else{
  matches = await getPlayedMatchesženske(seasonid);
     }
      
    
      if (matches.length > 0) {
        await generatepdfwithplayedmatches(
          matches,
          path.join(__dirname, 'logo.png'),
          league,
          filelocation
        );
        //console.log(`✅ Report generated for league ${leagueId}`);
      } else {
       // console.log(`ℹ️ No matches to report for league ${leagueId}`);
      }
   // }
  } catch (err) {
    console.error('❌ Failed to generate reports:', err);
  }
}


async function pdfstandings(filelocation,league_id) {
  try {
    let matches=[]
   // const leagues = await getLeaguesWithUnplayedMatches(seasonid);
   // console.log(leagues)
   // for (const league of leagues) {
     // const leagueId = league.league_id;
     // const matches = await getUnplayedMatches(seasonid, leagueId);
    
       matches = await getStandingsperleague(league_id,4);
    
      
     
      if (matches.length > 0) {
      
        await generatepdfstandings(
          matches,
          path.join(__dirname, 'logo.png'),
          filelocation
        );
        //console.log(`✅ Report generated for league ${leagueId}`);
      } else {
        console.log(`ℹ️ No matches to report for league ${leagueId}`);
      }
   // }
  } catch (err) {
    console.error('❌ Failed to generate reports:', err);
  }
}



// generatepdfmenunplayed(4,"m","Neodigrane moške tekme");
// generatepdfmenunplayed(4,"ž","Neodigrane ženske tekme");


async function safeSendEmail(to, htmlContent, subject, filePaths) {
  const validAttachments = filePaths
    .filter(file => fs.existsSync(file)) // Check if file exists
    .map(file => ({
      filename: path.basename(file),
      path:file
    }));

  if (validAttachments.length === 0) {

    console.log(`Skipped sending "${subject}" — no valid attachments.`);
    return;
  }
  

  await sendEmail(to, htmlContent, subject, validAttachments);
}

const allowedFiles = [
  "prva_liga_razvrstitev.pdf",
  "druga_liga_razvrstitev.pdf",
  "tretja_liga_razvrstitev.pdf",
  "cetrta_liga_razvrstitev.pdf",
  "zenska_liga_razvrstitev.pdf",
  "Neodigrane zenske tekme.pdf",
  "Neodigrane moske tekme.pdf",
  "rezultati_moski.pdf",
  "rezultati_zenske.pdf"

];

app.get("/download/:fileName/:league",verifyToken("admin"), async (req, res) => { 
   const { fileName } = req.params;
//     generatepdfmenunplayed(4,"m","Neodigrane moške tekme");
//  generatepdfmenunplayed(4,"ž","Neodigrane ženske tekme");
//  pdfstandings("prva_liga_razvrstitev",1)
//  pdfstandings("druga_liga_razvrstitev",2)
//  pdfstandings("tretja_liga_razvrstitev",3)
//  pdfstandings("cetrta_liga_razvrstitev",4)
switch (fileName) {
  case "Neodigrane moske tekme.pdf":
    await generatepdfmenunplayed(4,"m","Neodigrane moske tekme");
    break;
  case "Neodigrane zenske tekme.pdf":
 await generatepdfmenunplayed(4,"ž","Neodigrane zenske tekme");
    break;
  case "prva_liga_razvrstitev.pdf":
  await pdfstandings("prva_liga_razvrstitev",1)
    break;
     case "druga_liga_razvrstitev.pdf":  
await pdfstandings("druga_liga_razvrstitev",2)
    break;
      case "tretja_liga_razvrstitev.pdf":
 await pdfstandings("tretja_liga_razvrstitev",3)
    break;
      case "cetrta_liga_razvrstitev.pdf":
 await pdfstandings("cetrta_liga_razvrstitev",4)
    break;
      case "zenska_liga_razvrstitev.pdf":
await pdfstandings("zenska_liga_razvrstitev",6)
    break;
    case "rezultati_moski.pdf":
await generepdfwithplayedmatches(4,"m","rezultati_moski")
    break;
      case "rezultati_zenske.pdf":
await generepdfwithplayedmatches(4,"ž","rezultati_zenske")
    break;
  
}
generepdfwithplayedmatches(4,"ž","odigrane tekme")
 

  if (!allowedFiles.includes(fileName)) {
    return res.status(400).send("Invalid file request");
  }

  const filePath = path.join(__dirname, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).end();
  });
});

app.post("/deadline", async (req, res) => {

  generatepdfmenunplayed(4,"m","Neodigrane moške tekme");
 generatepdfmenunplayed(4,"ž","Neodigrane ženske tekme");
 pdfstandings("prva_liga_razvrstitev",1)
 pdfstandings("druga_liga_razvrstitev",2)
 pdfstandings("tretja_liga_razvrstitev",3)
 pdfstandings("cetrta_liga_razvrstitev",4)
 pdfstandings("zenska_liga_razvrstitev",6)

  
await safeSendEmail("krizaniczan@gmail.com", "<p>Neodigrane tekme</p>", "neodigrane tekme zenska liga", ["Neodigrane zenske tekme.pdf"]);

await safeSendEmail("krizaniczan@gmail.com", "<p>Neodigrane tekme.</p>", "neodigrane tekme moska liga", ["Neodigrane moske tekme.pdf"]);

await safeSendEmail(
  "krizaniczan@gmail.com",
  "<p>Razvrstitve lig.</p>",
  "Razvrstitve lig",
  [
    "prva_liga_razvrstitev.pdf",
    "tretja_liga_razvrstitev.pdf",
    "druga_liga_razvrstitev.pdf",
    "cetrta_liga_razvrstitev.pdf",
    "ženska_liga_razvrstitev.pdf"
  ]
);
  updateScheduleWithDates();
 res.json(true);
});
async function sendEmail(usermail,sporocilo,subject,attachmentPath) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.Gmailuser, // Your Gmail address
        pass: process.env.Gmailpass  // Your Gmail password
      }
    });
   

    const message = {
      from: 'krizaniczan@gmail.com',
      bcc: usermail,
       subject: subject,
      html: sporocilo,
     attachments: attachmentPath
    };
    

    const info = await transporter.sendMail(message);

    console.log("Email sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    return {
      msg: "Email sent successfully",
      info: info.messageId,
      preview: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { msg: "Email sending failed", error: error.message };
  }
}







async function generatepdfstandings(dataSource, logoPath, filelocation) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const pageWidth = page.getWidth();
  let currentY = 730;

  pdfDoc.registerFontkit(fontkit);

  const fontBytes = fs.readFileSync(path.join(__dirname, 'fonts/DejaVuSans.ttf'));
  const customFont = await pdfDoc.embedFont(fontBytes);

  const logoBytes = fs.readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.60);

  const drawText = (text, x, y, options = {}) => {
    page.drawText(text, {
      x,
      y,
      size: options.size || fontSize,
      color: options.color || rgb(0, 0, 0),
      font: customFont
    });
  };

  const drawRect = (x, y, w, h, color) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  //Draw logo
  page.drawImage(logoImage, {
    x: pageWidth - logoDims.width - 20,
    y: currentY,
    width: logoDims.width,
    height: logoDims.height
  });
const latestDate = new Date(Math.max(...dataSource.map(o => new Date(o.last_update))));
console.log(latestDate);
  const titleText = "Razvrstitve "+dataSource[0].liga;
  const options = {
   hour:"numeric",
  weekday: 'long',   // full day name like "sobota"
  day: 'numeric',    // day number, e.g. 21
  month: 'long',     // full month name like "september"
  year: 'numeric'    // year number
};

// Use Slovak locale 'sk-SK'
const formatted = new Intl.DateTimeFormat('sl-si', options).format(latestDate);
  const textWidth = font.widthOfTextAtSize(titleText, 24);
  drawText(titleText, (pageWidth - textWidth) / 2, 770, {
    size: 24,
    color: rgb(0, 0.38, 0.18)
  });
  drawText(formatted, (pageWidth - textWidth) / 2, 750, {
    size: 12,
    color: rgb(0, 0.38, 0.18)
  });

  // Section title
  // currentY -= 30;
  // drawText(dataSource[0].liga, 50, currentY, {
  //   size: 12,
  //   color: rgb(0, 0.38, 0.18)
  // });
  currentY -= 20;

  const headers = ['Pozicija', 'Igralec','Točke','Nizi', 'Igre', 'Št. Tekem', 'Kazenske točke'];
  const widths = [50,130, 50, 50, 50,100, 100];

  const drawTableRow = (row, y, bgColor = null, textColor = rgb(0, 0, 0)) => {
    let x = 50;
    row.forEach((cell, i) => {
      const w = widths[i];
      if (bgColor) drawRect(x - 2, y - 2, w, 16, bgColor);
      drawText(String(cell), x, y, { size: fontSize, color: textColor });
      x += w;
    });
  };

  // Draw table header
  drawTableRow(headers, currentY, rgb(0, 0.38, 0.18), rgb(1, 1, 1));
  currentY -= 20;

  // Draw player rows
  dataSource.forEach((match, i) => {
    const row = [
      match.position,
      match.name,
      match.points,
      match.netsetswon,
      match.netgameswon,
      match.matches_played,
      match.num_of_penalty
    ];

    const stripeColor = i % 2 === 0 ? rgb(0.95, 0.95, 0.95) : null;
    drawTableRow(row, currentY, stripeColor);
    currentY -= 18;

    if (currentY < 60) {
      page = pdfDoc.addPage([595, 842]);
      currentY = 780;
    }
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filelocation + ".pdf", pdfBytes);
  console.log('✅ PDF saved as ' + filelocation + ".pdf");
}






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
app.get("/getPlayerEmails", async (req, res) => {
   const season = req.headers.season;

  // Updated query to fetch player details from both players_season and players tables
  const query = `
     SELECT 
  p.name,p.email
FROM 
    players_season ps

JOIN 
    players p ON ps.player_id = p.id

	
 
WHERE 
    ps.league_id!=6
    AND ps.season_id = ?
    and p.email!=''
    order by ps.league_id asc,p.name asc
`;
      

  // Execute query with the userid and season passed for both home and away players
  connection.query(query, [season], (err, data) => {
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
      
      res.json(data);
    }
  
  
});
})

app.get("/getMyMatches",verifyToken("user"), (req, res) => {

  const userid = req.query.id;
  const season = req.headers.season;

  // Updated query to fetch player details from both players_season and players tables
  const query = `
   SELECT 
   *,
    s.id,
    ps_home.player_id AS home_player_id,
    hp.name AS home_player,
    ps_away.player_id AS away_player_id,
    ap.name AS away_player,
    s.result,
    ps_home.league_id,
    s.week,
    s.deadline,
    CASE 
        WHEN hp.user_id = ? THEN ap.phone
        ELSE hp.phone
    END AS phone_away
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
    (hp.user_id = ? OR ap.user_id = ?)
    AND ps_home.season_id = ?
ORDER BY 
    s.week;
        `;

  // Execute query with the userid and season passed for both home and away players
  connection.query(query, [userid,userid, userid, season], (err, data) => {
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
      
      res.json(data);
    }
  });
});

// Function to generate the round-robin schedule
function generateRoundRobinSchedule(playerArray) {




let matches = [];



for (let r = 1; r < 1 + playerArray.length - 1; r++) {
    let round = [];
    for (let i = 0; i < playerArray.length / 2; i++) {
        round.push({
            round: r,
            match: i + 1,
            player1: null,
            player2: null
        });
    }
    if (r === 1) {
        round.forEach((m, i) => {
            m.player1 = playerArray[i];
            m.player2 = playerArray[playerArray.length - i - 1];
        });
    }
    else {
      
        const prevRound = matches.filter(m => m.round === r - 1);
       
        const indexFind = idx => {
            if (idx + (playerArray.length / 2) > playerArray.length - 2) {
                return idx + 1 - (playerArray.length / 2);
            }
            else {
                return idx + (playerArray.length / 2);
            }
        };
        for (let i = 0; i < round.length; i++) {
            const prev = prevRound[i];
            const curr = round[i];
            if (i === 0) {
                if (prev.player2 === playerArray[playerArray.length - 1]) {
                    curr.player1 = playerArray[playerArray.length - 1];
                    curr.player2 = playerArray[indexFind(playerArray.findIndex(p => p === prev.player1))];
                }
                else {
                    curr.player2 = playerArray[playerArray.length - 1];
                    curr.player1 = playerArray[indexFind(playerArray.findIndex(p => p === prev.player2))];
                }
            }
            else {
                curr.player1 = playerArray[indexFind(playerArray.findIndex(p => p === prev.player1))];
                curr.player2 = playerArray[indexFind(playerArray.findIndex(p => p === prev.player2))];
            }
        }
       
    }
    matches = [...matches, ...round];
}
const totalRounds = playerArray.length - 1;
if(totalRounds<9){
  const secondHalf = matches
    .filter(m => m.round <= totalRounds)
    .map(m => ({
        round: m.round + totalRounds,
        match: m.match,
        player1: m.player2,
        player2: m.player1
    }));

matches = [...matches, ...secondHalf];

}

return matches;

}

async function getDate(season){
  return new Promise((resolve, reject) => {
  const query = "SELECT start_date FROM season WHERE id=?";
 
  connection.query(
    query,[season],
   
    (err, results) => {
      if (err) {
        reject(err);
      } else if (results.length > 0) {
        
        resolve(results[0].start_date); // Return players_season.id
      } else {
        resolve(null); // No matching record found
      }
    }
  );
});
}

// Helper function to calculate the deadline
function calculateDeadline(week,start_date) {
  
  // Adjust the start date if necessary
  // console.log(leagueStartDate)
  const deadlineDate = new Date(start_date*1000);
  deadlineDate.setDate(deadlineDate.getDate() + week * 7); // Add 7 days per week

  // Return the epoch time (timestamp in milliseconds)
  return deadlineDate.getTime();
}


// app.get("/parsepdfzenske", async (req, res) => {
//   const url =
//     "http://www.tenis-radgona.si/images/stories/liga_2024/rezultati_ženske_2023.pdf";
//   let dataBuffer = "";

//   // Reading PDF file from local path
//   dataBuffer = fs.readFileSync(
//     "../../../../../../Users/zan_s/Desktop/rezultati lige/rezultati_ženske_2024.pdf"
//   );

//   // Parse PDF data
//   let data;
//   try {
//     data = await pdfparse(dataBuffer);
//   } catch (error) {
//     console.error("Failed to parse PDF data:", error);
//     res.status(500).json({ message: "Failed to parse PDF data" });
//     return;
//   }

//   function parseMatchData(data) {
//     const lines = data["text"].split("\n").filter((line) => line.trim() !== "");

//     const results = [];
//     let currentWeek = "";
//     let homePlayer, awayPlayer;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // Match the week line
//       const weekMatch = line.match(/^(\d+\.?\s*kolo)/);
//       if (weekMatch) {
//         currentWeek = weekMatch[1].match(/\d+/)[0];
//         continue;
//       }

//       // Skip the 'rezultat' line
//       if (line.includes(":")) {
//         [homePlayer, awayPlayer] = line.split(":").map((str) => str.trim());
//         continue;
//       }

//       // Handle match results
//       if (line == "000000") {
//         results.push({
//           week: currentWeek,
//           homePlayer: homePlayer,
//           awayPlayer: awayPlayer,
//           matchResult: "No result",
//           league: 6, // Assuming league 6 for women's league
//           deadline: calculateDeadline(currentWeek),
//         });
//       } else if (!isNaN(line)) {
//         const pairs = line.match(/(\d{2})/g);
//         const filteredPairs = pairs.filter(
//           (pair) => !(pair[0] == "0" && pair[1] == "0")
//         );
//         const resultStr = filteredPairs
//           .map((pair) => pair[0] + "-" + pair[1])
//           .join(",");

//         results.push({
//           week: currentWeek,
//           homePlayer: homePlayer,
//           awayPlayer: awayPlayer,
//           matchResult: resultStr,
//           league: 6,
//           deadline: calculateDeadline(currentWeek),
//         });
//       }
//     }

//     return results;
//   }

//   const parsedResults = parseMatchData(data);

//   // Insert results into the database
//   try {
//     await insertScheduleWithResults(parsedResults);
//     res.json({ message: "Success", results: parsedResults });
//   } catch (error) {
//     console.error("Failed to insert results:", error);
//     res.status(500).json({ message: "Failed to insert results" });
//   }

//   // Function to insert results into the schedule table
//   async function insertScheduleWithResults(parsedResults) {
//     for (const result of parsedResults) {
//       const { homePlayer, awayPlayer, matchResult, league, week, deadline } =
//         result;

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

//         // Fetch players_season.id after inserting into players_season
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

//         // Insert match into schedule
//         const insertQuery = `
//                     INSERT INTO schedule (home_player, away_player, result, week, deadline)
//                     VALUES (?, ?, ?, ?, ?)
//                     ON DUPLICATE KEY UPDATE 
//                     result = CASE 
//                         WHEN result = 'No result' THEN VALUES(result) 
//                         ELSE result 
//                     END,  
//                     week = VALUES(week), 
//                     deadline = VALUES(deadline);`;

//         const queryParams = [
//           homePlayerSeasonId,
//           awayPlayerSeasonId,
//           matchResult,
//           week,
//           deadline,
//         ];

//         try {
//           await new Promise((resolve, reject) => {
//             connection.query(insertQuery, queryParams, (err, results) => {
//               if (err) {
//                 reject(err);
//               } else {
//                 resolve(results);
//               }
//             });
//           });
//         } catch (error) {
//           console.error(
//             `Error inserting match for ${homePlayer} vs ${awayPlayer}:`,
//             error
//           );
//         }
//       } else {
//         console.error(`Player ID not found for ${homePlayer} or ${awayPlayer}`);
//       }
//     }
//   }

//   // Helper function to get player ID from the database
//   async function getPlayerId(playerName) {
//     return new Promise((resolve, reject) => {
//       let reversedName = playerName.split(" ").reverse().join(" ");

//       const query = `SELECT id FROM players WHERE name=? OR name=?;`;
//       connection.query(query, [playerName, reversedName], (err, results) => {
//         if (err) {
//           reject(err);
//         } else if (results.length > 0) {
//           resolve(results[0].id);
//         } else {
//           resolve(null); // Player not found
//         }
//       });
//     });
//   }

//   // Helper function to insert player into player_season table
//   async function insertPlayerSeason(playerId, leagueId, seasonId) {
//     const insertQuery = `
//             INSERT INTO players_season (player_id, league_id, season_id)
//             VALUES (?, ?, ?)
//             ON DUPLICATE KEY UPDATE league_id = VALUES(league_id), season_id = VALUES(season_id);`;

//     const queryParams = [playerId, leagueId, seasonId];

//     return new Promise((resolve, reject) => {
//       connection.query(insertQuery, queryParams, (err, results) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(results);
//         }
//       });
//     });
//   }

//   // Helper function to get players_season.id after inserting the player
//   async function getPlayerSeasonId(playerId, leagueId, seasonId) {
//     return new Promise((resolve, reject) => {
//       const query = `SELECT id FROM players_season WHERE player_id=? AND league_id=? AND season_id=?;`;
//       connection.query(
//         query,
//         [playerId, leagueId, seasonId],
//         (err, results) => {
//           if (err) {
//             reject(err);
//           } else if (results.length > 0) {
//             resolve(results[0].id);
//           } else {
//             resolve(null); // Player in the season not found
//           }
//         }
//       );
//     });
//   }

//   // Helper function to get league ID by its name
//   async function getLeagueIdByName(leagueName) {
//     return new Promise((resolve, reject) => {
//       const query = `SELECT id FROM leagues WHERE id=?;`;
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

//   // Helper function to get season ID by its name
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

//   // Helper function to calculate deadlines based on the week
//   function calculateDeadline(week) {
//     // Logic to calculate the deadline for the match week
//     const startDate = new Date(2024, 0, 1); // Assuming season starts in January 2024
//     const deadlineDate = new Date(
//       startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000
//     ); // Add week number
//     return deadlineDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
//   }
// });

app.get("/getmatches/:leagueId", (req, res) => {
  const leagueId = req.params.leagueId;
  const seasonId = req.headers.season;
  let token
  let role=""
  let query
  let decoded
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     
  }else{
  token = authHeader.split('Bearer ')[1];
   decoded = jwt.verify(token, process.env.secret);
    role = decoded.role;
  }

 
  

 

 if(role=="admin"){
   query = `
     SELECT 
    s.id,
    ps_home.player_id AS home_player_id,
    hp.name AS home_player,
    ps_away.player_id AS away_player_id,
    ap.name AS away_player,
    s.result,
    ps_home.league_id,
    s.week,
    s.deadline,
    hp.phone as home_phone,
    ap.phone as away_phone
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
    s.week `;
 }else{
  query = `
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
 }

 

  connection.query(query, [leagueId, seasonId], (err, results) => {
    if (err) {
      console.error("Error fetching matches:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching matches" });
      return;
    }
   
    res.json(results);
  });
});
// Route to generate and store the round-robin schedule
// app.post("/generate-schedule",verifyToken("admin"), (req, res) => {
//   const { liga, season } = req.body;
//   console.log(req.body)
//   // Fetch player IDs
//   connection.query(
//     "SELECT * FROM players_season WHERE league_id=? and season_id=?",[liga,season], (err, data) => {
//       if (err) {
//         console.error("Error fetching players:", err);
//         res
//           .status(500)
//           .json({ error: "An error occurred while fetching players" });
//         return;
//       }

//       // Extract player IDs from the query result
//       const playerIds = data.map((row) => row.id);
//       const playerNameMap = new Map(data.map((row) => [row.id, row.name])); // Map IDs to names for reference

//       console.log(playerIds);

//       const shuffledPlayerIds = shuffle(playerIds);
//       console.log(shuffledPlayerIds)
//       const schedule = generateRoundRobinSchedule(shuffledPlayerIds);
//       const alternatedSchedule = schedule;
//       console.log(schedule.length)
//       //Insert schedule into the database
//       for (let week = 0; week < alternatedSchedule.length; week++) {
//         const roundData = alternatedSchedule[week]; // Get the data for the current round
//         const round = roundData.round;
//         const match = roundData.match;
//         const homePlayerId = roundData.player1;  // Home player (player1)
//         const awayPlayerId = roundData.player2;  // Away player (player2)
//         console.log(homePlayerId)
//         // Now insert this match into your database
//         const query = "INSERT INTO schedule (week, home_player, away_player, deadline) VALUES (?, ?, ?, ?)";
        
//         connection.query(
//             query,
//             [
//                 round,  // The current round number (week)
//                 homePlayerId,  // Home player ID
//                 awayPlayerId,  // Away player ID
//                 calculateDeadline(round),  // A function that calculates the deadline for this round
//             ],
//             (err, results) => {
//                 if (err) {
//                     console.error("Error inserting match:", err);
//                 } else {
//                     console.log("Inserted match:", results.insertId);
//                 }
//             }
//         );
    
        
//        }

//       res.json({ message: "Schedule generated and stored in the database." });
//     }
//   );
// });
app.post("/generate-schedule2",verifyToken("admin"),async (req, res) => {
  const { player_Ids, season } = req.body;
 
  // Fetch player IDs



    

      shuffledPlayerIds = player_Ids;
    
      const schedule = generateRoundRobinSchedule(shuffledPlayerIds);
      const alternatedSchedule = schedule;
     
      //Insert schedule into the database
      for (let week = 0; week < alternatedSchedule.length; week++) {
        const roundData = alternatedSchedule[week]; // Get the data for the current round
        const round = roundData.round;
        const match = roundData.match;
        const homePlayerId = roundData.player1;  // Home player (player1)
        const awayPlayerId = roundData.player2;  // Away player (player2)
       
        // Now insert this match into your database
        const query = "INSERT INTO schedule (week, home_player, away_player, deadline) VALUES (?, ?, ?, ?)";
        
        connection.query(
            query,
            [
                round,  // The current round number (week)
                homePlayerId,  // Home player ID
                awayPlayerId,  // Away player ID
                calculateDeadline(round,await getDate(season)),  // A function that calculates the deadline for this round
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

      res.json({ message: "Schedule generated and stored in the database.",schedule:schedule });
    
 
});

app.get("/calculate-standings/:id", (req, res) => {
  let leagueId = req.params.id;
  let seasonId = req.headers.season || 4; // Assuming seasonId is 1 for now, you can dynamically fetch it if needed
  
  const fetchMatchesQuery = `
    SELECT 
        s.home_player,
        hps.player_id AS home_player_id,
        s.away_player,
        aps.player_id AS away_player_id,
        s.result,
        penalty
        
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
      
          // Initialize standings for all players
          players.forEach((player) => {
            standings[player.player_season_id] = {
              points: 0,
              netGamesWon: 0,
              setsPlayed: 0,
              netSetsWon: 0,
              matchesPlayed: 0,
              matchesWon: 0,
              name:player.name,
              penalties:0
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
          
            standings[homePlayerSeasonId].netGamesWon += homeGamesWon - awayGamesWon;
            standings[awayPlayerSeasonId].netGamesWon += awayGamesWon - homeGamesWon;
          
            standings[homePlayerSeasonId].netSetsWon += homeSetsWon - awaySetsWon;
            standings[awayPlayerSeasonId].netSetsWon += awaySetsWon - homeSetsWon;
          
            standings[homePlayerSeasonId].setsPlayed += homeSetsWon + awaySetsWon;
            standings[awayPlayerSeasonId].setsPlayed += homeSetsWon + awaySetsWon;
          
            // ✅ Deduct points if home player received a penalty
           
            if (match.penalty==homePlayerSeasonId ) {
              
              standings[homePlayerSeasonId].points -= 1;
              standings[homePlayerSeasonId].penalties +=1;
              console.log(
                `Penalty applied: ${standings[homePlayerSeasonId].name} loses 1 point`
              );
            }else if(match.penalty==awayPlayerSeasonId){
              standings[awayPlayerSeasonId].points -= 1;
              standings[awayPlayerSeasonId].penalties +=1;
              console.log(
                `Penalty applied: ${standings[awayPlayerSeasonId].name} loses 1 point`
              );
            }
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
         let alltiedplayers=[]
          
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
    if (checkedPairs.has(pairIdentifier)) return;

    checkedPairs.add(pairIdentifier);

    const match = matches.find(
      (m) =>
        (m.home_player == playerA && m.away_player == playerB) ||
        (m.home_player == playerB && m.away_player == playerA)
    );

    // If no match found or no valid result, skip stat calculations
    if (!match || !match.result || match.result.toLowerCase() === "no result") {
      // Still record the opponent with placeholder data
      playerStatsInTieGroup[playerA].opponents.push({
        opponent: standings[playerB].name,
        sets: "-",
        result: "No result",
        netSetsWon: 0,
        netGamesWon: 0,
      });
      playerStatsInTieGroup[playerB].opponents.push({
        opponent: standings[playerA].name,
        sets: "-",
        result: "No result",
        netSetsWon: 0,
        netGamesWon: 0,
      });
      return;
    }

    // If match has a valid result
    const sets = match.result.split(",").map((set) => set.trim());
    let homeSetsWon = 0,
      awaySetsWon = 0,
      homeGamesWon = 0,
      awayGamesWon = 0;

    sets.forEach((set) => {
      const [homeScore, awayScore] = set.split("-").map(Number);
      if (!isNaN(homeScore) && !isNaN(awayScore)) {
        if (homeScore > awayScore) homeSetsWon++;
        else awaySetsWon++;
        homeGamesWon += homeScore;
        awayGamesWon += awayScore;
      }
    });

    // Identify who's home and who's away
    const isPlayerAHome = match.home_player == playerA;

    const playerAStats = playerStatsInTieGroup[playerA];
    const playerBStats = playerStatsInTieGroup[playerB];

    // Result and stat calculation
    const playerAWon = isPlayerAHome ? homeSetsWon > awaySetsWon : awaySetsWon > homeSetsWon;

    // Update win counters and H2H
    if (playerAWon) {
      playerAStats.wins++;
      playerAStats.headToHeadResults[playerB] = "Win";
      playerBStats.headToHeadResults[playerA] = "Loss";
    } else {
      playerBStats.wins++;
      playerBStats.headToHeadResults[playerA] = "Win";
      playerAStats.headToHeadResults[playerB] = "Loss";
    }

    // Update net sets/games
    const netSetsA = isPlayerAHome
      ? homeSetsWon - awaySetsWon
      : awaySetsWon - homeSetsWon;
    const netGamesA = isPlayerAHome
      ? homeGamesWon - awayGamesWon
      : awayGamesWon - homeGamesWon;

    const netSetsB = -netSetsA;
    const netGamesB = -netGamesA;

    playerAStats.netSetsWon += netSetsA;
    playerAStats.netGamesWon += netGamesA;
    playerBStats.netSetsWon += netSetsB;
    playerBStats.netGamesWon += netGamesB;

    // Push opponent data for both players
    playerAStats.opponents.push({
      opponent: standings[playerB].name,
      sets: match.result,
      result: playerAWon ? "Win" : "Loss",
      netSetsWon: netSetsA,
      netGamesWon: netGamesA,
    });

    playerBStats.opponents.push({
      opponent: standings[playerA].name,
      sets: match.result,
      result: playerAWon ? "Loss" : "Win",
      netSetsWon: netSetsB,
      netGamesWon: netGamesB,
    });
  });
});


     // Later, each time you get a new playerStatsInTieGroup object:
alltiedplayers.push(playerStatsInTieGroup);

// Combine all tied players into one set for checking
const combinedTiedPlayerIds = new Set();

alltiedplayers.forEach(tiedGroup => {
  Object.keys(tiedGroup).forEach(playerId => {
    combinedTiedPlayerIds.add(playerId);
  });
});

const allPlayerIds = Object.keys(standings);

allPlayerIds.forEach((playerId) => {
  if (combinedTiedPlayerIds.has(playerId)) {
    // This player is in at least one tied group, keep tie-breaker stats
    const stats = playerStatsInTieGroup[playerId] || {}; // Or get from the last group where player is tied
    
    if (!stats || Object.keys(stats).length === 0) {
      console.warn(`⚠️ No stats found for tied player ${playerId}`);
      return;
    }
    
    const saveStatsQuery = `
      UPDATE standings
      SET tie_breaker_stats = ?
      WHERE player = ?;
    `;
    
    connection.query(saveStatsQuery, [JSON.stringify(stats), playerId], (err) => {
      if (err) {
        console.error("❌ Error saving tie-breaker stats for", playerId, err);
      } else {
        console.log(`✅ Tie-breaker stats saved for player ${playerId}`);
      }
    });
    
  } else {
    // Player is NOT tied in any group, remove tie-breaker stats
    const deleteStatsQuery = `
      UPDATE standings
      SET tie_breaker_stats = NULL
      WHERE player = ?;
    `;
    
    connection.query(deleteStatsQuery, [playerId], (err) => {
      if (err) {
        console.error("❌ Error removing tie-breaker stats for", playerId, err);
      } else {
        console.log(`🧹 Tie-breaker stats removed for player ${playerId}`);
      }
    });
  }
});
return tiedPlayers.sort((playerA, playerB) => {
  const tieStatsA = playerStatsInTieGroup[playerA] || {};
  const tieStatsB = playerStatsInTieGroup[playerB] || {};

  const overallA = standings[playerA] || {};
  const overallB = standings[playerB] || {};

  // 1. Wins in tie group
  const winsDiff = (tieStatsB.wins ?? 0) - (tieStatsA.wins ?? 0);
  if (winsDiff !== 0) return winsDiff;

  // 2. Head-to-head if exists
  const h2h = tieStatsA.headToHeadResults?.[playerB];
  if (h2h === "Win") {
    // Use tie group net sets/games only if head-to-head exists
    const netSetsDiff = (tieStatsB.netSetsWon ?? 0) - (tieStatsA.netSetsWon ?? 0);
    if (netSetsDiff !== 0) return netSetsDiff;

    const netGamesDiff = (tieStatsB.netGamesWon ?? 0) - (tieStatsA.netGamesWon ?? 0);
    if (netGamesDiff !== 0) return netGamesDiff;

    return -1; // A beat B
  }

  if (h2h === "Loss") {
    const netSetsDiff = (tieStatsB.netSetsWon ?? 0) - (tieStatsA.netSetsWon ?? 0);
    if (netSetsDiff !== 0) return netSetsDiff;

    const netGamesDiff = (tieStatsB.netGamesWon ?? 0) - (tieStatsA.netGamesWon ?? 0);
    if (netGamesDiff !== 0) return netGamesDiff;

    return 1; // B beat A
  }

  // 3. No head-to-head => use overall net sets/games
  const netSetsDiff = (overallB.netSetsWon ?? 0) - (overallA.netSetsWon ?? 0);
  if (netSetsDiff !== 0) return netSetsDiff;

  const netGamesDiff = (overallB.netGamesWon ?? 0) - (overallA.netGamesWon ?? 0);
  if (netGamesDiff !== 0) return netGamesDiff;

  // 4. Still tied
  return 0;
});
          };
          
          
          
          const orderedPlayerIds = reorderStandings();


          
          // if (orderedPlayerIds.length === new Set(orderedPlayerIds.map(id => standings[id].points )).size) {
          //   // If all players have unique points, clear tie-breaker stats
          //   const clearTieBreakerStatsQuery = `
          //     UPDATE standings
          //     SET tie_breaker_stats = NULL
          //     WHERE player IN (
          //       SELECT player FROM players_season WHERE league_id = ? AND season_id = ?
          //     )
          //   `;
          
          //   connection.query(clearTieBreakerStatsQuery, [leagueId, seasonId], (err) => {
          //     if (err) {
          //       console.error("Error clearing tie-breaker stats:", err);
          //     } else {
          //       console.log("Tie-breaker stats cleared as no ties exist.");
          //     }
          //   });
          // }
          const updateOrInsertStandingsQuery = `
                INSERT INTO standings (player, points, netGamesWon, setsPlayed, netSetsWon, matches_played, week, position,num_of_penalty)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
                ON DUPLICATE KEY UPDATE
                    points = VALUES(points),
                    netGamesWon = VALUES(netGamesWon),
                    setsPlayed = VALUES(setsPlayed),
                    netSetsWon = VALUES(netSetsWon),
                    matches_played = VALUES(matches_played),
                    position = VALUES(position),
                    num_of_penalty= VALUES(num_of_penalty)
            `;
           
            const allZeroMatches = Object.values(matches).every(player => player.result=="No result");
            let orderedPlayerIds2=[]
            if (allZeroMatches) {
             
              
             // Step 1: Sort player IDs based on player names
   orderedPlayerIds2 = Object.keys(standings).sort(
    (a, b) => standings[a].name.localeCompare(standings[b].name)
  );

            
              console.log("Sorted as array:", orderedPlayerIds);
            } else {
              orderedPlayerIds2=orderedPlayerIds
              console.log("Some players have matches played.");
            }
          // Execute one insert/update per player

          let promises = orderedPlayerIds2.map((playerSeasonId, index) => {
         
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
                  standings[playerSeasonId].penalties
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
          WHERE ps.league_id=? and ps.season_id=? and (p.name!='prosta' and p.name !='prost')
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

app.post("/update-match-result", verifyToken("user,admin"), (req, res) => {
  const { id, result } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  if (!id || !result) {
    return res.status(400).json({ error: "Missing match ID or result" });
  }

  // First, fetch the match to validate ownership
  const checkQuery = `
   SELECT p.user_id,p.name as home,p_away.name as away
    FROM schedule s
    JOIN players_season ps_home ON s.home_player = ps_home.id
  	join players p on ps_home.player_id=p.id
    JOIN players_season ps_away ON s.away_player = ps_away.id
    join players p_away on ps_away.player_id=p_away.id
    WHERE s.id = ? AND s.result_confirmed = 0
  `;

  connection.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching match:", err);
      return res.status(500).json({ error: "Database error while checking match" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Match not found or already confirmed" });
    }

    const match = results[0];
   
    // Check if the user is the home player or has admin role
    if (role !== "admin" && match.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this match" });
    }

    // Proceed to update the result
    const updateQuery = `
      UPDATE schedule SET result = ?,edited_by=? 
      WHERE id = ? AND result_confirmed = 0
    `;
    sendEmail("krizaniczan@gmail.com",match.home+" vs "+match.away+" " +result+" uporabnik "+req.user.email,"novi rezultat")
    connection.query(updateQuery, [result,userId, id], (err, updateResult) => {
      if (err) {
        console.error("Error updating match result:", err);
        return res.status(500).json({ error: "Failed to update match result" });
      }

      res.json({ message: "Match result updated successfully" });
    });
  });
});
app.post("/ifalreadyinleague", (req, res) => {
  const { id } = req.body;
  const { season } = req.headers;
  
  const query = "SELECT players_season.id  FROM players LEFT JOIN players_season on players.id=players_season.player_id WHERE players.user_id=? and players_season.season_id=?";

  const query1 = "SELECT players.id FROM players WHERE players.user_id=?";

  connection.query(query, [id, season], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }
    connection.query(query1, [id], (err, results1) => {
      if (err) {
        console.error("Error updating match result:", err);
        res
          .status(500)
          .json({ error: "An error occurred while updating match result" });
        return;
      }
  
    if(results.length>0){
       res.json({ message: "true" });
    }else if(results.length==0 && results1.length>0){
      res.json({ message: "false",message1:"true" });
    }else{
      res.json({ message: "false" });
    }

  });
  });
});

app.post("/promote",verifyToken("admin"), (req, res) => {
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
app.post("/applypenalty",verifyToken("admin"), (req, res) => {
  const { id, matchid } = req.body;
  const query = "UPDATE schedule SET penalty = ? WHERE id = ?";

  connection.query(query, [ id,matchid], (err, results) => {
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
app.post("/changePlayerLeague",verifyToken("admin"), (req, res) => {
  const { id, newleagueid } = req.body;
  
  const query = "UPDATE players_season SET league_id = ? WHERE id = ?";

  connection.query(query, [newleagueid,id], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }
    
    
    res.status(200).json({ message: "Uspešno spremenjena liga igralca" });
  });
});
app.post("/removePlayer",verifyToken("admin"), (req, res) => {
  const { id } = req.body;
  const query = "DELETE FROM players_season WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }
   
    res.status(200).json({ message: "Igralec uspešno odstranjen!" });
  });
});
// app.post("/removeAllMatches", (req, res) => {
//   const { id} = req.body;
//   const {season} =req.headers
//  console.log(req.headers)
//   const query = "DELETE schedule FROM schedule LEFT JOIN players_season on players_season.id=schedule.home_player WHERE schedule.result='no result' and players_season.season_id=? and players_season.league_id=?";

//   connection.query(query, [season,id], (err, results) => {
//     if (err) {
//       console.error("Error updating match result:", err);
//       res
//         .status(500)
//         .json({ error: "An error occurred while updating match result" });
//       return;
//     }
//     console.log(results)
//     res.status(200).json({ message: "Igralec uspešno odstranjen!" });
//   });
// });
// app.post("/demote",verifyToken("admin"), (req, res) => {
//   const { id, status,seasonid } = req.body;
//   const query = "UPDATE players_season SET promotion_status = ? WHERE id = ? and season_id=?";

//   connection.query(query, [status, id,seasonid], (err, results) => {
//     if (err) {
//       console.error("Error updating match result:", err);
//       res
//         .status(500)
//         .json({ error: "An error occurred while updating match result" });
//       return;
//     }

//     res.status(200).json({ message: "Match result updated successfully" });
//   });
// });
// app.post("/fetchpromotedanddemoted",verifyToken("admin"), (req, res) => {
//   season_id=req.body.seasonid
//   const sql = `
//     WITH TopPlayers AS (
//         SELECT s.player, p.name, s.points, s.position, ps.league_id,l.name as liga,ps.season_id,ps.promotion_status,
//                ROW_NUMBER() OVER (PARTITION BY ps.league_id ORDER BY s.position ASC) AS rank
//         FROM standings s
//         JOIN players_season ps ON s.player = ps.id
//         JOIN players p ON ps.player_id = p.id
//         JOIN leagues l ON ps.league_id=l.id
//         WHERE ps.league_id IN (2, 3, 4, 5) 
//           AND ps.injured = 0
//           AND s.position IN (1, 2, 3) 
//           and ps.season_id=?
//     ),
//     BottomPlayers AS (
//         SELECT s.player, p.name, s.points, s.position, ps.league_id,l.name as liga,ps.season_id,ps.promotion_status,
//                ROW_NUMBER() OVER (PARTITION BY ps.league_id ORDER BY s.position DESC) AS rank
//         FROM standings s
//         JOIN players_season ps ON s.player = ps.id
//         JOIN players p ON ps.player_id = p.id
//          JOIN leagues l ON ps.league_id=l.id
//         WHERE ps.league_id IN (1, 2, 3, 4) 
//           AND ps.injured = 0 
//           and ps.season_id=?
//     )
//     SELECT * FROM TopPlayers WHERE rank <= 3 and promotion_status=''
//     UNION ALL
//     SELECT * FROM BottomPlayers WHERE rank <= 3 and promotion_status=''
//   `;

//   connection.query(sql,[season_id,season_id], (error, results) => {
//     if (error) {
//       console.error('Error executing query:', error);
//       return res.status(500).json({ error: 'Database query failed' });
//     }
//     console.log(results)
//     // Sending the results
//     res.json(results);
//   });
// });

app.post("/endLeague",verifyToken("admin"), (req, res) => {
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
app.post("/lockstandings",verifyToken("admin"), (req, res) => {
  season=req.body.seasonid
  
  const query = 'UPDATE season SET standings_status = "locked" WHERE id=?';

  connection.query(query, [season], (err, results) => {
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
app.post("/checkstatus",verifyToken("admin"), (req, res) => {
  season=req.body.seasonid
  
  const query = 'SELECT * FROM season WHERE id=?';

  connection.query(query, [season], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }

    res.json(results);
  });
});


app.get("/leagues", (req, res) => {
  const seasonId = req.headers.season;

  const query = `
       SELECT DISTINCT ps.league_id, l.*
FROM schedule s
JOIN players_season ps ON ps.id = s.home_player OR ps.id = s.away_player
JOIN leagues l ON ps.league_id = l.id
WHERE ps.season_id = ?;
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
app.post("/confirmResult",verifyToken("user"), (req, res) => {
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

    res.json({ message: "Rezultat je bil uspeĹˇno potrjen" });
  });
});//add check if  the player is correct
app.post("/forfeitMatch",verifyToken("user") ,(req, res) => {
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
});//check if player is correct
app.get("/leagues/:id/players", (req, res) => {
  const leagueId = req.params.id;
  const seasonId = req.headers.season;
  const query = `
      SELECT  p.name,ps.id,ps.player_id
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
    ps_home.player_id AS home_player_id,
    hp.name AS home_player,
    ps_away.player_id AS away_player_id,
    ap.name AS away_player,
    s.result,
    ps_home.league_id,
    s.week,
    s.deadline,
    s.home_player as home_player_s_id,
    s.away_player as away_player_s_id,
    s.admin_comment
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
app.get("/getplayers",verifyToken("admin"), (req, res) => {
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
app.get("/getUsers",verifyToken("admin"), (req, res) => {
  const leagueId = req.params.id;
  const query = `
    SELECT u.*,u.id, u.name, p.id AS playerId
    FROM users u
    LEFT JOIN players p ON u.id = p.user_id;
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
app.post("/linkplayer",verifyToken("admin"), (req, res) => {
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

    res.json({ message: "Igralec uspešno povezan!" });
  });
});
app.post("/createSeason",verifyToken("admin") ,(req, res) => {
  
 let { year, start_date,end_date } = req.body.data;
   start_date = Math.floor(new Date(start_date).getTime()/1000);
   end_date = Math.floor(new Date(end_date).getTime()/1000);
  const query = "INSERT INTO season (year,start_date,end_date) VALUES (?,?,?)";
  connection.query(query, [year, start_date,end_date], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }
    if(results.affectedRows>0){
       res.json({ message: "Nova sezona uspešno vnešena" });
    }

   
  });
});
app.post("/updateSeason", verifyToken("admin"),(req, res) => {
 
 let { year, start_date,end_date,status,standings_status,promotion } = req.body.data;
   start_date = Math.floor(new Date(start_date).getTime()/1000);
   end_date = Math.floor(new Date(end_date).getTime()/1000);
  const query = "UPDATE season SET year=?,start_date=?,end_date=?,status=?,standings_status=?,promotion_demotion_status=? WHERE year=? ";
  connection.query(query, [year, start_date,end_date,status,standings_status,promotion,year], (err, results) => {
    if (err) {
      console.error("Error updating match result:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating match result" });
      return;
    }
    if(results.affectedRows>0){
       res.json({ message: "Sezona uspešno urejena!" });
    }

   
  });
});
app.post("/register", (req, res) => {
  users = [];
  let message="Registracija uspešna! Za potrditev vašega računa kliknite na naslednji link: "
  const { name, phone, email, password,country,phonePrefix,gender } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  users.push({ email, password: hashedPassword });
  const query =
    "INSERT INTO users (name,phone,email,password,drzava,phoneaffix,gender) VALUES (?,?,?,?,?,?,?)";

  connection.query(
    query,
    [name, phone, email, hashedPassword,country,phonePrefix,gender],
    (err, results) => {
      if (err) {
        console.error("Error inserting user", err);
        res.status(500).json({ error: "error inserting user" });
        return;
      } else {
      
        if(results.affectedRows>0){
          sendEmail(email,message)
          sendEmail("krizaniczan@gmail.com","Novi uporabnik "+name+" "+email)
          res.json(results);
        }
        
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
    if(results==""){
      res.status(401).send("Uporabnik ne obstaja")
      return
    }
    if (results[0].email && bcrypt.compareSync(password, results[0].password)) {
      const token = jwt.sign(
        {
          email: results[0].email,
          role: results[0].role,
          name: results[0].name,
          id: results[0].id,
        },
        process.env.secret,
        { expiresIn: "24h" }
      );
      // sendEmail();
      res.send({ token });
    } else {
      res.status(401).send("Napačno geslo!");
    }
  });
});

app.post("/request-reset", (req, res) => {
  const { email,domain } = req.body;
  const query = "SELECT * FROM users WHERE email=?";
 
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching players" });
      return;
    }
    if(results==""){
      res.status(401).send("Uporabnik ne obstaja")
      return
    }
    console.log(domain)
     const token = jwt.sign(
        {
          email: email,
          
        },
        process.env.secret,
        { expiresIn: "24h" }
      );
    // if (results[0].email && bcrypt.compareSync(password, results[0].password)) {
    //   const token = jwt.sign(
    //     {
    //       email: results[0].email,
    //       role: results[0].role,
    //       name: results[0].name,
    //       id: results[0].id,
    //     },
    //     process.env.secret,
    //     { expiresIn: "24h" }
    //   );
    //   // sendEmail();
    //   res.send({ token });
    // } else {
    //   res.status(401).send("Napačno geslo!");
    // }
      const query = "SELECT * FROM users WHERE email=?";
 
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching players:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching players" });
      return;
    }
    sendEmail("krizaniczan@gmail.com","http://localhost:4200/resetpassword?token="+token,"asd")
    res.send("")
  });
});
})
app.post("/verifyresettoken", (req, res) => {
  const { token } = req.body;
  console.log(req.body)
   const decoded = jwt.verify(token, process.env.secret);
   console.log(decoded)
  res.send(decoded)
    // if (results[0].email && bcrypt.compareSync(password, results[0].password)) {
    //   const token = jwt.sign(
    //     {
    //       email: results[0].email,
    //       role: results[0].role,
    //       name: results[0].name,
    //       id: results[0].id,
    //     },
    //     process.env.secret,
    //     { expiresIn: "24h" }
    //   );
    //   // sendEmail();
    //   res.send({ token });
    // } else {
    //   res.status(401).send("Napačno geslo!");
    // }
  
  
})

app.post("/resetpassword", (req, res) => {
  const { token,password } = req.body;
   const hashedPassword = bcrypt.hashSync(password, 8);
   const decoded = jwt.verify(token, process.env.secret);
   console.log(decoded)
 const query = "UPDATE users SET password=? WHERE email=?";
 
  connection.query(query, [hashedPassword,decoded.email], (err, results) => {
    console.log(results)
    if (err) {
      console.error("Error fetching players:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching players" });
      return;
    }
   
    if(results.affectedRows==1){
      res.status(200).json("geslo uspešno posodobljeno!")
    }

  
  

})

})
app.post("/updateComment", (req, res) => {
  const { id,comment } = req.body;
  console.log(req.body)
 const query = "UPDATE schedule SET admin_comment=? WHERE id=?";
 
  connection.query(query, [comment,id], (err, results) => {
    console.log(results)
    if (err) {
      console.error("Error fetching players:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching players" });
      return;
    }
   
    if(results.affectedRows==1){
      res.status(200).json("komentar uspešno dodan!")
    }

  
  

})

})
app.post("/registerForLeagueNonUserPlayers", (req, res) => {
  const { fullName, phoneNumber, email, gender, password } = req.body.form;

 let league_id;
    if (gender == "ž") {
      league_id = 6; // Women's league ID
    } else {
      league_id = 5; // Men's league ID
    }
  // Function to register a player for a league with tier adjustment based on promotion/relegation
  const registerPlayerForLeague = (fullName, leagueId, seasonId, phone, email, password, callback) => {
   

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
            if (promotionStatus == 'promoted') {
              console.log('Player promoted, adjusting to tier:', currentTier - 1);
              currentTier -= 1; // Promotion means moving to a higher tier
            } else if (promotionStatus == 'demoted') {
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
            if(gender==ž){
		
              const newLeagueId = 6;
           

            // Step 4: Insert or update the player in the players_season table
            insertIntoPlayersSeason(playerId, newLeagueId, seasonId, callback);
          }

            console.error('No promotion data found for player');
            callback('No promotion data found for player', null);
          }
        });

      } else {
        // Step 5: Player doesn't exist, insert into the players table
        const insertPlayerQuery = 'INSERT INTO players (name, phone, email,gender) VALUES (?, ?, ?,?)';

        connection.query(insertPlayerQuery, [fullName, phone, email,gender], (err, result) => {
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
  
  const seasonId = 4; // Example season ID

  registerPlayerForLeague(fullName, league_id, seasonId, phoneNumber, email, password, (err, result) => {
    if (err) {
      console.error('Error registering player:', err);
      //res.status(400).json({ error: err });
    } else {
      console.log('Player registration successful:', result);
      res.status(200).json({ message: 'Player registered successfully!' });
    }
  });
});
app.post("/registerForLeagueRegisteredPlayers",verifyToken("user"), (req, res) => {
  const userId = req.body.id; // We assume userId is passed directly
  const name=req.body.form.fullName
  const email=req.body.form.email
  const phone=req.body.form.phoneNumber
  const gender=req.body.form.gender
  const seasonId = 4; // Example season ID

  // Step 1: Check if the player exists and retrieve their player_id using the known user_id
  const findPlayerQuery = `
    SELECT *,players.id as id_player
    FROM players 
    LEFT JOIN users on players.user_id=users.id 
    WHERE user_id = ?
  `;

  connection.query(findPlayerQuery, [userId], (err, playerResults) => {
    if (err) {
      console.error("Error finding player:", err);
      res.status(500).json({ error: "Error finding player" });
      return;
    }

    if (playerResults.length === 0) {
      // Player not found, insert into players table
      const insertPlayerQuery = `
        INSERT INTO players (name,user_id,phone,email,gender) 
        VALUES (?,?,?,?,?)
      `;
      

      connection.query(insertPlayerQuery, [name,userId,phone,email,gender], (err, insertResult) => {
        if (err) {
          console.error("Error inserting new player:", err);
          res.status(500).json({ error: "Error inserting new player" });
          return;
        }

        // Fetch the newly inserted player's ID
        const newPlayerId = insertResult.insertId;

        console.log("New player inserted with ID:", newPlayerId);

        // Proceed with league registration using new player ID
        registerPlayerForLeague(newPlayerId, seasonId, res,gender);
      });
    } else {
   let gender1=playerResults[0].gender
      const playerId = playerResults[0].id_player; 
       
      registerPlayerForLeague(playerId, seasonId, res,gender1);
    }
  });
});

// Function to handle league registration
function registerPlayerForLeague(playerId, seasonId, res,gender) {
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
      console.error("Error checking promotion status and tier:", err);
      res.status(500).json({ error: "Error checking promotion status" });
      return;
    }
    let currentTier = '';
    if(gender=="m"){
      currentTier = 5; // Default tier
    }else{
       currentTier = 6; // Default tier for women
    }
   
    if (promotionResults.length > 0) {
      const promotionStatus = promotionResults[0].promotion_status;
      currentTier = promotionResults[0].tier;

      if (promotionStatus === "promoted") {
        currentTier -= 1; // Move to a higher tier
      } else if (promotionStatus === "relegated") {
        currentTier += 1; // Move to a lower tier
      }
    }

    // Step 3: Find the new league ID for the updated tier
    const getNewLeagueIdQuery = `
      SELECT id 
      FROM leagues 
      WHERE tier = ?
    `;

    connection.query(getNewLeagueIdQuery, [currentTier], (err, leagueResults) => {
      if (err) {
        console.error("Error fetching league for the new tier:", err);
        res.status(500).json({ error: "Error fetching league" });
        return;
      }

      if (leagueResults.length > 0) {
        const newLeagueId = leagueResults[0].id;

        // Step 4: Insert or update the player in the players_season table
        const insertPlayersSeasonQuery = `
          INSERT INTO players_season (player_id, league_id, season_id) 
          VALUES (?, ?, ?)
         
        `;
       
        connection.query(insertPlayersSeasonQuery, [playerId, newLeagueId, seasonId], (err, result) => {
          if (err) {
            console.error("Error inserting into players_season:", err);
            res.status(500).json({ error: "Error inserting into players_season" });
            return;
          }
          
          console.log("Player successfully registered for the league and season");
          res.status(200).json({ message: "Player registered successfully!" });
        });
      } else {
        console.error("No league found for the adjusted tier");
        res.status(500).json({ error: "No league found for the adjusted tier" });
      }
    });
  });
}

app.get("/getTiedPlayers",verifyToken("admin"), (req, res) => {
let season=req.headers.season
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
        ps.season_id = ?  -- Replace with your season filter
    ORDER BY 
        ps.league_id ASC , s1.position ASC;
  `;

  // Execute the query
  connection.query(query,[season], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database query error' });
      return;
    }

    // Send the results back to the client as JSON
    res.status(200).json(results);
  });
});
  

