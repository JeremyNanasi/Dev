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
    let contentRefImages = document.getElementById('content');
    contentRefImages.innerHTML = '';
    for (i = 0; i <= arrTitles.length; i++) {
        if(i <= 11) {
        contentRefImages.innerHTML += getImages(i);
        }
    }
}

function getImages(i) {
    return`
            <div onclick="renderFiltered(${i})"><img class="image_all img_star" src="${arrTitles[i]}" alt="${arrTitles[i]}"></div>`;
}

function renderFiltered(index) {
    event.stopPropagation();
    onbodyclick();
    contentRef = document.getElementById('dialog');
    contentRef.style.display = 'flex';
    contentRef.innerHTML = "";
    contentRef.innerHTML += getNoteTemplate(index);
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
    if(index <= 11) {
        index = index + 1;
    }
    if(index >= 12) {
        index = 0;
    }
    renderFiltered(index);
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