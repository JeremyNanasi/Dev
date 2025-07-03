
function getNoteTemplate(indexNote){
    return`
    <div class="note">
        <h3>${allNotes.notesTitle[indexNote]}<h3>
        <p>${allNotes.notes[indexNote]}</p>
        <div>
            <button onclick="moveNote(${indexNote}, 'notes', 'trashNotes')" class="btn">X</button>
            <button onclick="moveNote(${indexNote}, 'notes', 'archivNotes')" class="btn">A</button>
        </div>
    </div>
    `;
}

function getArchivNoteTemplate(indexArchivNote){
    return`
        <div class="note">
            <h3>${allNotes.archivNotesTitles[indexArchivNote]}</h3>
            <p>${allNotes.archivNotes[indexArchivNote]}</p>
            <div>
                <button onclick="moveNote(${indexArchivNote}, 'archivNotes', 'trashNotes')" class="btn">X</button>
                <button onclick="moveNote(${indexArchivNote}, 'archivNotes', 'notes')" class="btn">N</button>
            </div>
        </div>
    `;
}

function getTrashNoteTemplate(indexTrashNote){
    return`
    <div class="note">
            <h3>${allNotes.trashNotesTiltes[indexTrashNote]}</3>
            <p>${allNotes.trashNotes[indexTrashNote]}</p>
        <div>
            <button onclick="deleteNote(${indexTrashNote})" class="btn">X</button>
            <button onclick="moveNote(${indexTrashNote}, 'trashNotes', 'notes')" class="btn">N</button>
        </div>
    </div>
    `;
}

// 11 - tipps: template.js und css-files nutzen nachbauen = nicht abgebaut