////////////////////////////////////////////////////////////////////////////////////// Grundstruktur einer Firebase Realtime Database URL
///////////////////// 1. Daten lesen (GET) /////////////////////////////////////////////////////////////////////////////////////////////// 

// const response = await fetch(BASE_URL + "userdata.json");
// const data = await response.json();
// console.log(data);  /-- zeigt die Daten als Objekt --/

// // 2. Daten schreiben (PUT – überschreibt vorhandene Daten) //////////////////////////////////////////////////////////////////////////	

// await fetch(BASE_URL + "userdata.json", {
//   method: "PUT",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ name: "Jeremy", age: 20 })
// });

// // 3. Daten hinzufügen (POST – erzeugt automatisch eine neue ID) /////////////////////////////////////////////////////////////////////

// await fetch(BASE_URL + "userdata.json", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ name: "Lina", age: 22 })
// });

// // 4. Daten aktualisieren (PATCH – aktualisiert nur bestimmte Felder) ////////////////////////////////////////////////////////////////

// await fetch(BASE_URL + "userdata.json", {
//   method: "PATCH",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ age: 23 })
// });

// // 5. Daten löschen (DELETE) /////////////////////////////////////////////////////////////////////////////////////////////////////////

// await fetch(BASE_URL + "userdata.json", {
//   method: "DELETE"
// });

//// zusammenfassung ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// | Operation         | HTTP-Methode | Funktion                        |
// | ----------------- | ------------ | ------------------------------- |
// | Lesen             | `GET`        | Daten abrufen                   |
// | Schreiben         | `PUT`        | Komplett überschreiben          |
// | Hinzufügen        | `POST`       | Eintrag mit neuer ID hinzufügen |
// | Aktualisieren     | `PATCH`      | Nur bestimmte Felder ändern     |
// | Löschen           | `DELETE`     | Daten entfernen                 |

//// Statuscodes /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// | Code | Bedeutung             | Erklärung                            |
// | ---- | --------------------- | ----------------------------------   |
// | 200  | OK                    | Alles hat funktioniert               |
// | 201  | Created               | Neue Ressource wurde erstellt        |
// | 400  | Bad Request           | Anfrage war ungültig                 |
// | 401  | Unauthorized          | Keine Zugriffsrechte (Login nötig)   |
// | 404  | Not Found             | Adresse existiert nicht              |
// | 500  | Internal Server Error | Fehler auf dem Server                |
// | 503  | Service Unavailable   | Server nicht verfügbar               |
// | 429  | Too Many Requests     | Zu viele Anfragen in kurzer Zeit     |
// | 403  | Forbidden             | Zugriff auf die Ressource verweigert |
// | 408  | Request Timeout       | Anfrage hat zu lange gedauert        |

