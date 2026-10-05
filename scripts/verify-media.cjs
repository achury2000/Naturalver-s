// Quick verification script
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'naturalvers';

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) { console.error('ERROR connecting:', err.message); process.exit(1); }
  const db = client.db(dbName);
  db.collection('media').countDocuments({}, (err, count) => {
    console.log('Total media docs in naturalvers DB:', count);
    db.collection('media').find({}, { filename: 1 }).limit(6).toArray((err2, docs) => {
      console.log('--- Media documents ---');
      docs.forEach((m, i) => {
        console.log(`${i+1}. filename: "${m.filename}"`);
      });
      if (count === 0) {
        console.log('NO HAY DOCS de media en la BD naturalvers');
      } else {
        const expected = ['aceite-coco.jpg', 'crema-facial.jpg', 'espirulina.jpg', 'multivitaminico.jpg', 'shampoo-natural.jpg', 'te-verde.jpg'];
        const allMatch = expected.every(f => docs.some(m => m.filename === f));
        console.log('Todas coinciden:', allMatch);
      }
      client.close();
      process.exit(0);
    });
  });
});