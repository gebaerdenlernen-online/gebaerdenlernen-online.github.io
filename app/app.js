// Init localStorage to save configurations and settings
var dict = localStorage.getItem("dict");
var meta = localStorage.getItem("meta");
var settings = localStorage.getItem("settings");
var user_data = localStorage.getItem("user_data");

if(dict === null){
    xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           dict = JSON.parse(xhr1.responseText);
           localStorage.setItem("dict", xhr1.responseText);
        }
    };
    xhr1.open("GET", "/app/data/dict.json", true);
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
           localStorage.setItem("meta", xhr2.responseText);
        }
    };
    xhr2.open("GET", "/app/data/meta.json", true);
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
           localStorage.setItem("settings", xhr3.responseText);
        }
    };
    xhr3.open("GET", "/app/data/settings.json", true);
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
           localStorage.setItem("user_data", xhr4.responseText);
        }
    };
    xhr4.open("GET", "/app/data/user_data.json", true);
    xhr4.send();
} else {
    user_data = JSON.parse(user_data);
}