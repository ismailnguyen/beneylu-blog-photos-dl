function save() {
	let config = {
        serverBaseUrl: $('#server-base-url-input').val(),
        baseFolder: $('#base-folder-input').val(),
        folderName: $('#folder-name-input').val(),
        subFolderName: $('#subfolder-name-input').val()
    }
	
    if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ beneylu_photo_scrapper_config: config });
    }
}

async function findTitle(tabId) {
    const [{result}] = await chrome.scripting.executeScript({
      func: () => {
        var title = '';
        // Get all images inside of "article" class div
        if (window.document.querySelectorAll('.first-article-title')) {
            title = window.document.querySelectorAll('.first-article-title')[0].innerHTML;
        }

        if (title.indexOf('-') > 0) {
            let splittedTitle = title.split(' - ');
            // remove the first part before '-' (e.g. Semaine du )
            splittedTitle = splittedTitle.splice(1, splittedTitle.length);
            title = splittedTitle.join(' - ');
        }
        
        return title;
    },
      target: {
        tabId: tabId ??
          (await chrome.tabs.query({active: true, currentWindow: true}))[0].id
      },
      world: 'MAIN',
    });
    return result;
}

async function getPhotos(name, tabId) {
    const [{result}] = await chrome.scripting.executeScript({
      func: (folderName) => {
        var photos = [];
        // Get all images inside of "article" class div
        var imgs = window.document.querySelectorAll('.article img');
    
        if (!imgs.length) {
            return photos;
        }
    
        // By default use the folder name as photo's title
        var defautPhotoTitleBase = folderName;
        
        // If title is a set of folders, take the last one as the title for file
        if (defautPhotoTitleBase.indexOf('/') > -1) {
            var splittedTitle = defautPhotoTitleBase.split('/');
            defautPhotoTitleBase = splittedTitle[splittedTitle.length - 1];
        }
    
        var defautPhotoTitle = defautPhotoTitleBase.replace(/[/\\?%*:|"<>]/g, '-').replace(/(\r\n|\n|\r)/gm, "");
    
        for (var i=0; i < imgs.length; i++) {
            var title = defautPhotoTitle;
            var currentImg = imgs[i];
    
            if (currentImg && currentImg.localName == 'img') {
                // But if there is a subtitle stored into list element, use it instead for photo's title
                if ($('.article ul').length) {
                    // Oftenly the previous parent element from the image's node contains the subtitle
                    var previousParentSibling = currentImg.parentNode.previousSibling;
    
                    // If previous node is not the subtitle, use the previous of the previous until we find the subtitle's node
                    while (previousParentSibling && previousParentSibling.nodeType != 1) {
                        previousParentSibling = previousParentSibling.previousSibling;
                    }
    
                    var subtitle = previousParentSibling
                        ? previousParentSibling.outerText.replace(/[/\\?%*:|"<>]/g, '-').replace(/(\r\n|\n|\r)/gm, '').trim()
                        : '';
    
                    // If a subtitle is found, use it as photo's title
                    if (subtitle) {
                        title = subtitle;
                    }
                }
    
                photos.push({
                    index: photos.length,
                    title: title + ' - ' + (i+1) + '.jpg',
                    src: currentImg.src
                });
            }
        }
    
        return photos;
    },
      args: [name],
      target: {
        tabId: tabId ??
          (await chrome.tabs.query({active: true, currentWindow: true}))[0].id
      },
      world: 'MAIN',
    });
    return result;
}

$(document).ready(function () {
    // When popup opens
    // retrieve already used folder paths from config and fill inputs with config value
    if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['beneylu_photo_scrapper_config'], async function(result) {
            var config = result.beneylu_photo_scrapper_config
            if (config) {
                $('#server-base-url-input').val(config.serverBaseUrl),
                $('#base-folder-input').val(config.baseFolder)
                $('#folder-name-input').val(config.folderName)

                // try to find title based on article title
                let title = await findTitle();

                // title detetction failed, fallback to latest saved title
                if (!title) {
                    title = config.subFolderName;
                }

                $('#subfolder-name-input').val(title)
            }
        })
    }

    $('#download-btn').click(async function() {
        // Send a background message to "main.js" to ask to scrap page content and send it to server
        // using given base and current folder paths
        const serverBaseUrl = $('#server-base-url-input').val();
        const folderName = $('#base-folder-input').val()
                            + $('#folder-name-input').val()
                            + '/'
                            // Concat top folder name in the sub folder's name
                            + $('#folder-name-input').val() + ' - ' + $('#subfolder-name-input').val();
        const photos = await getPhotos(folderName);

        chrome.runtime.sendMessage({ 
            type: 'download',
            serverBaseUrl: serverBaseUrl,
            folderName: folderName,
            photos: photos
        },
        (response) => {
            console.log(response);

            // at each time "Download" button is clicked, save the current config for next time use
            save();

            // Little animation to show button reaction
            $(this).addClass('fadeOutUp')
            $(this).text('Downloaded!')
            $(this).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                function (e) {
                    $(this).removeClass('fadeOutUp');
                    $(this).text('Download');
                }
            )
        })
    })
})
