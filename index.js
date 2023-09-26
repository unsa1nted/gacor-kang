const fs = require('fs');
const path = require('path');

const directoryPath = 'YOUR_REAL_PATH_HERE';
const scannedFiles = new Set();

function readListFile() {
  const listFilePath = path.join(directoryPath, 'list.txt');
  try {
    const data = fs.readFileSync(listFilePath, 'utf8');
    const words = data.split('\n').map((word) => word.trim());
    return words;
  } catch (err) {
    console.error('Error reading list.txt file:', err);
    return [];
  }
}

function scanDirectory(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error retrieving file stats:', err);
          return;
        }

        if (stats.isDirectory()) {
          scanDirectory(filePath);
        } else if (stats.isFile()) {
          const fileExtension = path.extname(filePath);
          if (
            ['.html', '.php', '.js'].includes(fileExtension) &&
            !scannedFiles.has(filePath)
          ) {
            fs.readFile(filePath, 'utf8', (err, data) => {
              if (err) {
                console.error('Error reading file:', err);
                return;
              }

              const words = readListFile();
              const containsDesiredText = words.some((word) =>
                data.includes(word)
              );

              if (containsDesiredText) {
                console.log(`[WARNING DETECTED] ${filePath} contains one of the desired words. Please check it!`);
              }

              scannedFiles.add(filePath)
            });
          }
        }
      });
    });
  });
}

function startScanning() {
  const welcomeMessage = `
  _____                      _                     
 |  __ \\                    | |                    
 | |  \\/ __ _  ___ ___  _ __| | ____ _ _ __   __ _ 
 | | __ / _\` |/ __/ _ \\| '__| |/ / _\` | '_ \\ / _\` |
 | |_\\ \\ (_| | (_| (_) | |  |   < (_| | | | | (_| |
  \\____/\\__,_|\\___\\___/|_|  |_|\\_\\__,_|_| |_|\\__, |
                                              __/ |
                                             |___/ 

  Detect unwanted pages that contain gambling.
 `;

  console.log(welcomeMessage);

  setTimeout(() => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Would you like to check every time? Please choose (enter a number or "no" to scan once): ', (answer) => {
      rl.close();

      if (answer === 'N') {
        // Scan the directory once
        scanDirectory(directoryPath);
      } else if (answer === 'Y') {
        // Scan the directory multiple times with a delay
        const numTimes = parseInt(answer);
        let count = 0;

        const intervalId = setInterval(() => {
          count++;
          console.log(`Scanning ${count}/${numTimes}`);

          scanDirectory(directoryPath);

          if (count === numTimes) {
            clearInterval(intervalId);
          }
        }, 60 * 1000);
      } else {
        console.log('Invalid input. Scanning once...');
        scanDirectory(directoryPath);
      }
    });
  }, 5000); 
}

startScanning();
