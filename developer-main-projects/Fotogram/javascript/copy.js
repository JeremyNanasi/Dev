//// final one //////////////
let arrTitles = [
    './img/section/quito_street.jpg',
    './img/section/quito_kathedrale.jpg',
    './img/section/Thailand-rice-plantation.jpg',
    './img/section/berlin_brandenburgertor.jpg',
    './img/section/berlin_skulptur_molekuel_mann.jpg',
    './img/section/egypt-pyramiden.jpg',
    './img/section/eqypt-sphinx.jpg',
    './img/section/Indonesian-tempel.jpg',
    './img/section/jungfrau_de_quito_equador.jpg',
    './img/section/madrid-koenigspalast.jpg',
    './img/section/madrid-pferd.jpg',
    './img/section/münchen_friedensengel.jpg'
];
let arrDescriptions = [
"Die Quito Street verbindet historische Architektur mit lebendigem Straßenleben und bietet eine Vielzahl an Geschäften und Märkten. Sie ist ein pulsierendes Zentrum der ecuadorianischen Hauptstadt.",
"Die Basilika ist das wichtigste Werk der neugotischen Architektur in Ecuador und gehört zu den repräsentativsten Amerikas. Es ist die größte neugotische Basilika in der Neuen Welt.",
"Thailand ist einer der weltweit größten Reisproduzenten, und Reisplantagen prägen die Landschaft des Landes. Die Felder werden meist von Kleinbauern bewirtschaftet, oft in aufwendiger Handarbeit und mit traditionellen Anbaumethoden. Das tropische Klima und die Monsunregen sorgen für optimale Bedingungen für den Reisanbau.",
"Das Brandenburger Tor in Berlin ist ein berühmtes Wahrzeichen Deutschlands und symbolisiert Einheit und Freiheit. Es wurde 1791 im klassizistischen Stil erbaut und diente einst als Stadttor. Heute ist es ein zentraler Treffpunkt für Touristen und historische Gedenkstätte.",
"Die Skulptur Molecule Man in Berlin ist ein 30 Meter hohes Kunstwerk des US-Künstlers Jonathan Borofsky. Sie zeigt drei menschliche Figuren, die sich in der Spree begegnen, und symbolisiert die Verbindung von Menschen und Stadtteilen. Die Aluminiumskulptur reflektiert Licht und Wasser, was ihr eine dynamische Wirkung verleiht.",
"Pyramiden sind monumentale Bauwerke, die vor allem im Alten Ägypten und in Mittelamerika errichtet wurden. Sie dienten als Grabstätten für Pharaonen oder als Tempel und zeugen von beeindruckender Baukunst. Besonders bekannt ist die Cheops-Pyramide, eines der Sieben Weltwunder der Antike.",
"Die Sphinx ist eine mythische Figur mit einem Löwenkörper und einem menschlichen Kopf, bekannt vor allem durch die Große Sphinx von Gizeh in Ägypten. Sie gilt als Wächterin der Pyramiden und ist eines der ältesten und rätselhaftesten Monumente der Welt. Ihr genaues Alter und ihre ursprüngliche Bedeutung sind bis heute umstritten.",
"Indonesische Tempel, bekannt als *Candi*, sind beeindruckende religiöse Bauwerke aus hinduistisch-buddhistischer Zeit. Der berühmteste ist Borobudur, die größte buddhistische Tempelanlage der Welt, reich verziert mit Reliefs und Stupas. Diese Tempel spiegeln die spirituelle und kulturelle Geschichte Indonesiens wider.",
"Die Jungfrau von Quito (*Virgen de Quito*) ist eine berühmte Statue auf dem Hügel El Panecillo in Ecuador. Sie zeigt die Jungfrau Maria mit Flügeln und einer Schlange unter ihren Füßen, inspiriert von einer barocken Darstellung. Die 41 Meter hohe Skulptur ist ein Wahrzeichen Quitos und ein bedeutendes religiöses Symbol.",
"Der Königspalast von Madrid (*Palacio Real*) ist die offizielle Residenz des spanischen Königs, wird aber meist für Zeremonien genutzt. Mit über 3.000 Räumen zählt er zu den größten Palästen Europas und beeindruckt mit prunkvoller Architektur. Seine kunstvollen Säle, Gärten und die Waffenkammer ziehen jährlich viele Besucher an.",
"In Madrid gibt es mehrere berühmte Reiterstatuen, darunter die Statue von Philipp IV. auf der Plaza de Oriente. Dieses bronzene Kunstwerk aus dem 17. Jahrhundert zeigt den König auf einem steigenden Pferd und gilt als technisches Meisterwerk. Die Statue symbolisiert königliche Macht und ist ein beliebtes Fotomotiv für Touristen.",
"Der Friedensengel in München ist ein Denkmal, das an 25 Jahre Frieden nach dem Deutsch-Französischen Krieg erinnert. Die goldene Statue der Siegesgöttin Nike thront auf einer 38 Meter hohen Säule oberhalb der Isar. Sie ist ein bekanntes Wahrzeichen der Stadt und ein Symbol für Frieden und Versöhnung."
];
let arrAlt = [
    "quito street",
    "Quito Kathedrale",
    "Thailand rice plantation",
    "Brandenburger Tor",
    "Berlin Skulptur molekuel Mann",
    "Egypt Pyramiden",
    "Eqypt sphinx",
    "Indonesian Tempel",
    "Jungfrau de Quito Equador",
    "Madrid Koenigspalast",
    "Madrid Pferd",
    "München Friedensengel"
];
function render(i) {
    for (i = 0; i + 1 <= arrTitles.length; i++) {
        let contentRefImages = document.getElementById('overlay_content');
        contentRefImages.innerHTML = '';
        contentRefImages.innerHTML += getImages(i);
    }
}

function getImages(i) {
    return`
    <section>
        <div id="overlay_content">
            <div id="content">
                <div onclick="renderFiltered(${[i]})"><img class="image_all img_star" src="${arrTitles[i]}" alt="${arrAlt[i]}"></div>
            </div>
        </div>
        </div>
    </section>`;
}
function renderFiltered(index) {
    event.stopPropagation();
    onbodyclick();
    
    for (index; index <= arrTitles.length; index++) {
        contentRef = document.getElementById('dialog');
        contentRef.style.display = 'flex';
        contentRef.innerHTML = "";
        contentRef.innerHTML += getNoteTemplate(index);
        break;
    }
}
    function getNoteTemplate(index) {
        return`
            <div id="template_all_div">
            <div id="close_div">
            <div id="close_button_div">
            <button onclick="closeWindow()" id="template_button_close"><img id="close_button_template" src="./img/delete.png" alt="close"></button>
            </div>
            </div>
                <div id="template_image_div">
                    <img id="template_image" src="${arrTitles[index]}" alt="${arrAlt[index]}">
                </div>
                <div id="template_text_div">
                    <p>${arrDescriptions[index]}</p>
                </div>
                <div id="template_button_div">
                    <button onclick="moveNext(${index})" id="template_button">&lt;</button>
                    <button onclick="toogleOverlay(${index})" id="template_button">&gt;</button>
                </div>
            </div>`;
    }
function toogleOverlay(index) {
    event.stopPropagation();
    index = index + 1;
    renderFiltered(index);
    if(index >= 12) {
        index = 0;
        renderFiltered(index);
    }
}
function moveNext(index) {
    event.stopPropagation();
    index = index - 1;
    renderFiltered(index);
    
    if(index < 0) {
        index = 11;
        renderFiltered(index);
    }
}
function closeWindow() {
    event.stopPropagation();
    let contentRefImages = document.getElementById('dialog');
    contentRefImages.style.display = "none";
    let bodyZindex = document.getElementById('body_onclick');
    bodyZindex.style.zIndex = '0';
}
function openWindow() {
    let contentRefImages = document.getElementById('dialog');
    contentRefImages.style.display = "flex";
}
function closeTemplateBody() {
    let contentRefImages = document.getElementById('dialog');
    if(contentRefImages.style.display === "none") {
        contentRefImages.style.display = "none";
    } else {
        contentRefImages.style.display = "none";
        let bodyZindex = document.getElementById('body_onclick');
        bodyZindex.style.zIndex = '0';
    }
}
function onbodyclick() {
    let bodyZindex = document.getElementById('body_onclick');
    bodyZindex.style.zIndex = '-2';
}

//// Best version ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let arrTitles = [
    './img/section/quito_street.jpg',
    './img/section/quito_kathedrale.jpg',
    './img/section/Thailand-rice-plantation.jpg',
    './img/section/berlin_brandenburgertor.jpg',
    './img/section/berlin_skulptur_molekuel_mann.jpg',
    './img/section/egypt-pyramiden.jpg',
    './img/section/eqypt-sphinx.jpg',
    './img/section/Indonesian-tempel.jpg',
    './img/section/jungfrau_de_quito_equador.jpg',
    './img/section/madrid-koenigspalast.jpg',
    './img/section/madrid-pferd.jpg',
    './img/section/münchen_friedensengel.jpg'
];

let arrDescriptions = [
"Die Quito Street verbindet historische Architektur mit lebendigem Straßenleben und bietet eine Vielzahl an Geschäften und Märkten. Sie ist ein pulsierendes Zentrum der ecuadorianischen Hauptstadt.",
"Die Basilika ist das wichtigste Werk der neugotischen Architektur in Ecuador und gehört zu den repräsentativsten Amerikas. Es ist die größte neugotische Basilika in der Neuen Welt.",
"Thailand ist einer der weltweit größten Reisproduzenten, und Reisplantagen prägen die Landschaft des Landes. Die Felder werden meist von Kleinbauern bewirtschaftet, oft in aufwendiger Handarbeit und mit traditionellen Anbaumethoden. Das tropische Klima und die Monsunregen sorgen für optimale Bedingungen für den Reisanbau.",
"Das Brandenburger Tor in Berlin ist ein berühmtes Wahrzeichen Deutschlands und symbolisiert Einheit und Freiheit. Es wurde 1791 im klassizistischen Stil erbaut und diente einst als Stadttor. Heute ist es ein zentraler Treffpunkt für Touristen und historische Gedenkstätte.",
"Die Skulptur Molecule Man in Berlin ist ein 30 Meter hohes Kunstwerk des US-Künstlers Jonathan Borofsky. Sie zeigt drei menschliche Figuren, die sich in der Spree begegnen, und symbolisiert die Verbindung von Menschen und Stadtteilen. Die Aluminiumskulptur reflektiert Licht und Wasser, was ihr eine dynamische Wirkung verleiht.",
"Pyramiden sind monumentale Bauwerke, die vor allem im Alten Ägypten und in Mittelamerika errichtet wurden. Sie dienten als Grabstätten für Pharaonen oder als Tempel und zeugen von beeindruckender Baukunst. Besonders bekannt ist die Cheops-Pyramide, eines der Sieben Weltwunder der Antike.",
"Die Sphinx ist eine mythische Figur mit einem Löwenkörper und einem menschlichen Kopf, bekannt vor allem durch die Große Sphinx von Gizeh in Ägypten. Sie gilt als Wächterin der Pyramiden und ist eines der ältesten und rätselhaftesten Monumente der Welt. Ihr genaues Alter und ihre ursprüngliche Bedeutung sind bis heute umstritten.",
"Indonesische Tempel, bekannt als *Candi*, sind beeindruckende religiöse Bauwerke aus hinduistisch-buddhistischer Zeit. Der berühmteste ist Borobudur, die größte buddhistische Tempelanlage der Welt, reich verziert mit Reliefs und Stupas. Diese Tempel spiegeln die spirituelle und kulturelle Geschichte Indonesiens wider.",
"Die Jungfrau von Quito (*Virgen de Quito*) ist eine berühmte Statue auf dem Hügel El Panecillo in Ecuador. Sie zeigt die Jungfrau Maria mit Flügeln und einer Schlange unter ihren Füßen, inspiriert von einer barocken Darstellung. Die 41 Meter hohe Skulptur ist ein Wahrzeichen Quitos und ein bedeutendes religiöses Symbol.",
"Der Königspalast von Madrid (*Palacio Real*) ist die offizielle Residenz des spanischen Königs, wird aber meist für Zeremonien genutzt. Mit über 3.000 Räumen zählt er zu den größten Palästen Europas und beeindruckt mit prunkvoller Architektur. Seine kunstvollen Säle, Gärten und die Waffenkammer ziehen jährlich viele Besucher an.",
"In Madrid gibt es mehrere berühmte Reiterstatuen, darunter die Statue von Philipp IV. auf der Plaza de Oriente. Dieses bronzene Kunstwerk aus dem 17. Jahrhundert zeigt den König auf einem steigenden Pferd und gilt als technisches Meisterwerk. Die Statue symbolisiert königliche Macht und ist ein beliebtes Fotomotiv für Touristen.",
"Der Friedensengel in München ist ein Denkmal, das an 25 Jahre Frieden nach dem Deutsch-Französischen Krieg erinnert. Die goldene Statue der Siegesgöttin Nike thront auf einer 38 Meter hohen Säule oberhalb der Isar. Sie ist ein bekanntes Wahrzeichen der Stadt und ein Symbol für Frieden und Versöhnung."
];
let arrAlt = [
    "quito street",
    "Quito Kathedrale",
    "Thailand rice plantation",
    "Brandenburger Tor",
    "Berlin Skulptur molekuel Mann",
    "Egypt Pyramiden",
    "Eqypt sphinx",
    "Indonesian Tempel",
    "Jungfrau de Quito Equador",
    "Madrid Koenigspalast",
    "Madrid Pferd",
    "München Friedensengel"
];

function render(i) {
    for (i = 0; i + 1 <= arrTitles.length; i++) {
        let contentRefImages = document.getElementById('overlay_content');
        contentRefImages.innerHTML = '';
        contentRefImages.innerHTML += getImages(i);
    }
}

function getImages(i) {
    return`
    <section>
        <div id="overlay_content">
            <div id="content">
                <div onclick="renderFiltered(${i = 0})"><img class="image_all img_star" src="${arrTitles[i = 0]}" alt="Quito street"></div>
                <div onclick="renderFiltered(${i = 1})"><img class="image_all img_star" src="${arrTitles[i = 1]}" alt="Quito Kathedrale"></div>
                <div onclick="renderFiltered(${i = 2})"><img class="image_all img_star" src="${arrTitles[i = 2]}" alt="Thailand rice plantation"></div>
                <div onclick="renderFiltered(${i = 3})"><img class="image_all img_star" src="${arrTitles[i = 3]}" alt="Brandenburger Tor"></div>
                <div onclick="renderFiltered(${i = 4})"><img class="image_all img_star" src="${arrTitles[i = 4]}" alt="Berlin Skulptur molekuel Mann"></div>
                <div onclick="renderFiltered(${i = 5})"><img class="image_all img_star" src="${arrTitles[i = 5]}" alt="Egypt Pyramiden"></div>
                <div onclick="renderFiltered(${i = 6})"><img class="image_all img_star" src="${arrTitles[i = 6]}" alt="Eqypt sphinx"></div>
                <div onclick="renderFiltered(${i = 7})"><img class="image_all img_star" src="${arrTitles[i = 7]}" alt="Indonesian Tempel"></div>
                <div onclick="renderFiltered(${i = 8})"><img class="image_all img_star" src="${arrTitles[i = 8]}" alt="Jungfrau de Quito Equador"></div>
                <div onclick="renderFiltered(${i = 9})"><img class="image_all img_star" src="${arrTitles[i = 9]}" alt="Madrid Koenigspalast"></div>
                <div onclick="renderFiltered(${i = 10})"><img class="image_all img_star" src="${arrTitles[i = 10]}" alt="Madrid Pferd"></div>
                <div onclick="renderFiltered(${i = 11})"><img class="image_all img_star" src="${arrTitles[i = 11]}" alt="München Friedensengel"></div>
            </div>
        </div>
        </div>
    </section>`;
}

function renderFiltered(index) {
    event.stopPropagation();
    onbodyclick();
    
    for (index; index <= arrTitles.length; index++) {
        contentRef = document.getElementById('dialog');
        contentRef.style.display = 'flex';
        contentRef.innerHTML = "";
        contentRef.innerHTML += getNoteTemplate(index);
        break;
    }
}

    function getNoteTemplate(index) {
        return`
            <div id="template_all_div">
            <div id="close_div">
            <div id="close_button_div">
            <button onclick="closeWindow()" id="template_button_close"><img id="close_button_template" src="./img/delete.png" alt="close"></button>
            </div>
            </div>
                <div id="template_image_div">
                    <img id="template_image" src="${arrTitles[index]}" alt="${arrAlt[index]}">
                </div>
                <div id="template_text_div">
                    <p>${arrDescriptions[index]}</p>
                </div>
                <div id="template_button_div">
                    <button onclick="moveNext(${index})" id="template_button">&lt;</button>
                    <button onclick="toogleOverlay(${index})" id="template_button">&gt;</button>
                </div>
            </div>`;
    }

function toogleOverlay(index) {
    event.stopPropagation();
    index = index + 1;
    renderFiltered(index);
    if(index >= 12) {
        index = 0;
        renderFiltered(index);
    }
}

function moveNext(index) {
    event.stopPropagation();
    index = index - 1;
    renderFiltered(index);
    
    if(index < 0) {
        index = 11;
        renderFiltered(index);
    }
}

function closeWindow() {
    event.stopPropagation();
    let contentRefImages = document.getElementById('dialog');
    contentRefImages.style.display = "none";
    let bodyZindex = document.getElementById('body_onclick');
    bodyZindex.style.zIndex = '0';
}

function openWindow() {
    let contentRefImages = document.getElementById('dialog');
    contentRefImages.style.display = "flex";
}

function closeTemplateBody() {
    let contentRefImages = document.getElementById('dialog');
    if(contentRefImages.style.display === "none") {
        contentRefImages.style.display = "none";
    } else {
        contentRefImages.style.display = "none";
        let bodyZindex = document.getElementById('body_onclick');
        bodyZindex.style.zIndex = '0';
    }
}

function onbodyclick() {
    let bodyZindex = document.getElementById('body_onclick');
    bodyZindex.style.zIndex = '-2';
}



///////////////////////////////////////////// 

let arrTitles = [
    './img/section/quito_street.jpg',
    './img/section/quito_kathedrale.jpg',
    './img/section/Thailand-rice-plantation.jpg',
    './img/section/berlin_brandenburgertor.jpg',
    './img/section/berlin_skulptur_molekuel_mann.jpg',
    './img/section/egypt-pyramiden.jpg',
    './img/section/eqypt-sphinx.jpg',
    './img/section/Indonesian-tempel.jpg',
    './img/section/jungfrau_de_quito_equador.jpg',
    './img/section/madrid-koenigspalast.jpg',
    './img/section/madrid-pferd.jpg',
    './img/section/münchen_friedensengel.jpg',
    ''
];

let arrDescriptions = [
"Die Quito Street verbindet historische Architektur mit lebendigem Straßenleben und bietet eine Vielzahl an Geschäften und Märkten. Sie ist ein pulsierendes Zentrum der ecuadorianischen Hauptstadt.",
"Die Basilika ist das wichtigste Werk der neugotischen Architektur in Ecuador und gehört zu den repräsentativsten Amerikas. Es ist die größte neugotische Basilika in der Neuen Welt.",
"Thailand ist einer der weltweit größten Reisproduzenten, und Reisplantagen prägen die Landschaft des Landes. Die Felder werden meist von Kleinbauern bewirtschaftet, oft in aufwendiger Handarbeit und mit traditionellen Anbaumethoden. Das tropische Klima und die Monsunregen sorgen für optimale Bedingungen für den Reisanbau.",
"Das Brandenburger Tor in Berlin ist ein berühmtes Wahrzeichen Deutschlands und symbolisiert Einheit und Freiheit. Es wurde 1791 im klassizistischen Stil erbaut und diente einst als Stadttor. Heute ist es ein zentraler Treffpunkt für Touristen und historische Gedenkstätte.",
"Die Skulptur Molecule Man in Berlin ist ein 30 Meter hohes Kunstwerk des US-Künstlers Jonathan Borofsky. Sie zeigt drei menschliche Figuren, die sich in der Spree begegnen, und symbolisiert die Verbindung von Menschen und Stadtteilen. Die Aluminiumskulptur reflektiert Licht und Wasser, was ihr eine dynamische Wirkung verleiht.",
"Pyramiden sind monumentale Bauwerke, die vor allem im Alten Ägypten und in Mittelamerika errichtet wurden. Sie dienten als Grabstätten für Pharaonen oder als Tempel und zeugen von beeindruckender Baukunst. Besonders bekannt ist die Cheops-Pyramide, eines der Sieben Weltwunder der Antike.",
"Die Sphinx ist eine mythische Figur mit einem Löwenkörper und einem menschlichen Kopf, bekannt vor allem durch die Große Sphinx von Gizeh in Ägypten. Sie gilt als Wächterin der Pyramiden und ist eines der ältesten und rätselhaftesten Monumente der Welt. Ihr genaues Alter und ihre ursprüngliche Bedeutung sind bis heute umstritten.",
"Indonesische Tempel, bekannt als *Candi*, sind beeindruckende religiöse Bauwerke aus hinduistisch-buddhistischer Zeit. Der berühmteste ist Borobudur, die größte buddhistische Tempelanlage der Welt, reich verziert mit Reliefs und Stupas. Diese Tempel spiegeln die spirituelle und kulturelle Geschichte Indonesiens wider.",
"Die Jungfrau von Quito (*Virgen de Quito*) ist eine berühmte Statue auf dem Hügel El Panecillo in Ecuador. Sie zeigt die Jungfrau Maria mit Flügeln und einer Schlange unter ihren Füßen, inspiriert von einer barocken Darstellung. Die 41 Meter hohe Skulptur ist ein Wahrzeichen Quitos und ein bedeutendes religiöses Symbol.",
"Der Königspalast von Madrid (*Palacio Real*) ist die offizielle Residenz des spanischen Königs, wird aber meist für Zeremonien genutzt. Mit über 3.000 Räumen zählt er zu den größten Palästen Europas und beeindruckt mit prunkvoller Architektur. Seine kunstvollen Säle, Gärten und die Waffenkammer ziehen jährlich viele Besucher an.",
"In Madrid gibt es mehrere berühmte Reiterstatuen, darunter die Statue von Philipp IV. auf der Plaza de Oriente. Dieses bronzene Kunstwerk aus dem 17. Jahrhundert zeigt den König auf einem steigenden Pferd und gilt als technisches Meisterwerk. Die Statue symbolisiert königliche Macht und ist ein beliebtes Fotomotiv für Touristen.",
"Der Friedensengel in München ist ein Denkmal, das an 25 Jahre Frieden nach dem Deutsch-Französischen Krieg erinnert. Die goldene Statue der Siegesgöttin Nike thront auf einer 38 Meter hohen Säule oberhalb der Isar. Sie ist ein bekanntes Wahrzeichen der Stadt und ein Symbol für Frieden und Versöhnung."
];
let arrAlt = [
    "quito street",
    "Quito Kathedrale",
    "Thailand rice plantation",
    "Brandenburger Tor",
    "Berlin Skulptur molekuel Mann",
    "Egypt Pyramiden",
    "Eqypt sphinx",
    "Indonesian Tempel",
    "Jungfrau de Quito Equador",
    "Madrid Koenigspalast",
    "Madrid Pferd",
    "München Friedensengel"
];

function render(i) {
    for (i = 0; i + 1 <= arrTitles.length; i++) {
        let contentRefImages = document.getElementById('overlay_content');
        contentRefImages.innerHTML = '';
        contentRefImages.innerHTML += getImages(i);
    }
}

function getImages(i) {
    return`
    <section>
        <div id="overlay_content">
            <div id="content">
                <div onclick="renderFiltered(${i})"><img class="image_all img_star" src="${arrTitles[i]}" alt="${arrTitles[i]}"></div>
            </div>
        </div>
        </div>
    </section>`;
}

function renderFiltered(index) {
    event.stopPropagation();
    onbodyclick();
    
    for (index; index <= arrTitles.length; index++) {
        contentRef = document.getElementById('dialog');
        contentRef.style.display = 'flex';
        contentRef.innerHTML = "";
        contentRef.innerHTML += getNoteTemplate(index);
        break;
    }
}

    function getNoteTemplate(index) {
        return`
            <div id="template_all_div">
            <div id="close_div">
            <div id="close_button_div">
            <button onclick="closeWindow()" id="template_button_close"><img id="close_button_template" src="./img/delete.png" alt="close"></button>
            </div>
            </div>
                <div id="template_image_div">
                    <img id="template_image" src="${arrTitles[index]}" alt="${arrAlt[index]}">
                </div>
                <div id="template_text_div">
                    <p>${arrDescriptions[index]}</p>
                </div>
                <div id="template_button_div">
                    <button onclick="moveNext(${index})" id="template_button">&lt;</button>
                    <button onclick="toogleOverlay(${index})" id="template_button">&gt;</button>
                </div>
            </div>`;
    }

function toogleOverlay(index) {
    event.stopPropagation();
    index = index + 1;
    renderFiltered(index);
    if(index >= 12) {
        index = 0;
        renderFiltered(index);
    }
}

function moveNext(index) {
    event.stopPropagation();
    if(index === 0) {
        index = -1
    }
    if(index >= 1) {
        index = index - 1;
        renderFiltered(index);
    }
    if (index < 0) {
        index = 11;
        renderFiltered(index);
    } 
}

function closeWindow() {
    event.stopPropagation();
    let contentRefImages = document.getElementById('dialog');
    contentRefImages.style.display = "none";
    let bodyZindex = document.getElementById('body_onclick');
    bodyZindex.style.zIndex = '0';
}

function openWindow() {
    let contentRefImages = document.getElementById('dialog');
    contentRefImages.style.display = "flex";
}

function closeTemplateBody() {
    let contentRefImages = document.getElementById('dialog');
    if(contentRefImages.style.display === "none") {
        contentRefImages.style.display = "none";
    } else {
        contentRefImages.style.display = "none";
        let bodyZindex = document.getElementById('body_onclick');
        bodyZindex.style.zIndex = '0';
    }
}

function onbodyclick() {
    let bodyZindex = document.getElementById('body_onclick');
    bodyZindex.style.zIndex = '-2';
}


/////////////////////////////undefined clean

function moveNext(index) {
    event.stopPropagation();
    if(index === 0) {
        index = -1
    }
    if(index >= 1) {
        index = index - 1;
        renderFiltered(index);
    }
    if (index < 0) {
        index = 11;
        renderFiltered(index);
    } 
}