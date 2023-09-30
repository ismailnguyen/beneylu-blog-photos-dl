const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/handle', (req, res) => {
    console.log('body', req.body)
    const body = req.body;
    if (!body || !body.photos || !body.folderName) {
        res.status(400).end('Bad request');
        return;
    }

    var photos = req.body.photos;
    var folderName = req.body.folderName;
    const fs = require('fs');
    const imageDownloader = require("image-downloader");

    for (const photo of photos) {
        var dir = (folderName.startsWith('/') ? '' : __dirname + '/out/') + folderName + '/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        imageDownloader
        .image({
            url: photo.src,
            dest:  dir + photo.title,
        })
        .then(({ filename }) => {
            console.log("file saved" + filename);

            if(photo.index == photos.length - 1) {
                res.end('Download finished');
            }
        })
        .catch((err) => console.error(err, photo.src, photo.title));
    }
});

app.get('/exit', (res) => {
    process.exit(0)
});

app.listen(3000,() => {
    console.log("Started on PORT 3000");
})