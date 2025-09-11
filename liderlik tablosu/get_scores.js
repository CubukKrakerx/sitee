const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  const filePath = path.join(__dirname, 'scores.json');
  let scores = [];
  if (fs.existsSync(filePath)) {
    try { scores = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
    catch { scores = []; }
  }
  return { statusCode: 200, body: JSON.stringify(scores) };
};
