


date = new Date();
year = date.getFullYear();
month = date.getMonth() + 1;
day = date.getDate();
document.getElementById("current_date").innerHTML = day + "/" + month + "/" + year;
function meinePortion() {

    
    let priceNumber = {
        hackfleisch : 500,
        zwiebel : 1,
        knoblauch : 2,
        petersilie : 1,
        tomatenmark : 1,
        tomaten : 1,
    }

    let resultValue = document.getElementById('portionsInput').value;

    if (resultValue > 0 && resultValue < 21) {
    ergebnisRechnung = resultValue * priceNumber.hackfleisch;
    solution = ergebnisRechnung + "g Hackfleisch, gemischtes"; 
    document.getElementById("ergebnisHackfleisch").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.zwiebel;
    solution = ergebnisRechnung + "  Zwiebel(n)";
    document.getElementById("ergebnisZwiebel").innerHTML = solution;


    ergebnisRechnung = resultValue * priceNumber.knoblauch; 
    solution = ergebnisRechnung + " Knoblauchzehe(n)";
    document.getElementById("ergebnisKnoblauch").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.petersilie;
    solution = ergebnisRechnung + " Bunde Petersilie oder TK"; 
    document.getElementById("ergebnisPetersilie").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.tomatenmark;
    solution = ergebnisRechnung + " EL Tomatenmark"; 
    document.getElementById("ergebnisTomatenmark").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.tomaten;
    solution = ergebnisRechnung + " Dose(n) Tomaten, geschälte "; 
    document.getElementById("ergebnisTomaten").innerHTML = solution;
    
    } else if(resultValue < 0) {
        alert("Dein Wert ist zu niedrig und sollte mindestens 1 enthalten");
    } else {
        alert("Dein Wert ist zu hoch und sollte nicht mehr als 20 Portionen enthalten");
    }
}




 