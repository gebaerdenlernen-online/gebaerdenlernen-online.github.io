// Extract Videos from the dictoanry on https://gebaerdenlernen.de/
// paste the script in the web developer console on the page to extract the json data.
var obj = [];

var tables = document.getElementsByTagName("table");
for(var i = 0; i<tables.length; i++){
    console.log("Tables:",i,tables[i])
    if(i == 9){
        continue;
    }
    var rows = tables[i].children[1].children;
    for(var j = 0; j < rows.length; j++){
        var text = rows[j].innerText;
        var url = "https://gebaerdenlernen.de/"+rows[j].innerHTML.match("vid/.*?\.mp4")[0];
        var date = (new Date).toLocaleDateString("de");
        obj.push(
            {
                word:{
                    de: text,
                    en: ""
                },
                video:{
                    dgs: [
                        {
                            source: "https://gebaerdenlernen.de/",
                            url: url,
                            created: date,
                        }
                    ],
                    asl: [
                
                    ]
                },
                category:[]
            }
        );
    }
}
console.log(obj);

// Extract Dict and Categories from HTMl Download Dict (https://gebaerdenlernen.de/files/dgs_woerterbuch_gesamt.zip)
// document.getElementsByTagName("table")[0].children[i].children[1].children[0].innerText
// "1"
// document.getElementsByTagName("table")[0].children[i].children[0].children[1].innerText
// "Straßenverkehr"
// document.getElementsByTagName("table")[0].children[i].children[1].children[0].children[0].href.replace("file:///home/ackbar/Downloads/video","vid")

var obj = [];

var tables = document.getElementsByTagName("table");
for(var i = 0; i<tables.length; i++){
    console.log("Tables:",i,tables[i])
    var rows = tables[i].children[0].children;
    for(var j = 0; j < rows.length; j++){
        //console.log(rows[j]);
        var text = rows[j].children[0].innerText;
        //console.log(text);
        var url = "https://gebaerdenlernen.de/"+rows[j].children[0].children[0].href.replace("file:///home/ackbar/Downloads/video","vid");
        //console.log(url);
        var date = (new Date).toLocaleDateString("de");
        var cat = rows[j].children[1].innerText
        //console.log(cat);
        obj.push(
            {
                word:{
                    de: text,
                },
                video:{
                    dgs: [
                        {
                            source: "https://gebaerdenlernen.de/",
                            url: url,
                            created: date,
                            license:{
                                name: "CC BY-NC-SA 3.0 DE",
                                url: "https://creativecommons.org/licenses/by-nc-sa/3.0/de/"
                            }
                        }
                    ]
                },
                category:[cat]
            }
        );
    }
}
console.log(obj);