const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const filePath = path.join(__dirname, 'scores.json');
  let scores = [];

  // JSON dosyasını oku veya boş dizi oluştur
  if (fs.existsSync(filePath)) {
    try { scores = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
    catch { scores = []; }
  }

  const data = JSON.parse(event.body);
  const name = data.name || 'Anonim';
  const score = parseInt(data.score, 10) || 0;

  scores.push({ name, score, date: new Date().toISOString() });
  scores.sort((a,b)=>b.score - a.score);

  fs.writeFileSync(filePath, JSON.stringify(scores, null, 2));

  return { statusCode: 200, body: JSON.stringify({ status: 'success' }) };
};
