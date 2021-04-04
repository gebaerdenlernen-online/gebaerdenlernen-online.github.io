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

           init()
        }
    };
    xhr4.open('GET', '/app/data/user_data.json', true);
    xhr4.send();
} else {
    user_data = JSON.parse(user_data);
}

if(document.getElementById("sign_count") !== null){
    document.getElementById('sign_count').innerText = dict.dict.length;
}

if(document.getElementById('search') !== null){
    document.getElementById('search').addEventListener("click", function(data){
        word = document.getElementById("search_input").value
        showSearchResult("search_result", word)
    });
}

if(document.getElementById("btn-fach-1") !== null){
    document.getElementById("btn-fach-1").addEventListener("click", function(){
        vs = getPracticeSet(0);
        showPracticeHTML(vs,0)
    });
}


// Word search

function searchInDict(word){
    console.log("Search Word:",word)
    result = [];
    single_search = false;
    if(word.startsWith('"') && word.endsWith('"')){
        single_search = true
        word = word.replaceAll('"', '');
    }

    console.log("Single Search:",word)

    for(var i = 0; i<dict.dict.length; i++){
        if(single_search){
            if(dict.dict[i].word.de.toLowerCase() === word.toLowerCase()){
                result = dict.dict[i]
                break
            }
        } else {
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

// Learn new vocabulary

function addToData(obj, num){
    if(num >= 0 && num < 6){
        user_data.data[num].push(obj)
    }
}

function init(){
    if(user_data.data[0].length === 0){
        addToData(searchInDict('"Vogel"'),0);
        addToData(searchInDict('"Baum"'),0);
        addToData(searchInDict('"Hund"'),0);
        addToData(searchInDict('"Katze"'),0);
        addToData(searchInDict('"Lampe"'),0);
        addToData(searchInDict('"Papa"'),0);
        addToData(searchInDict('"Mama"'),0);
        addToData(searchInDict('"Oma"'),0);
        addToData(searchInDict('"Opa"'),0);
        addToData(searchInDict('"Ich"'),0);
        addToData(searchInDict('"Du"'),0);

        localStorage.setItem("user_data", JSON.stringify(user_data))
    }
}

function getPracticeSet(num){
    count = settings.number_of_words_per_session
    vocabulary_set = []

    for(var i = 0; i < count; i++){
        if(user_data.data[num] !== undefined){
            v = user_data.data[num].pop();
            console.log(i,v)
            vocabulary_set.push(v)
        }
    }

    return vocabulary_set;
}

function createPracticeHTML(vocabulary_set, i){
    html = `<div class="card text-center">
        <div class="card-header">
            <h4>ÜBEN</h4>
        </div>
        <div class="card-img-top embed-responsive embed-responsive-4by3">
            <video class="embed-responsive-item" autoplay muted loop>
                <source src="`+encodeURI(vocabulary_set[i].video.dgs[0].url)+`" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            
        </div>
        <!-- YouTube -->
        <!-- <div class="card-img-top embed-responsive embed-responsive-16by9">
            <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/zpOULjyy-n8?rel=0" allowfullscreen></iframe>
        </div> -->
        <div class="card-body">
        <button class="btn btn-info"  data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">Lösung anzeigen</button>
        <div class="collapse" id="collapseExample">
            <br>
            <h5 class="card-title" id="word">`+encodeHTMLEntities(vocabulary_set[i].word.de)+`</h5>
            <br>
            <div class="row">
                <div class="col">
                    <a href="#true" class="btn btn-outline-success"><i class="fas fa-check"></i></a>
                </div>
                <div class="col">
                    <a href="#false"class="btn btn-outline-danger"><i class="fas fa-times"></i></a>
                </div>
            </div>
        </div>
        </div>
        <div class="card-footer text-muted">
        `+(i+1)+`/`+vocabulary_set.length+`
        </div>
        </div>`;

    return html;
}

function showPracticeHTML(vs,num){
    if(document.getElementById("practice") !== null){
        document.getElementById("practice").innerHTML = createPracticeHTML(vs,num)
    }
}

// Useful functions

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }