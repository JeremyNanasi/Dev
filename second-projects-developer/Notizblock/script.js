// Aufgaben: 
// global speichern
// notizen anzeigen lassen 
    // ich brauch notizen
    // -> wann werden sie angezeigt?
    // ich muss definieren wo sie anzuzegen sind 
// notizen hinzufügen
    // eingabe vom user definieren -> html id="note_input"
    // eingabe auslesen
    // eingabe speichern/ den Notizen hinzufügen
    // eingabe anzeigen lassen 
// notizen löschen
    // welche notiz muss gelöscht werden
    // wann muss die notiz gelöscht werden -> template button >X<
    // anzeige updaten
// -> notizen archivieren


//----------------------------------------
// ich brauch notizen
let allNotes = {
    'notesTitle': ['Ba', 'Aufgabe'],
    'notes': ['banana', 'rasen mähen'],
    'archivNotesTitles': [],
    'archivNotes': [],
    'trashNotesTiltes': [],
    'trashNotes': []
}

    // Notizen anzeigen lassen
    // -> wann werden sie angezeigt?
function moveNote(indexNote, startKey, destinationKey){
     // ich muss definieren wo sie anzuzegen sind 
    let note = allNotes[startKey].splice(indexNote, 1);
    allNotes[destinationKey].push(note[0]);

    let notesTitle = allNotes[startKey + "Titles"].splice(indexNote, 1);
    allNotes[destinationKey + "Titles"].push(notesTitle[0]);

    // unten ist zum erneuten rendern /////////
    renderAllNotes();
}

// erneut rendern
function renderAllNotes() {
    renderNotes();
    renderArchivNotes();
    renderTrashNotes();
}


function renderNotes(){
    let contentRef = document.getElementById('content')
    contentRef.innerHTML = "";

    // ein Array schreit nach einen for-loop
    for (let indexNote = 0; indexNote < allNotes.notes.length; indexNote++) {
        contentRef.innerHTML += getNoteTemplate(indexNote);                                 // contentRef.innerHTML += " " + note; ----  ich füge es hinzu
    }                                                                                       // contentRef.innerHTML  = " " + note; ---- ich ersetzte es 
}

function renderArchivNotes() { //die kann man auch noch ein bisschen anpassen 
    let archivContentRef = document.getElementById('archiv_content')  //man kann ('archiv_content') als parameter übergeben
    archivContentRef.innerHTML = ""; 

    for (let indexArchivNote = 0; indexArchivNote < allNotes.archivNotes.length; indexTrashNote++) { // 
        archivContentRef.innerHTML += getArchivNoteTemplate(indexArchivNote);  
    }
}

function renderTrashNotes(){
    let trashContentRef = document.getElementById('trash_content')
    trashContentRef.innerHTML = ""; 

    for (let indexTrashNote = 0; indexTrashNote < trashNotes.length; indexTrashNote++) {
        trashContentRef.innerHTML += getTrashNoteTemplate(indexTrashNote); 
    }
}


// Fehler ////////
// notizen hinzufügen
function addNote(){
    // eingabe auslesen
    let noteInputRef = document.getElementById('note_input');
    let notetitleInputRef = document.getElementById('note_input_title');
    let noteInput = noteInputRef.value;
    let noteTitle = notetitleInputRef.value;

    if(noteInput == "" || noteTitle == "") {
        return
    }

    // eingabe speichern/ den Notizen hinzufügen
    notes.push(noteInput);
    notesTitles.push(noteTitle);

    // eingabe anzeigen lassen 
    renderNotes();

    notetitleInputRef.value = "";
    noteInputRef = "";
}

// notizen löschen
function deleteNote(indexTrashNote){
    allNotes.trashNotes.splice(indexTrashNote, 1); //2nd parameter means remove one item only 
    allNotes.trashNotesTiltes.splice(indexTrashNote, 1); 

    renderAllNotes();
}


//   05 - Exkurs: Notizblock verbessern mit Objekten
// verbesserung min 11

// BA Wirtschaft und Politik 