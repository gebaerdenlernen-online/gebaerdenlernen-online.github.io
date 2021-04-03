// Init localStorage to save configurations and settings
var dict = localStorage.getItem('dict');
var meta = localStorage.getItem('meta');
var settings = localStorage.getItem('settings');
var user_data = localStorage.getItem('user_data');

if(dict === null){
    xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           dict = JSON.parse(xhr1.responseText);
           localStorage.setItem('dict', xhr1.responseText);
        }
    };
    xhr1.open('GET', '/app/data/dict.json', true);
    xhr1.send();
} else {
    dict = JSON.parse(dict);
}

if(meta === null){
    xhr2 = new XMLHttpRequest();
    xhr2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           meta = JSON.parse(xhr2.responseText);
           localStorage.setItem('meta', xhr2.responseText);
        }
    };
    xhr2.open('GET', '/app/data/meta.json', true);
    xhr2.send();
} else {
    meta = JSON.parse(meta);
}

if(settings === null){
    xhr3 = new XMLHttpRequest();
    xhr3.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           settings = JSON.parse(xhr3.responseText);
           localStorage.setItem('settings', xhr3.responseText);
        }
    };
    xhr3.open('GET', '/app/data/settings.json', true);
    xhr3.send();
} else {
    settings = JSON.parse(settings);
}

if(user_data === null){
    xhr4 = new XMLHttpRequest();
    xhr4.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           user_data = JSON.parse(xhr4.responseText);
           localStorage.setItem('user_data', xhr4.responseText);
        }
    };
    xhr4.open('GET', '/app/data/user_data.json', true);
    xhr4.send();
} else {
    user_data = JSON.parse(user_data);
}

document.getElementById('sign_count').innerText = dict.dict.length;
document.getElementById('search').addEventListener("click", function(data){
    word = document.getElementById("search_input").value
    showSearchResult("search_result", word)
});

// Define useful functions:

function searchInDict(word){
    for(var i = 0; i<dict.dict.length; i++){
        if(dict.dict[i].word.de === word){
            return dict.dict[i]
        }
        if(dict.dict[i].word.en === word){
            return dict.dict[i]
        }
    }
}

function searchResultHTML(obj){
    console.log("Obj:",obj)
    html = `<div class="card text-center">
    <div class="card-header">
        `+obj.word.de+`
    </div>
    <div class="card-img-top embed-responsive embed-responsive-4by3">
        <video class="embed-responsive-item" autoplay muted loop>
            <source src="`+obj.video.dgs[0].url+`" type="video/mp4">
            Your browser does not support the video tag.
        </video> 
    </div>
    </div>`;
    return html;
}

function showSearchResult(id,word){
    element = document.getElementById(id);
    obj = searchInDict(word)
    html = searchResultHTML(obj)
    element.innerHTML = html
}