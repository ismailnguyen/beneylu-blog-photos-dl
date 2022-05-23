const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/handle', (req, res) => {
    var photos = JSON.parse(req.body.photos);
    var folderName = req.body.folderName;
    const fs = require('fs');
    const imageDownloader = require("image-downloader");

    for (const photo of photos) {
        var dir = 'out/' + folderName + '/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        imageDownloader
        .image({
            url: photo.src,
            dest: __dirname + '/' + dir + photo.title,
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

app.listen(3000,() => {
    console.log("Started on PORT 3000");
})