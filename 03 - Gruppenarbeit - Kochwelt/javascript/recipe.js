

date = new Date();
year = date.getFullYear();
month = date.getMonth() + 1;
day = date.getDate();
document.getElementById("current_date").innerHTML = day + "/" + month + "/" + year;


function recipe_calculator() {



    let recipeList = {

        Tomaten: 200,
        Salatgurke: 0.25,
        Oliven: 50,
        Fetakäse: 50,
        Petersilie: 0.25,
        Oregano: 1,
        Olivenöl: 2,
    
    }

    let resultValue = document.getElementById('portion_input').value;

    if (resultValue > 0 && resultValue < 21) {
    let Ergebnisrechnung = resultValue * recipeList.Tomaten;
    let Ergebnis = Ergebnisrechnung + "g Tomaten" ;
    document.getElementById('ErgebnisTomate').innerHTML = Ergebnis;
    
    Ergebnisrechnung = resultValue * recipeList.Salatgurke;
    Ergebnisgurke = Ergebnisrechnung + "Bund Salatgurke";
    document.getElementById('ErgebnisSalatgurke').innerHTML = Ergebnisgurke;

    Ergebnisrechnung = resultValue * recipeList.Oliven;
    ErgebnisOliven = Ergebnisrechnung + "g Oliven";
    document.getElementById('ErgebnisOliven').innerHTML = ErgebnisOliven;   
    
    Ergebnisrechnung = resultValue * recipeList.Fetakäse;
    ErgebnisFetakäse = Ergebnisrechnung + "g Fetakäse";
    document.getElementById('ErgebnisFetakäse').innerHTML=ErgebnisFetakäse;
    
    Ergebnisrechnung = resultValue * recipeList.Petersilie;
    ErgebnisPetersilie = Ergebnisrechnung + "Bund Petersilie";
    document.getElementById('ErgebnisPetersilie').innerHTML=ErgebnisPetersilie;

    Ergebnisrechnung = resultValue * recipeList.Oregano;
    ErgebnisOregano = Ergebnisrechnung + "TL Oregano";
    document.getElementById('ErgebnisOregano').innerHTML=ErgebnisOregano;

    Ergebnisrechnung = resultValue * recipeList.Olivenöl;
    ErgebnisOlivenöl = Ergebnisrechnung + "EL Olivenöl";
    document.getElementById('ErgebnisOlivenöl').innerHTML=ErgebnisOlivenöl;

} else if(resultValue < 0) {
    alert("Dein Wert ist zu niedrig und sollte mindestens 1 enthalten");
} else {
    alert("Dein Wert ist zu hoch und sollte nicht mehr als 20 Portionen enthalten");
}

}