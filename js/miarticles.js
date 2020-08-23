var tagsData = {};
var currentShowArticleId = '';
var miarticlesTotal = new Array();
var miarticlesDetails = {};
var cdnPrefix = 'https://cdn.jsdelivr.net/gh/mihirukiss/miarticles@';
document.addEventListener('DOMContentLoaded', function() {
    let totalDataLoadedCount = 0;
    for (let index = 0; index < totalDataArray.length; index++) {
        const totalDataUrl = totalDataArray[index];
        $.getJSON(cdnPrefix + totalDataUrl, function(data){
            Array.prototype.push.apply(miarticlesTotal, data);
            totalDataLoadedCount++;
            if(totalDataLoadedCount == totalDataArray.length){
                initPage();
            }
        });
    }
});

function initPage(){
    for (let i = miarticlesTotal.length-1; i >= 0; i--) {
        const article = miarticlesTotal[i];
        const articleDiv = document.createElement('div');
        articleDiv.className = 'col-auto mb-3';
        const articleCard = document.createElement('div');
        articleCard.className = 'article shadow card';
        articleCard.setAttribute('data-id', article.id);
        articleCard.setAttribute('data-index', i);
        const articleBody = document.createElement('div');
        articleBody.className = 'article-content card-body';
        const title = document.createElement('h5');
        title.className = 'card-title';
        title.innerText = article.title;
        articleBody.append(title);
        const subtitle = document.createElement('h6');
        subtitle.className = 'card-subtitle mb-2 text-muted';
        subtitle.innerText = article.author + ' ' + article.publishTime;
        articleBody.append(subtitle);
        const text = document.createElement('p');
        text.className = 'card-text';
        text.innerText = article.content;
        articleBody.append(text);
        articleCard.append(articleBody);
        const tagDiv = document.createElement('div');
        tagDiv.className = 'card-footer text-muted';
        let tagText = '';
        for (let j = 0; j < article.tags.length; j++) {
            const tag = article.tags[j];
            if (j > 0) {
                tagText = tagText + ', ';
            }
            tagText = tagText + tag;
            if (!tagsData[tag]){
                tagsData[tag] = [articleDiv];
            } else {
                tagsData[tag].push(articleDiv);
            }
        }
        tagDiv.innerText = tagText;
        articleCard.append(tagDiv);
        articleCard.addEventListener('click', showArticleDetail);
        articleDiv.tagCount = article.tags.length;
        articleDiv.append(articleCard);
        document.getElementById('article-list').append(articleDiv);
    }
    let tagIndex = 0;
    for (const tag in tagsData) {
        if (tagsData.hasOwnProperty(tag)) {
            const tagToggle = document.createElement('input');
            tagToggle.type = 'checkbox';
            tagToggle.checked = true;
            tagToggle.id = 'tag'+tagIndex;
            tagIndex++;
            tagToggle.setAttribute('data-toggle', 'toggle');
            tagToggle.setAttribute('data-onstyle', 'dark');
            tagToggle.setAttribute('data-on', tag);
            tagToggle.setAttribute('data-off', tag);
            $(tagToggle).change(toggleTag);
            document.getElementById('tag-list').append(tagToggle);
            $(tagToggle).bootstrapToggle();
        }
    }
}

function toggleTag(event) {
    const tag = event.currentTarget.getAttribute('data-on');
    const changeNum = event.currentTarget.checked?1:-1;
    for (let index = 0; index < tagsData[tag].length; index++) {
        const articleDiv = tagsData[tag][index];
        articleDiv.tagCount += changeNum;
        if (articleDiv.tagCount < 1){
            articleDiv.style.display = 'none';
        } else {
            articleDiv.removeAttribute('style');
        }
    }
}

function showArticleDetail(event){
    const id = event.currentTarget.getAttribute('data-id');
    const index = event.currentTarget.getAttribute('data-index');
    const article = miarticlesTotal[index];
    currentShowArticleId = id;
    document.getElementById('article-detail-title-label').innerText = article.title;
    if (miarticlesDetails[id]) {
        document.getElementById('article-detail-body').innerHTML = miarticlesDetails[id].contentHtml;
    } else {
        document.getElementById('article-detail-body').innerHTML = 'Loading...';
        $.getJSON(cdnPrefix+article.version+'/js/miarticles.data.'+id+'.json', function(data){
            miarticlesDetails[id] = data;
            if (currentShowArticleId == id) {
                document.getElementById('article-detail-body').innerHTML = data.contentHtml;
            }
        });
    }
    $('#article-detail').modal('show');
}