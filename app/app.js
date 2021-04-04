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
    result = [];
    for(var i = 0; i<dict.dict.length; i++){
        if(dict.dict[i].word.de.toLowerCase() === word.toLowerCase()){
            result.push(dict.dict[i])
            continue
        }
        // if(dict.dict[i].word.en.toLowerCase() === word.toLowerCase()){
        //     result.push(dict.dict[i])
        //     continue
        // }
        if(dict.dict[i].word.de.toLowerCase().match(".*?"+word.toLowerCase()+".*?") !== null){
            result.push(dict.dict[i])
        }
        // if(dict.dict[i].word.en.toLowerCase().match(".*?"+word.toLowerCase()+".*?") !== null){
        //     result.push(dict.dict[i].word.en)
        // }
    }
    return result;
}

function searchResultHTML(word, obj){
    console.log("Obj:",obj)
    html = "<p>Suche nach \""+encodeHTMLEntities(word)+"\".</p><hr>"
    tmp = html;
    
    for(var i = 0; i<obj.length; i++){
        if(i==10){
            html += "<p> 10 von "+obj.length+" Ergebnissen angezeigt, bitte genauer suchen."
            break;
        }
        html += `<div class="card text-center">
        <div class="card-header">
            <h4>`+encodeHTMLEntities(obj[i].word.de)+`</h4>
        </div>
        <div class="card-img-top embed-responsive embed-responsive-4by3">
            <video class="embed-responsive-item" autoplay muted loop>
                <source src="`+encodeURI(obj[i].video.dgs[0].url)+`" type="video/mp4">
                Your browser does not support the video tag.
            </video> 
        </div>
        </div>
        <br>`;
    }
    if(html === tmp){
        html += "<p>Kein Ergebnis gefunden.</p>"
    }
    return html;
}

function showSearchResult(id,word){
    element = document.getElementById(id);
    obj = searchInDict(word)
    html = searchResultHTML(word,obj)
    element.innerHTML = html
}

function encodeHTMLEntities(string){
    console.log("String:", string)
    if(string !== undefined){
        return string.replace(/./gm, function(s) {
            // return "&#" + s.charCodeAt(0) + ";";
            return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";";
        })
    }
    return "undefined";
}