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