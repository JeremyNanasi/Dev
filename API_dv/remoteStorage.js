
function onloadFunc() {
    console.log("test");
    loadData();
}

const BASE_URL = "https://remotestorage-80f69-default-rtdb.europe-west1.firebasedatabase.app/"; // Definiert die Basis-URL zu einer Firebase Realtime Database (ohne Pfad oder Dateiendung)

async function loadData() { // Definiert eine asynchrone (Vorgang wird nicht sofort abgeschlossen wird) Funktion namens "loadData"
    let response = await fetch(BASE_URL + ".json"); // Wartet auf die HTTP-Antwort von der URL BASE_URL + ".json"
    let responseToJson = await response.json(); // Wartet darauf, dass die Antwort in ein JSON-Objekt umgewandelt wird
    console.log(responseToJson);
}
