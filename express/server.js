const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 80;

const flags = '/app/flags/';
const tmp = '/tmp/';
const total = 20;
const change = 2;

app.get('/assets', (req, res) => {
  fs.readdir(flags, function (err, files) {
    if (err) {
      res.status(400).json({
        'failed': 'sorry',
        'message': err
      });
      return console.log('Unable to scan directory: ' + err);
    }

    let complete = [];
    files.forEach(file => {
      if (file.endsWith('.png')) {
        const stats = fs.statSync(flags + file);
        complete.push({
          'asset': '/flags/' + file,
          'thumb': '/flags/' + file.replace('.png', '_thumb.jpg'),
          'exists': fs.existsSync(tmp + file),
          stats: stats
        });
      }
    });

    let existing = complete.filter(file => file.exists);
    let nonExisting = complete.filter(file => !file.exists);
    let shuffledExisting = existing
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    let shuffledNonExisting = nonExisting
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    let leftToChange = change;
    while (shuffledExisting.length > 0 && leftToChange-- > 0) {
      fs.unlinkSync(tmp + shuffledExisting[0].asset.replace('/flags/', ''));
      shuffledExisting.splice(0, 1);
    }
    let index = 0;
    while (shuffledExisting.length < total) {
      let file = shuffledNonExisting[index++];
      fs.writeFileSync(
        tmp + file.asset.replace('/flags/', ''),
        fs.readFileSync(flags + file.asset.replace('/flags/', ''))
      );
      shuffledExisting.push(file);
    }

    res.status(200).json(shuffledExisting.map(({exists, ...keep}) => keep));
  });
});

app.get('/', (req, res, next) => {
  res.status(200).json({
    'status': 'ok'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/flags', express.static(flags))

const server = app.listen(port, () => {
  const port = server.address().port;
  console.log(`app now running on port ${port}`);
});
