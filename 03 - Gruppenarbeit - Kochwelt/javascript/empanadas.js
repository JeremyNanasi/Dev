

    date = new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
    document.getElementById("current_date").innerHTML = day + "/" + month + "/" + year;


function meinePortion() {

    let priceNumber = {
        mehl: 750,
        margarine: 250,
        bruehe: 400,
        salz: 1,
        zwiebel: 2,
        knoblauch: 2,
        paprikapulver: 1,
        ei: 3,
        eigelb: 2,
        kichererbsen: 150,
        mais: 150,
        paprika: 1,
        erbsen: 150,
    }

    let resultValue = document.getElementById('portionsInput').value;

    if (resultValue > 0 && resultValue < 21) {
    let ergebnisRechnung = resultValue * priceNumber.mehl;
    let solution = ergebnisRechnung + "g Mehl";
    document.getElementById("ergebnisMehl").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.bruehe;
    solution = ergebnisRechnung + "ml Bruehe";
    document.getElementById("ergebnisBruehe").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.salz;
    solution = ergebnisRechnung + "TL Salz";
    document.getElementById("ergebnisSalz").innerHTML = solution;


    ergebnisRechnung = resultValue * priceNumber.zwiebel;
    solution = ergebnisRechnung + "Zwiebel(n),rote,gehackt"
    document.getElementById("ergebnisZwiebeln").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.knoblauch;
    solution = ergebnisRechnung + "Knoblauchzehe(n),klein gehackt"
    document.getElementById("ergebnisKnoblauch").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.paprikapulver;
    solution = ergebnisRechnung + "EL Paprikapulver, edelsüßes";
    document.getElementById("ergebnisPaprikapulver").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.eigelb;
    solution = ergebnisRechnung + "Eigelb"
    document.getElementById("ergebnisEigelb").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.kichererbsen;
    solution = ergebnisRechnung + "g Kichererbsen";
    document.getElementById("ergebnisKicherbsen").innerHTML = solution;
    
    ergebnisRechnung = resultValue * priceNumber.ei;
    solution = ergebnisRechnung + "Ei(er), hart gekocht";
    document.getElementById("ergebnisEi").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.mais;
    solution = ergebnisRechnung + "g Mais";
    document.getElementById("ergebnisMais").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.margarine;
    solution = ergebnisRechnung + "g Öl oder Margarine";
    document.getElementById("ergebnisMargarine").innerHTML = solution;

    ergebnisRechnung = resultValue * priceNumber.paprika;
    solution = ergebnisRechnung + "Paprikaschoten(n), in kleine Stücke geschnitten"
    document.getElementById("ergebnisPaprikaschote").innerHTML = solution;


    ergebnisRechnung = resultValue * priceNumber.erbsen;
    solution = ergebnisRechnung + "g Erbsen TK";
    document.getElementById("ergebnisErbsen").innerHTML = solution;

    } else if(resultValue < 0) {
        alert("Dein Wert ist zu niedrig und sollte mindestens 1 enthalten");
    } else {
        alert("Dein Wert ist zu hoch und sollte nicht mehr als 20 Portionen enthalten");
    }
}

