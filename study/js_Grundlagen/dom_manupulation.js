
// text.getElementById('') //////////////////////////////////////////////////////////////////////////////////////////////////////////////

// .innerHTML vs. .innerText ///////////////////////////////

// let title = document.getElementById('website_title');
// title.innerHTML = "neuer Titel"; 


// document.getElementById('test_div').innerHTML = '<p>test</p>'
// document.getElementById('test_div').innerText = '<p>test</p>'

// let button = button.getElementById('button_one'); //Mit "let button" wird button nicht akzeptiert!
// button.getElementById('button_one').innerText = '<button id="button_one">Button</button>'


// classList.add //////////////// classlist.remove ///////////

//document.getElementById('test_div').classList.add('green_bg');
//document.getElementById('test_div').classList.remove('green_bg');   // Class="green_bg" wird nicht hinzugefügt, da es sich um eine id handelt

//classList.toogle //////



// .setAtrribute ///////////////////////////////////////////
// Wir können jedes Atrribute, was ein Element hat, verändern
// setAtrribute = value (Wert)

document.getElementById('test_input').setAttribute('value', 123);
document.getElementById('test_input').setAttribute('value', 'text');


document.getElementById('test_input').value = 12345; //nochmal schauen -> 05 - setAtrribute und value



/////

document.getElementById('ubung_paragraph').setAttribute('value', 'anders'); 
  

// onklick //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Lässt text oder hinzugefügten Text verschwinden  

// function toogleDNone(id){
//    document.getElementById(id).classList.toggle('d_none');
// }

// function logger(){
//     console.log(55555);
// }


// Weiteres wissen /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Es muss immer als link verwendet werden mit = 
// Beispiel: 
// let resultFlour = document.getElementById('portionsInput').value;


// querySelector();/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Parameter:
// selector: Ein String, der einen gültigen CSS-Selektor darstellt. Dieser Selektor wird verwendet, um das Element auszuwählen. 
// Du kannst alle Arten von CSS-Selektoren verwenden, wie z. B. Tag-Namen, Klassen, IDs oder komplexere Selektoren wie Attributs- oder 
// Nachfahrenselektoren.
// 
// Rückgabewert:
// querySelector() gibt das erste Element zurück, das mit dem angegebenen Selektor übereinstimmt. Wenn kein Element gefunden wird, 
// wird null zurückgegeben.

// Nur das erste Element:
// querySelector() gibt nur das erste Element zurück, das dem Selektor entspricht. Falls du alle passenden Elemente auswählen möchtest, 
// solltest du querySelectorAll() verwenden, was eine NodeList aller passenden Elemente zurückgibt.

// CSS-Syntax verwenden:
// Da querySelector() auf der CSS-Selektorsyntax basiert, kannst du alle bekannten CSS-Selektoren verwenden, wie ID, Klassen, 
// Pseudo-Klassen, Attribute, und mehr.

// addEventListener ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 1. classlist /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Klassen //
// 1. add
// 2. remove
// 3. contains
// 4. toggle
// 5. item()
// 6. length

/////////////
const Element = document.querySelector('meinElement');

// 1. Fügt eine oder mehrere Klassen zum Element hinzu
Element.classlist.add('neu-klasse');

// 2. Entfernt eine oder mehrere Klassen vom Element
Element.classlist.remove('alte klasse');

// 3. Überprüft, ob das Element eine bestimmte Klasse hat. Gibt True zurück, wenn das Element die Klasse enthält, andernfalls false
Element.classlist.contain('test-klasse'); 

// 4. Schaltet eine Klasse um: Wenn die Klasse vorhanden ist, wird sie entfernt; wenn sie nicht vorhanden ist, wird sie hinzugefügt.
Element.classlist.toggle('sichtbar');

// 5. Gibt die Klasse an einer bestimmten Position in der Klassenliste zurück. (Index basiert)
Element.classlist.item(0); 

// 6. Gibt die Anzahl der Klassen im classlist-Objekt zurück
console.log(Element.classlist.length);

