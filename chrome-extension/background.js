
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'download') {
        const { serverBaseUrl, folderName, photos } = message;

        console.log('scrapping started for:' + folderName)
        console.log('found ' + photos.length + ' images')

        fetch(
            serverBaseUrl + '/handle',
            {
                method: 'POST',
                headers:{          
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    photos: photos,
                    folderName: folderName,
                })
            }
        )
    }
    else if (message.type === 'exit') {
        const { serverBaseUrl } = message;

        fetch(serverBaseUrl + '/' + message.type)
    }

    sendResponse('photos sent to ' + serverBaseUrl + ' for download...')
});
