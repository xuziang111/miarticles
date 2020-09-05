var tagsData = {};
var tagsCheckbox = {};
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
                $('#copy-link').tooltip();
                const clipboard = new ClipboardJS('.copy-link', {
                    text: function(trigger){
                        return 'https://mihiru.com/miarticles/?id='+currentShowArticleId;
                    },
                    container: document.getElementById('article-detail')
                });
                clipboard.on('success', function(e){
                    $('.tooltip-inner').text('链接已复制');
                });
                clipboard.on('error', function(e){
                    $('.tooltip-inner').text('复制链接失败');
                });
                miarticlesTotal.reverse();
                initPage(document.getElementById('sort-mode-checkbox').checked?'publishTime':'addTime', true);
            }
        });
    }
});

function changeSortMode(){
    reInitPage(document.getElementById('sort-mode-checkbox').checked?'publishTime':'addTime');
}

function reInitPage(sortField){
    $('#article-list').empty();
    tagsData = {};
    initPage(sortField, false);
}

function initPage(sortField, initTag){
    miarticlesTotal.sort(function(a, b){
        if (a[sortField] > b[sortField]){
            return -1;
        } else if(a[sortField] < b[sortField]){
            return 1;
        } else {
            return 0;
        }
    });
    for (let i = 0; i < miarticlesTotal.length; i++) {
        const article = miarticlesTotal[i];
        const articleDiv = document.createElement('div');
        articleDiv.className = 'article-div col-auto mb-3';
        articleDiv.id = 'articleDiv_' + article.id;
        articleDiv.ratting = article.ratting;
        const articleCard = document.createElement('a');
        articleCard.href = '?id=' + article.id;
        articleCard.id = 'article_' + article.id;
        articleCard.className = 'article shadow card' + (article.ratting=='e'?' border-danger':(article.ratting=='q'?' border-warning':''));
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
        const authorSpan = document.createElement('span');
        authorSpan.innerText = article.author;
        authorSpan.className = 'author-span';
        authorSpan.title = '点击仅展示该作者文章';
        authorSpan.addEventListener('click', filterAuthor);
        subtitle.append(authorSpan);
        const timeSpan = document.createElement('span');
        timeSpan.innerText = article[sortField];
        subtitle.append(timeSpan);
        articleBody.append(subtitle);
        const text = document.createElement('p');
        text.className = 'card-text';
        text.innerText = article.content;
        articleBody.append(text);
        articleCard.append(articleBody);
        const tagDiv = document.createElement('div');
        tagDiv.className = 'card-footer ' + (article.ratting=='e'?'bg-danger text-white':(article.ratting=='q'?'bg-warning text-white':'text-muted'));
        let tagText = '';
        for (let j = 0; j < article.tags.length; j++) {
            const tag = article.tags[j];
            if (j > 0) {
                tagText = tagText + ', ';
            }
            tagText = tagText + tag;
            if (!tagsData[tag]){
                tagsData[tag] = {
                    "ratting": article.ratting,
                    "divs": [articleDiv]
                };
            } else {
                tagsData[tag].divs.push(articleDiv);
                if (article.ratting == 's'){
                    tagsData[tag].ratting = 's';
                } else if (article.ratting == 'q' && tagsData[tag].ratting == 'e') {
                    tagsData[tag].ratting = 'q';
                }
            }
        }
        tagDiv.innerText = tagText;
        articleCard.append(tagDiv);
        articleCard.addEventListener('click', clickArticleCard);
        articleDiv.append(articleCard);
        document.getElementById('article-list').append(articleDiv);
    }
    if(initTag){
        const tags = Object.keys(tagsData);
        tags.sort(function(a, b){
            const aIsLetterStart = isLetterStart(a);
            const bIsLetterStart = isLetterStart(b);
            if(aIsLetterStart && !bIsLetterStart){
                return -1;
            } else if(!aIsLetterStart && bIsLetterStart){
                return 1;
            }
            return a.localeCompare(b,"zh");
        });
        for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
            const tag = tags[tagIndex];
            if (tagsData.hasOwnProperty(tag)) {
                const tagToggle = document.createElement('input');
                tagToggle.type = 'checkbox';
                tagToggle.checked = true;
                tagToggle.className = 'liver-tag-' + tagsData[tag].ratting;
                tagToggle.id = 'tag'+tagIndex;
                tagToggle.setAttribute('data-toggle', 'toggle');
                tagToggle.setAttribute('data-onstyle', 'dark');
                tagToggle.setAttribute('data-on', tag);
                tagToggle.setAttribute('data-off', tag);
                $(tagToggle).change(changeFilter);
                document.getElementById('tag-list').append(tagToggle);
                $(tagToggle).bootstrapToggle();
                tagsCheckbox[tag] = tagToggle;
            }
        }
        if(window.location.search){
            const param = /[\?\&]id=(\d+)/.exec(window.location.search);
            if(param.length > 1){
                showArticleDetail(param[1]);
            }
        }
    }
    changeFilter();
}

function isLetterStart(str){
    return (str[0]>='a' && str[0]<='z') || (str[0]>='A' && str[0]<='Z');
}

function filterAuthor(event) {
    event.preventDefault();
    event.stopPropagation();
    $('.tag-list').hide();
    $('.control-btns').hide();
    $('.article-div').css('display', 'none');
    const author = event.currentTarget.innerText;
    const ratting = parseInt($("input[name='ratting']:checked").val());
    for (let i = 0; i < miarticlesTotal.length; i++) {
        if (miarticlesTotal[i].author == author && (ratting>1 || miarticlesTotal[i].ratting=='s' || (ratting>0 && miarticlesTotal[i].ratting=='q'))){
            $('#articleDiv_' + miarticlesTotal[i].id).show();
        }
    }
    document.getElementById('current-author').innerText = author;
    $('#author-filter-info').show();
}

function changeToTagFilter(){
    $('#author-filter-info').hide();
    $('.tag-list').show();
    $('.control-btns').show();
    changeFilter();
}

function allTagChange() {
    const swtichToOn = document.getElementById('all-tag-checkbox').checked;
    for (const tag in tagsCheckbox) {
        if (tagsCheckbox.hasOwnProperty(tag)) {
            if(swtichToOn){
                $(tagsCheckbox[tag]).bootstrapToggle('on', true);
            } else {
                $(tagsCheckbox[tag]).bootstrapToggle('off', true);
            }
        }
    }
    changeFilter();
}

function changeFilter() {
    const mode = document.getElementById('tag-mode-checkbox').checked;
    $(".ratting-label").removeClass('btn-secondary').each(function(){
        const checkedClass = this.getAttribute('checked-class');
        if(this.getElementsByTagName('input')[0].checked){
            $(this).removeClass(checkedClass).addClass(checkedClass);
        } else {
            $(this).removeClass(checkedClass).addClass('btn-secondary');
        }
    });
    const ratting = parseInt($("input[name='ratting']:checked").val());
    if (ratting < 1){
        $('.liver-tag-q').parent().hide();
        $('.liver-tag-e').parent().hide();
    } else if (ratting < 2){
        $('.liver-tag-q').parent().show();
        $('.liver-tag-e').parent().hide();
    } else {
        $('.liver-tag-q').parent().show();
        $('.liver-tag-e').parent().show();
    }
    $('.article-div').css('display', 'none');
    if(mode) {
        for (const tag in tagsData) {
            if (tagsData.hasOwnProperty(tag) && tagsCheckbox[tag].checked) {
                for (let index = 0; index < tagsData[tag].divs.length; index++) {
                    if(ratting>1 || tagsData[tag].divs[index].ratting=='s' || (ratting>0 && tagsData[tag].divs[index].ratting=='q')){
                        tagsData[tag].divs[index].removeAttribute('style');
                    }
                }
            }
        }
    } else {
        let showDivs = new Array();
        let first = true;
        for (const tag in tagsCheckbox) {
            if (tagsCheckbox.hasOwnProperty(tag) && tagsCheckbox[tag].checked) {
                if (first) {
                    Array.prototype.push.apply(showDivs , tagsData[tag].divs);
                    first = false;
                } else {
                    for (let index = 0; index < showDivs.length; index++) {
                        const showDiv = showDivs[index];
                        if(tagsData[tag].divs.indexOf(showDiv) < 0){
                            showDivs.splice(index, 1);
                            index--;
                        }
                    }
                }
                if(showDivs.length < 1){
                    break;
                }
            }
        }
        for (let index = 0; index < showDivs.length; index++) {
            if(ratting>1 || showDivs[index].ratting=='s' || (ratting>0 && showDivs[index].ratting=='q')){
                showDivs[index].removeAttribute('style');
            }
        }
    }
}

function clickArticleCard(event){
    event.preventDefault();
    const id = event.currentTarget.getAttribute('data-id');
    showArticleDetail(id);
}

function showArticleDetail(id){
    const index = document.getElementById('article_'+id).getAttribute('data-index');
    const article = miarticlesTotal[index];
    currentShowArticleId = id;
    document.getElementById('article-detail-title-label').innerText = article.title;
    if (miarticlesDetails[id]) {
        document.getElementById('article-detail-body').innerHTML = miarticlesDetails[id].contentHtml;
        buildUtterancesScript(id);
    } else {
        document.getElementById('article-detail-body').innerHTML = 'Loading...';
        $.getJSON(cdnPrefix+article.version+'/js/miarticles.data.'+id+'.json', function(data){
            miarticlesDetails[id] = data;
            if (currentShowArticleId == id) {
                document.getElementById('article-detail-body').innerHTML = data.contentHtml;
                buildUtterancesScript(id);
            }
        });
    }
    $('#article-detail').modal('show');
}

function buildUtterancesScript(id){
    if(supportComment){
        const scriptTag = document.createElement('script');
        scriptTag.src = "https://utteranc.es/client.js";
        scriptTag.crossOrigin = 'anonymous';
        scriptTag.async = true;
        scriptTag.setAttribute('repo', 'mihirukiss/miarticles');
        scriptTag.setAttribute('issue-term', 'comment_' + id);
        scriptTag.setAttribute('theme', 'preferred-color-scheme');
        scriptTag.setAttribute('label', 'comment');
        document.getElementById('article-detail-body').append(scriptTag);
    }
}