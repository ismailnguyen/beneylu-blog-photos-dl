# Beneylu School photo downloader
This tool will download all photos from a blog post within Beneylu School web app.

This project contains a Google Chrome extension with a "Download" button to download photos from a specific page, and a web server to download and move photos into a specified folder.

## Setup

#### Server
Inside the project folder open a terminal and run:
```bash
npm install
```

#### Chrome extension
- Open Google Chrome web browser
- In Settings, open `Manage Extensions`
- Load unpacked
- Open the project folder and choose `chrome-extension` folder

## Usage

### Start the server
```
node index.js
```
The server should start in `localhost:3000`

### Photos download
- Open a blog post from Beneylu School
- In Google Chrome extension bar, click in the Beneylu Photo scrapper's icon (same icon as Beneylu school)
- Configure `Server base URL` with the URL of the previously started server, e.g. `http://localhost:3000` (do not forget the `http` protocol)
- Configure the `Base folder` path (where all photos will be uploaded)
- Configure the `Current folder` path (where photos from the current page will be)
`Current folder` is a subfolder of `Base folder`
- Click on `Download` button
- Check if photos are correctly downloaded inside of `Base folder + Current folder` path