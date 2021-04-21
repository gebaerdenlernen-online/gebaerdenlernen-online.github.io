// Init localStorage to save configurations and settings
var dict = localStorage.getItem('dict');
var meta = localStorage.getItem('meta');
var settings = localStorage.getItem('settings');
var user_data = localStorage.getItem('user_data');

if (dict === null) {
    xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            dict = JSON.parse(xhr1.responseText);

            // If the dict file is larger than 5MB this seems to have 
            // problems for Chrome/Firefox as the qouta is 10MB
            try{
                localStorage.setItem('dict', xhr1.responseText);
            } catch(exception){
                console.error("Error: localStorage.setItem Failed. (Expected for dict.json > 5MB. Quota 10MB.\n", exception);
            }
            
            if (document.getElementById("sign_count") !== null) {
                document.getElementById('sign_count').innerText = dict.dict.length;
            }
        }
    };

    xhr1.open('GET', '/app/data/dict-v2.json', true);
    //xhr1.open('GET', '/app/data/merge-dict.json', true);
    //xhr1.open('GET', '/app/data/dummy-dict.json', false);
    xhr1.send();
} else {
    dict = JSON.parse(dict);
}

if (meta === null) {
    xhr2 = new XMLHttpRequest();
    xhr2.onreadystatechange = function () {
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

if (settings === null) {
    xhr3 = new XMLHttpRequest();
    xhr3.onreadystatechange = function () {
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

if (user_data === null) {
    xhr4 = new XMLHttpRequest();
    xhr4.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            user_data = JSON.parse(xhr4.responseText);
            localStorage.setItem('user_data', xhr4.responseText);

            setExerciseToStack("Basics");
            showExerciseHTML()
            initPracticeStacks()
        }
    };
    xhr4.open('GET', '/app/data/user_data.json', true);
    xhr4.send();
} else {
    user_data = JSON.parse(user_data);
    if(user_data.data[0].length == 0){
        setExerciseToStack("Basics")
    }
    showExerciseHTML()
    initPracticeStacks()
}

// Only on the dict page
if (window.location.pathname == "/app/dict/") {
    // Show count of all words in dict
    if (document.getElementById("sign_count") !== null && dict !== null) {
        document.getElementById('sign_count').innerText = dict.dict.length;
    }

    // Setup search event for the dictonary
    if (document.getElementById('search') !== null) {
        document.getElementById('search').addEventListener("click", function (data) {
            word = document.getElementById("search_input").value
            window.location.hash = '#search=' + encodeURI(word);
            showSearchResult("search_result", word)
        });
    }

    // Enable URL Anchor #search=param to store the latest search and enable to share the query
    if (window.location.hash.match("#search=.*?")) {
        hash_query = window.location.hash.replace("#search=", "")
        showSearchResult("search_result", decodeURI(hash_query))
    }
}

// Setup practice mode can be removed if practicemode is integrated.
for (var k = 0; k < 6; k++) {
    if (document.getElementById("btn-stack-sign-" + k) !== null) {
        document.getElementById("btn-stack-sign-" + k).addEventListener("click", function () {
            var i = parseInt(this.id.replace("btn-stack-sign-", ""))
            vs = getPracticeSet(i);
            showPracticeHTML(vs, 0, true, i)
        });
    }
    if (document.getElementById("btn-stack-word-" + k) !== null) {
        document.getElementById("btn-stack-word-" + k).addEventListener("click", function () {
            var i = parseInt(this.id.replace("btn-stack-word-", ""))
            vs = getPracticeSet(i);
            showPracticeHTML(vs, 0, false, i)
        });
    }
}

if (window.location.pathname == "/app/dict/category/") {
    document.getElementById("categories").innerHTML = createCategoriesHTML();
    addEventListenerPerCategory();
}

////////////////////////////////////
//                                //
//   Dictonary Search Functions   //
//                                //
////////////////////////////////////

function searchInDictForCategory(cat) {
    result = []
    for (var i = 0; i < dict.dict.length; i++) {
        for (var j = 0; j < dict.dict[i].category.length; j++) {
            if (dict.dict[i].category[j].toLowerCase() === cat.toLowerCase()) {
                result.push(dict.dict[i])
                break;
            }
        }
    }
    return result
}

function searchInDict(word, isExactMatch) {
    console.log("Search Word:", word)
    result = [];

    if (dict == null) {
        console.error("Dictonary not loaded! Returned empty result.");
        return result
    }

    for (var i = 0; i < dict.dict.length; i++) {
        if (dict.dict[i].word.de.toLowerCase() === word.toLowerCase()) {
            result.push(dict.dict[i])
            break;
        }
    }
    if (!isExactMatch) {
        for (var i = 0; i < dict.dict.length; i++) {
            if (dict.dict[i].word.de.toLowerCase() === word.toLowerCase()) {
                continue;
            }
            if (dict.dict[i].word.de.toLowerCase().match(".*?" + word.toLowerCase() + ".*?") !== null) {
                result.push(dict.dict[i])
            }
        }
    }
    return result;
}

function searchResultHTML(word, obj) {
    console.log("Obj:", obj)
    html = "<p>Suche nach \"" + encodeHTMLEntities(word) + "\".</p><hr>"
    tmp = html;

    if (obj.length > 0) {
        categories = ""
        for (var k = 0; k < obj[0].category.length; k++) {
            categories += obj[0].category[k]
            if (k !== obj[0].category.length - 1) {
                categories += ", "
            }
        }

        html_videos=""
        for(var v=0; v<obj[0].video.dgs.length; v++){
            if(v==0){
                html_videos += `
                <div class="carousel-item active">
                    <div class="card-img-top embed-responsive embed-responsive-4by3">
                        <video class="embed-responsive-item" autoplay muted loop>
                            <source src="` + encodeURI(obj[0].video.dgs[v].url) + `" type="video/mp4">
                            Your browser does not support the video tag.
                        </video> 
                    </div>
                    <div class="card-body">
                        <div class=" text-left collapse mb-1 mt-1" id="info-` + 0+"-"+v + `">
                            <div class="row">
                                <div class="col">
                                    <b>Quelle:</b> ` + obj[0].video.dgs[v].source + `<br>
                                    <b>Letzter Zugriff:</b> ` + obj[0].video.dgs[v].created + `<br>
                                    <b>Kategorie:</b> ` + categories + `<br>
                                    <b>Lizenz:</b> <a href="` + obj[0].video.dgs[v].license.url + `">` + obj[0].video.dgs[v].license.name + `</a><br>
                                </div>
                                <div class="col">
                                    <button class="btn btn-danger" onclick='download("`+obj[0].word.de+`.bug.json","`+JSON.stringify(obj[0]).replaceAll("\"","\\\"")+"Error Video: "+v+`")'><i class="fas fa-bug"></i></button>
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-outline-info w-100" data-toggle="collapse" data-target="#info-` + 0+"-"+v + `" aria-expanded="false" aria-controls="info-` + 0+"-"+v + `"><i class="fas fa-info-circle"></i> Details</button>
                    </div>
                </div>`
                continue
            }
            html_videos += `
            <div class="carousel-item">
                <div class="card-img-top embed-responsive embed-responsive-4by3">
                    <video class="embed-responsive-item" autoplay muted loop>
                        <source src="` + encodeURI(obj[0].video.dgs[v].url) + `" type="video/mp4">
                        Your browser does not support the video tag.
                    </video> 
                </div>
                <div class="card-body">
                    <div class=" text-left collapse mb-1 mt-1" id="info-` + 0+"-"+v + `">
                        <div class="row">
                            <div class="col">
                                <b>Quelle:</b> ` + obj[0].video.dgs[v].source + `<br>
                                <b>Letzter Zugriff:</b> ` + obj[0].video.dgs[v].created + `<br>
                                <b>Kategorie:</b> ` + categories + `<br>
                                <b>Lizenz:</b> <a href="` + obj[0].video.dgs[v].license.url + `">` + obj[0].video.dgs[v].license.name + `</a><br>
                            </div>
                            <div class="col">
                                <button class="btn btn-danger" onclick='download("`+obj[0].word.de+`.bug.json","`+JSON.stringify(obj[0]).replaceAll("\"","\\\"")+"Error Video: "+v+`")'><i class="fas fa-bug"></i></button>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-outline-info w-100" data-toggle="collapse" data-target="#info-` + 0+"-"+v + `" aria-expanded="false" aria-controls="info-` + 0+"-"+v + `"><i class="fas fa-info-circle"></i> Details</button>
                </div>
            </div>
            `
        }

        html += `
            <h4>Bestes Ergebnis:</h4>
            <br>
            <div class="card text-center">
                <div class="card-header">
                <div class="row">
                    <div class="col-10 col-lg-11">
                        <h4 class="w-100" id="` + 0 + `">` + encodeHTMLEntities(obj[0].word.de) + `</h4>
                    </div>
                    <div class="col-1 col-lg-1">
                        <button class="btn btn-outline-success text-right" id="add-` + 0 + `" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                    </div>
                </div>
                </div>
                <div id="carouselExampleIndicators-`+0+`" class="carousel slide" data-ride="carousel">
                    <div class="carousel-inner">
                        `+html_videos+`
                    </div>
                    <a class="carousel-control-prev" href="#carouselExampleIndicators-`+0+`" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselExampleIndicators-`+0+`" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                </div>
            </div>
            <br>
            <hr>
            `;
        for (var i = 1; i < obj.length; i++) {
            if (i == 1) {
                html += "<h4>Worte die den Suchbergiff enthalten:</h4><br>"
            }
            if (i == 5) {
                html += "<p> 5 von " + obj.length + " Ergebnissen angezeigt, bitte genauer suchen."
                break;
            }
            categories = ""
            for (var k = 0; k < obj[i].category.length; k++) {
                categories += obj[i].category[k]
                if (k !== obj[i].category.length - 1) {
                    categories += ", "
                }
            }

            html_videos=""
            for(var v=0; v<obj[i].video.dgs.length; v++){
                if(v==0){
                    html_videos += `
                    <div class="carousel-item active">
                        <div class="card-img-top embed-responsive embed-responsive-4by3">
                            <video class="embed-responsive-item" autoplay muted loop>
                                <source src="` + encodeURI(obj[i].video.dgs[v].url) + `" type="video/mp4">
                                Your browser does not support the video tag.
                            </video> 
                        </div>
                        <div class="card-body">
                            <div class=" text-left collapse mb-1 mt-1" id="info-` + i+"-"+v + `">
                            <div class="row">
                                <div class="col">
                                    <b>Quelle:</b> ` + obj[i].video.dgs[v].source + `<br>
                                    <b>Letzter Zugriff:</b> ` + obj[i].video.dgs[v].created + `<br>
                                    <b>Kategorie:</b> ` + categories + `<br>
                                    <b>Lizenz:</b> <a href="` + obj[i].video.dgs[v].license.url + `">` + obj[i].video.dgs[v].license.name + `</a><br>
                                </div>
                                <div class="col">
                                    <button class="btn btn-danger" onclick='download("`+obj[i].word.de+`.bug.json","`+JSON.stringify(obj[i]).replaceAll("\"","\\\"")+"Error Video: "+v+`")'><i class="fas fa-bug"></i></button>
                                </div>
                            </div>
                            </div>
                            <button class="btn btn-outline-info w-100" data-toggle="collapse" data-target="#info-` + i+"-"+v + `" aria-expanded="false" aria-controls="info-` + i+"-"+v + `"><i class="fas fa-info-circle"></i> Details</button>
                        </div>
                    </div>`
                    continue
                }
                html_videos += `
                    <div class="carousel-item">
                        <div class="card-img-top embed-responsive embed-responsive-4by3">
                            <video class="embed-responsive-item" autoplay muted loop>
                                <source src="` + encodeURI(obj[i].video.dgs[v].url) + `" type="video/mp4">
                                Your browser does not support the video tag.
                            </video> 
                        </div>
                        <div class="card-body">
                            <div class=" text-left collapse mb-1 mt-1" id="info-` + i+"-"+v + `">
                            <div class="row">
                                <div class="col">
                                    <b>Quelle:</b> ` + obj[i].video.dgs[v].source + `<br>
                                    <b>Letzter Zugriff:</b> ` + obj[i].video.dgs[v].created + `<br>
                                    <b>Kategorie:</b> ` + categories + `<br>
                                    <b>Lizenz:</b> <a href="` + obj[i].video.dgs[v].license.url + `">` + obj[i].video.dgs[v].license.name + `</a><br>
                                </div>
                                <div class="col">
                                    <button class="btn btn-danger" onclick='download("`+obj[i].word.de+`.bug.json","`+JSON.stringify(obj[i]).replaceAll("\"","\\\"")+"Error Video: "+v+`")'><i class="fas fa-bug"></i></button>
                                </div>
                            </div>
                            </div>
                            <button class="btn btn-outline-info w-100" data-toggle="collapse" data-target="#info-` + i+"-"+v + `" aria-expanded="false" aria-controls="info-` + i+"-"+v + `"><i class="fas fa-info-circle"></i> Details</button>
                        </div>
                    </div>
                    `
            }

            html += `<div class="card text-center">
            <div class="card-header" data-toggle="collapse" data-target="#video-` + i + `" aria-expanded="false" aria-controls="video-` + i + `">
                <div class="row">
                    <div class="col-10 col-lg-11">
                        <h4 class="w-100" id="` + i + `">` + encodeHTMLEntities(obj[i].word.de) + `</h4>
                    </div>
                    <div class="col-1 col-lg-1">
                        <button class="btn btn-outline-success text-right" id="add-` + i + `" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                    </div>
                </div>
            </div>
            <div class="collapse" id="video-` + i + `">
            <div id="carouselExampleIndicators-`+i+`" class="carousel" data-ride="carousel slide">
                <div class="carousel-inner">
                    `+html_videos+`
                </div>
                <a class="carousel-control-prev" href="#carouselExampleIndicators-`+i+`" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                </a>
                <a class="carousel-control-next" href="#carouselExampleIndicators-`+i+`" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                </a>
            </div>
            </div>
            </div>
            <br>`;
        }
    }
    if (html === tmp) {
        html += "<p>Kein Ergebnis gefunden.</p>"
    }
    return html;
}

function initWordAddButtons(obj) {
    console.log("initWordAddButtons", obj);
    for (var i = 0; i < obj.length; i++) {
        toggleWordAddButton(document.getElementById("add-" + i), isWordInStack(obj[i].word.de))

        if(document.getElementById("add-" + i) == null){
            break;
        }
        document.getElementById("add-" + i).addEventListener("click", function (event) {
            var element = this
            var entry = obj[parseInt(this.id.replace("add-", ""))]

            console.log(entry, this);
            if (element !== null) {
                if (element.getAttribute("aria-toggle") === "true") {
                    addToStack([entry], 0)
                    toggleWordAddButton(element, true)
                } else {
                    for (var i = 0; i < 6; i++) {
                        removeFromStack([entry], 0)
                    }
                    toggleWordAddButton(element, false)
                }
            }
        });
    }
}

function toggleWordAddButton(element, isToggeled) {
    console.log(element, isToggeled);
    if (element != null) {
        if (isToggeled) {
            element.className = "btn btn-success text-right"
            element.innerHTML = '<i class="fas fa-check"></i>'
            element.setAttribute("aria-toggle", "false")
        } else {
            element.className = "btn btn-outline-success text-right"
            element.innerHTML = '<i class="fas fa-folder-plus"></i>'
            element.setAttribute("aria-toggle", "true")
        }
    }
}

function showSearchResult(id, word) {
    element = document.getElementById(id);
    if (element !== null) {
        obj = searchInDict(word, false)
        html = searchResultHTML(word, obj)
        element.innerHTML = html
        initWordAddButtons(obj)
    }
}

////////////////////////////////////
//                                //
//      Words per Category        //
//                                //
////////////////////////////////////


function searchByCategory(category) {
    console.log("Category:", category);
    result = []
    for (var i = 0; i < dict.dict.length; i++) {
        for (var j = 0; j < dict.dict[i].category.length; j++) {
            if (dict.dict[i].category[j].toLowerCase() === category.toLowerCase()) {
                result.push(dict.dict[i])
            }
        }
    }
    return result
}

function createWordsPerCategoryHTML(category) {
    html = ""

    obj = searchByCategory(category)

    for (var i = 0; i < obj.length; i++) {
        html += '<li class="list-group-item"><a href="/app/dict/#search=' + encodeURI(obj[i].word.de) + '">' + obj[i].word.de + '</a></li>'
    }

    return html
}

function createCategoriesHTML() {
    html = ""

    for (var i = 0; i < meta.categories.length; i += 2) {
        html += `
        <div class="row">`

        if (meta.categories[i] !== null) {
            html += `
                <div class="col-md">
                    <div class="card text-center">
                        <div class="card card-header">
                            <div class="row">
                                <div class="col-10 col-lg-10">
                                    <h5>` + meta.categories[i] + `</h5>
                                </div>
                                <div class="col-1 col-lg-1">
                                    <button class="btn btn-outline-success text-right" id="add-` + i + `" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                                </div>
                            </div>
                            <hr class="mt-3">
                            <i class="fas fa-chevron-down" data-toggle="collapse" data-target="#category-` + i + `" aria-expanded="false" aria-controls="category-` + i + `"></i>
                        </div>
                        <ul class="list-group collapse" id="category-` + i + `" style="max-height:200px;margin-bottom:10px;overflow:scroll;-webkit-overflow-scrolling: touch;">
                            ` + createWordsPerCategoryHTML(meta.categories[i]) + `
                        </ul>
                    </div>
                    <br>
                </div>`
        }
        if (meta.categories[i + 1] !== null) {
            html += `
                <div class="col-md">
                    <div class="card text-center">
                        <div class="card card-header">
                            <div class="row">
                                <div class="col-10 col-lg-10">
                                    <h5>` + meta.categories[i + 1] + `</h5>
                                </div>
                                <div class="col-1 col-lg-1">
                                    <button class="btn btn-outline-success text-right" id="add-` + (i + 1) + `" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                                </div>
                            </div>
                            <hr class="mt-3">
                            <i class="fas fa-chevron-down" data-toggle="collapse" data-target="#category-` + (i + 1) + `" aria-expanded="false" aria-controls="category-` + (i + 1) + `"></i>
                        </div>
                        <ul class="list-group collapse" id="category-` + (i + 1) + `" style="max-height:200px;margin-bottom:10px;overflow:scroll;-webkit-overflow-scrolling: touch;">
                            ` + createWordsPerCategoryHTML(meta.categories[i + 1]) + `
                        </ul>
                    </div>
                    <br>
                </div>`
        }

        html += `
        </div>`;
    }

    return html
}

function addCategoryToStack(category) {
    obj = searchByCategory(category)
    addToStack(obj, 0)
    user_data.categories.push(category)
    saveUserData();
}

function removeCategoryFromStack(category) {
    obj = searchByCategory(category)
    removeFromStack(obj, 0)
    user_data.categories.filter(function (obj) {
        return obj !== category
    })
    saveUserData();
}

function isCategoryInUserData(category) {
    for (var i = 0; i < user_data.categories.length; i++) {
        if (user_data.categories[i] == category) {
            return true
        }
    }
    return false
}

function addEventListenerPerCategory() {
    for (var i = 0; i < meta.categories.length; i++) {
        toggleWordAddButton(document.getElementById("add-" + i), isCategoryInUserData(meta.categories[i]))
        document.getElementById("add-" + i).addEventListener("click", function (event) {
            var element = this
            var entry = parseInt(this.id.replace("add-", ""))

            console.log(entry, this);
            if (element !== null) {
                if (element.getAttribute("aria-toggle") === "true") {
                    addCategoryToStack(meta.categories[entry])
                    toggleWordAddButton(element, true)
                } else {
                    for (var i = 0; i < 6; i++) {
                        removeCategoryFromStack(meta.categories[entry])
                    }
                    toggleWordAddButton(element, false)
                }
            }
        });
    }
}

////////////////////////////////////
//                                //
//         Practice Mode          //
//                                //
////////////////////////////////////


function initPracticeStacks() {
    for (var i = 0; i <= 5; i++) {
        stack = document.getElementById("stack-" + i);
        stack_btn_word = document.getElementById("btn-stack-word-" + i)
        stack_btn_sign = document.getElementById("btn-stack-sign-" + i)
        if (stack == null || stack_btn_word == null | stack_btn_sign == null) {
            continue;
        }
        if (user_data.data[i] != undefined) {
            stack.innerText = user_data.data[i].length
            if (user_data.data[i].length == 0) {
                stack_btn_word.setAttribute("disabled", "")
                stack_btn_word.setAttribute("aria-disabled", "true")
                stack_btn_word.className = "btn btn-outline-secondary w-100"
                stack_btn_sign.setAttribute("disabled", "")
                stack_btn_sign.setAttribute("aria-disabled", "true")
                stack_btn_sign.className = "btn btn-outline-secondary w-100"
            }
        }
    }
}

/**
 * Evaluates if a word exists in one of the learning stacks
 * @param {string} word 
 */
function isWordInStack(word) {
    for (var i = 0; i < user_data.data.length; i++) {
        for (var j = 0; j < user_data.data[i].length; j++) {
            if (user_data.data[i][j].word.de == word) {
                return true
            }
        }
    }
    return false
}

/**
 * Add an array of dictonary words to the stack.
 * @param {Array} obj 
 * @param {Integer} num 
 */
function addToStack(obj, num) {
    if (num >= 0 && num < 6) {
        for (var i = 0; i < obj.length; i++) {
            console.log("addToStack[" + num + "]", obj[i]);
            user_data.data[num].push(obj[i])
            saveUserData()
        }
    }
}

/**
 * Remove an array of dictonary words from the stack.
 * @param {Array} obj 
 * @param {*} num 
 */
function removeFromStack(obj, num) {
    if (num >= 0 && num < 6) {
        for (var i = 0; i < obj.length; i++) {
            console.log("removeFromStack[" + num + "]", obj[i]);
            tmp = user_data.data[num].filter(function (item) {
                console.log(obj[i], item);
                return obj[i].word.de !== item.word.de
            })
            user_data.data[num] = tmp
            saveUserData()
        }
    }
}

function getPracticeSet(num) {
    console.log("Num", num);

    count = settings.number_of_words_per_session
    vocabulary_set = []

    if (count > user_data.data[num].length) {
        count = user_data.data[num].length
    }

    for (var i = 0; i < count; i++) {
        if (user_data.data[num] !== undefined) {
            v = user_data.data[num][i];
            console.log(i, v)
            vocabulary_set.push(v)
        }
    }

    saveUserData()

    return vocabulary_set;
}

function createPracticeHTML(vocabulary_set, i, isSign) {
    html = ""
    categories = ""
    for (var k = 0; k < vocabulary_set[i].category.length; k++) {
        categories += vocabulary_set[i].category[k]
        if (k !== vocabulary_set[i].category.length - 1) {
            categories += ", "
        }
    }
    html_videos=""
    for(var v=0; v<vocabulary_set[0].video.dgs.length; v++){
        if(v==0){
            html_videos += `
            <div class="carousel-item active">
                <div class="card-img-top embed-responsive embed-responsive-4by3">
                    <video class="embed-responsive-item" autoplay muted loop>
                        <source src="` + encodeURI(vocabulary_set[i].video.dgs[v].url) + `" type="video/mp4">
                        Your browser does not support the video tag.
                    </video> 
                </div>
                <div class="card-body">
                    <div class=" text-left collapse mb-1 mt-1" id="info-` + i +"-"+ v + `">
                    <div class="row">
                        <div class="col">
                            <b>Quelle:</b> ` + vocabulary_set[i].video.dgs[v].source + `<br>
                            <b>Letzter Zugriff:</b> ` + vocabulary_set[i].video.dgs[v].created + `<br>
                            <b>Kategorie:</b> ` + categories + `<br>
                            <b>Lizenz:</b> <a href="` + vocabulary_set[i].video.dgs[v].license.url + `">` + vocabulary_set[i].video.dgs[v].license.name + `</a><br>
                        </div>
                        <div class="col">
                            <button class="btn btn-danger" onclick='download("`+vocabulary_set[i].word.de+`.bug.json","`+JSON.stringify(vocabulary_set[i]).replaceAll("\"","\\\"")+"Error Video: "+v+`")'><i class="fas fa-bug"></i></button>
                        </div>
                    </div>
                    </div>
                    <button class="btn btn-outline-info w-100" data-toggle="collapse" data-target="#info-` + i +"-"+ v + `" aria-expanded="false" aria-controls="info-` + i +"-"+ v + `"><i class="fas fa-info-circle"></i> Details</button>
                </div>
            </div>`
            continue
        }
        html_videos += `
        <div class="carousel-item">
            <div class="card-img-top embed-responsive embed-responsive-4by3">
                <video class="embed-responsive-item" autoplay muted loop>
                    <source src="` + encodeURI(vocabulary_set[i].video.dgs[v].url) + `" type="video/mp4">
                    Your browser does not support the video tag.
                </video> 
            </div>
            <div class="card-body">
                <div class=" text-left collapse mb-1 mt-1" id="info-` + i +"-"+ v + `">
                <div class="row">
                    <div class="col">
                        <b>Quelle:</b> ` + vocabulary_set[i].video.dgs[v].source + `<br>
                        <b>Letzter Zugriff:</b> ` + vocabulary_set[i].video.dgs[v].created + `<br>
                        <b>Kategorie:</b> ` + categories + `<br>
                        <b>Lizenz:</b> <a href="` + vocabulary_set[i].video.dgs[v].license.url + `">` + vocabulary_set[i].video.dgs[v].license.name + `</a><br>
                    </div>
                    <div class="col">
                        <button class="btn btn-danger" onclick='download("`+vocabulary_set[i].word.de+`.bug.json","`+JSON.stringify(vocabulary_set[i]).replaceAll("\"","\\\"")+"Error Video: "+v+`")'><i class="fas fa-bug"></i></button>
                    </div>
                </div>
                </div>
                <button class="btn btn-outline-info w-100" data-toggle="collapse" data-target="#info-` + i+"-"+ v + `" aria-expanded="false" aria-controls="info-` + i +"-"+ v + `"><i class="fas fa-info-circle"></i> Details</button>
            </div>
        </div>
        `
    }

    if (isSign) {
        html += `
        <div id="exercise-` + i + `" class="card text-center mt-4">
            <div class="card-header">
                <h5>Welche Gebärde hat dieses Wort?</h5>
            </div>
            
            <div id="video-`+i+`" class="carousel slide collapse" data-ride="carousel">
            <div class="carousel-inner">
                    `+html_videos+`
                </div>
                <a class="carousel-control-prev" href="#video-`+i+`" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                </a>
                <a class="carousel-control-next" href="#video-`+i+`" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                </a>
            </div>

            <button id="solution-` + i + `" class="btn btn-info w-70"  data-toggle="collapse" href="#video-` + i + `" role="button" aria-expanded="false" aria-controls="collapseExample">Lösung anzeigen</button>
            <div id="word-` + i + `">
                <br>
                <h4 class="card-title font-weight-bold" id="word">` + encodeHTMLEntities(vocabulary_set[i].word.de) + `</h4>
                <hr>
                <div class="row collapse" id="video-` + i + `">
                    <div class="col">
                        <button id="true-` + i + `" class="btn btn-outline-success w-100" data-toggle="button" aria-pressed="false"><i class="fas fa-check"></i></button>
                    </div>
                    <div class="col">
                        <button id="false-` + i + `" class="btn btn-outline-danger w-100" data-toggle="button" aria-pressed="false"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            </div>
            </div>
            <div class="card-footer text-muted text-center">
            ` + (i + 1) + `/` + vocabulary_set.length + `
            </div>
            </div>
            <br>`;
    } else {
        html += `
    <div id="exercise-` + i + `" class="card text-center mt-4">
        <div class="card-header">
            <h5>Wie lautet das Wort zu dieser Gebärde?</h5>
        </div>
       
        <div id="video-`+i+`" class="carousel slide" data-ride="carousel">
        <div class="carousel-inner">
                `+html_videos+`
            </div>
            <a class="carousel-control-prev" href="#video-`+i+`" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#video-`+i+`" role="button" data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
            </a>
        </div>

        <button id="solution-` + i + `" class="btn btn-info"  data-toggle="collapse" href="#word-` + i + `" role="button" aria-expanded="false" aria-controls="collapseExample">Lösung anzeigen</button>
        <div class="collapse" id="word-` + i + `">
            <br>
            <h4 class="card-title font-weight-bold" id="word">` + encodeHTMLEntities(vocabulary_set[i].word.de) + `</h4>
            <hr>
            <div class="row">
                <div class="col">
                    <button id="true-` + i + `" class="btn btn-outline-success w-100" data-toggle="button" aria-pressed="false"><i class="fas fa-check"></i></button>
                </div>
                <div class="col">
                    <button id="false-` + i + `" class="btn btn-outline-danger w-100" data-toggle="button" aria-pressed="false"><i class="fas fa-times"></i></button>
                </div>
            </div>
        </div>
        </div>
        <div class="card-footer text-muted text-center">
        ` + (i + 1) + `/` + vocabulary_set.length + `
        </div>
        </div>
        <br>`;
    }

    return html;
}

function showPracticeHTML(vocabulary_set, i, isSign, stackNum) {

    if (document.getElementById("practice") !== null) {
        if (vocabulary_set[i] === undefined) {
            window.location.href = "/app/"
            return
        }

        document.getElementById("practice").innerHTML = createPracticeHTML(vocabulary_set, i, isSign)

        document.getElementById("true-" + i).setAttribute("data-stack", stackNum)
        document.getElementById("true-" + i).addEventListener("click", function (event) {
            var stackNum = parseInt(this.getAttribute("data-stack"))
            removeFromStack([vocabulary_set[i]], stackNum)
            addToStack([vocabulary_set[i]], (stackNum + 1 > 5) ? 5 : stackNum + 1)
            saveUserData()
            showPracticeHTML(vocabulary_set, i + 1, isSign, stackNum)
        })
        document.getElementById("false-" + i).setAttribute("data-stack", stackNum)
        document.getElementById("false-" + i).addEventListener("click", function (event) {
            var stackNum = parseInt(this.getAttribute("data-stack"))
            removeFromStack([vocabulary_set[i]], stackNum)
            addToStack([vocabulary_set[i]], 0)
            saveUserData()
            showPracticeHTML(vocabulary_set, i + 1, isSign, stackNum)
        })
    }
}

////////////////////////////////////
//                                //
//           Exercise             //
//                                //
////////////////////////////////////

function setExerciseToStack(exerciseName) {
    console.log("Exercise Name:",exerciseName);
    if(meta != null){
        for(var i=0; i<meta.exercises.length; i++){
                
            var exercise = meta.exercises
            console.log("Exercise:",exercise[i]);
            if (exercise == null) {
                console.error("Exercise \"" + exerciseName + "\" not found!");
                continue
            }

            for(var j = 0; j < exercise[i].subexercises.length; j++){
                console.log("Sub:",exercise[i].subexercises[j].name)
                for(var k=0; k < exercise[i].subexercises[j].exercise.length; k++){
                    var word = searchInDict(exercise[i].subexercises[j].exercise[k],true)
                    console.log("Exercise Word:",exercise[i].subexercises[j].exercise[k]);
                    if(word.length == 0){
                        console.warn("The word \""+exercise[i].subexercises[j].exercise[k]+"\" was not found try alternative word or synonym.");
                        continue
                    }
                    addToStack(word,0)
                }
            }
        }
        saveUserData()
    }
}

function showExerciseHTML(){
    html = `
    <div id="exercise-1">
        <h2 class="pt-3">Übung 1</h2>
        <p>
            Ein wenig Text um die Übung zu beschreiben.
        </p>
        <div class="row">
            <div class="col-md">
                <div class="card text-center">
                    <div class="card card-header">
                        <div class="row">
                            <div class="col-6 col-lg-6">
                                <h5>Übung A</h5>
                            </div>
                            <div class="col-2 col-lg-2">
                                <button class="btn btn-outline-success text-right" id="add-" aria-toggle="true"><i class="fas fa-american-sign-language-interpreting"></i></button>
                            </div>
                            <div class="col-2 col-lg-2">
                                <button class="btn btn-outline-success text-right" id="add-" aria-toggle="true"><i class="fas fa-font"></i></button>
                            </div>
                            <div class="col-2 col-lg-2">
                                <button class="btn btn-outline-success text-right" id="add-" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                            </div>
                        </div>
                        <p class="mt-4">
                            Text um die Unterübung zu beschreiben.
                        </p>
                        <hr class="mt-3">
                        <i class="fas fa-chevron-down" data-toggle="collapse" data-target="#category-" aria-expanded="false" aria-controls="category-"></i>
                    </div>
                    <ul class="list-group collapse" id="category-" style="max-height:200px;margin-bottom:10px;overflow:scroll;-webkit-overflow-scrolling: touch;">
                        <li class="list-group-item"><a href="/app/dict/#search=WORT">WORT 1</a></li>
                        <li class="list-group-item"><a href="/app/dict/#search=WORT">WORT 2</a></li>
                        <li class="list-group-item"><a href="/app/dict/#search=WORT">WORT 3</a></li>
                    </ul>
                </div>
                <br>
            </div>
        </div>
    </div>
    `
    var exerciseMode = document.getElementById("exercise")
    if(exerciseMode != null){
        if(meta != null){
            html = ""
            console.log("Create exercises");
            for(var i=0; i<meta.exercises.length; i++){
                exercisesHTML = `
                <div id="exercise-`+i+`">
                    <h2 class="pt-3">`+meta.exercises[i].name+`</h2>
                    <p>
                        `+meta.exercises[i].description+`
                    </p>
                        
                `
                for(var j=0; j<meta.exercises[i].subexercises.length; j++){
                    subexercisesHTML = `
                    <div class="">
                            <div class="card text-center">
                                <div class="card card-header">
                                    <div class="row">
                                        <div class="col-6 col-lg-6">
                                            <h5>`+meta.exercises[i].subexercises[j].name+`</h5>
                                        </div>
                                        <div class="col-2 col-lg-2">
                                            <button class="btn btn-outline-success text-right" id="add-`+i+"-"+j+`" aria-toggle="true"><i class="fas fa-american-sign-language-interpreting"></i></button>
                                        </div>
                                        <div class="col-2 col-lg-2">
                                            <button class="btn btn-outline-success text-right" id="add-`+i+"-"+j+`" aria-toggle="true"><i class="fas fa-font"></i></button>
                                        </div>
                                        <div class="col-2 col-lg-2">
                                            <button class="btn btn-outline-success text-right" id="add-`+i+"-"+j+`" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                                        </div>
                                    </div>
                                    <p class="mt-4">
                                        `+meta.exercises[i].subexercises[j].description+`
                                    </p>
                                    <hr class="mt-3">
                                    <i class="fas fa-chevron-down" data-toggle="collapse" data-target="#category-`+i+"-"+j+`" aria-expanded="false" aria-controls="category-"></i>
                                </div>    
                                <ul class="list-group collapse" id="category-`+i+"-"+j+`" style="max-height:200px;margin-bottom:10px;overflow:scroll;-webkit-overflow-scrolling: touch;">                
                    `

                    exerciseHTML = ""
                    for(var k=0; k<meta.exercises[i].subexercises[j].exercise.length; k++){
                        exerciseHTML += `
                            <li class="list-group-item"><a href="/app/dict/#search=`+encodeURI(meta.exercises[i].subexercises[j].exercise[k])+`">`+meta.exercises[i].subexercises[j].exercise[k]+`</a></li>
                        `

                    }

                    subexercisesHTML += exerciseHTML

                    exercisesHTML += subexercisesHTML

                    exercisesHTML += `
                            </ul>
                        </div>
                        <br>
                    </div>
                    `
                }

                exercisesHTML += `
                </div>
                `
                html += exercisesHTML
            }
        }
        exerciseMode.innerHTML = html;
    }
}


////////////////////////////////////
//                                //
//           Settings             //
//                                //
////////////////////////////////////

if (window.location.pathname == "/app/settings/") {
    if(settings != null){
        document.getElementById("number_of_words_per_session").value = parseInt(settings.number_of_words_per_session)
    }

    uploadBackup = document.getElementById("BackupFileUpload")
    if(uploadBackup != null){
        uploadBackup.addEventListener("change",function(event){
            let newUserData = this.files[0];
            if(newUserData != null){
                var reader = new FileReader();
                reader.onload = function(event){
                    var result = reader.result
                    user_data = JSON.parse(result)
                    localStorage.setItem("user_data",JSON.stringify(user_data))
                }
                reader.readAsText(newUserData)
                
            } else {
                console.error("No files uploaded");
            }
        })
    }

    uploadDict = document.getElementById("dictFileUpload")
    if(uploadDict != null){
        uploadDict.addEventListener("change",function(event){
            let newDict = this.files[0];
            if(newDict != null){
                var reader = new FileReader();
                reader.onload = function(event){
                    var result = reader.result
                    dict = JSON.parse(result)
                    localStorage.setItem("dict",JSON.stringify(dict))
                }
                reader.readAsText(newDict)
                
            } else {
                console.error("No files uploaded");
            }
        })
    }
}

function resetUserData() {
    localStorage.removeItem('user_data')

    window.location.href = "/app/settings/"
}

function resetDictionary() {
    localStorage.removeItem('dict')

    window.location.href = "/app/settings/"
}

function resetSettings() {
    localStorage.removeItem('settings')

    window.location.href = "/app/settings/"
}

function resetAll() {
    localStorage.removeItem('meta')
    localStorage.removeItem('dict')
    localStorage.removeItem('settings')
    localStorage.removeItem('user_data')

    window.location.href = "/app/settings/"
}

function saveSettings() {
    settings.number_of_words_per_session = parseInt(document.getElementById("number_of_words_per_session").value);
    localStorage.setItem("settings", JSON.stringify(settings))
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function replaceAllBulkEdit(){
    // Empty set
    for(var i=0;i<user_data.data.length;i++){
        user_data.data[i] = []
    }

    addBulkEdit()
}

function addBulkEdit(){

    textarea = document.getElementById("bulkEdit").value
    wordArray = textarea.split("\n")
    errorWords = []

    for(var i=0; i<wordArray.length; i++){
        var word = searchInDict(wordArray[i],true)
        console.log("BulkEdit Word:",word);
        if(word.length == 0){
            console.warn("BulkEdit: The word \""+wordArray[i]+"\" was not found try alternative word or synonym.");
            errorWords.push(wordArray[i])
            continue
        }
        addToStack(word,0)
    }

    if(errorWords.length>0){
        showErrorBulkEdit(errorWords)
    }
    
    saveUserData()
}

function showErrorBulkEdit(wordList){
    wordsHtml = ""
    for(var i=0;i<wordList.length;i++){
        wordsHtml += wordList[i]+"\n"
    }

    html = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Folgende Worte konnten nicht im Wörterbuch gefunden werden!</strong> 
        <p>
            `+wordsHtml+`
        <p>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
    </div>`

  document.getElementById("alert-bulkEdit").innerHTML = html
}

////////////////////////////////////
//                                //
//        Useful Functions        //
//                                //
////////////////////////////////////


function encodeHTMLEntities(string) {
    console.log("String:", string)
    if (string !== undefined) {
        return string.replace(/./gm, function (s) {
            // return "&#" + s.charCodeAt(0) + ";";
            return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";";
        })
    }
    return "undefined";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function saveUserData() {
    localStorage.setItem("user_data", JSON.stringify(user_data))
    console.log("Saved User Data:", user_data);
}