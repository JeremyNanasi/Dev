
let myData = [
    'Banana',
    'not Banana',
    'Apple'
];

function init() {
    getFromLocalStorage();
    render()
}


// Speichert hinzugefügte Daten

function saveData() {
    let inputRef = document.getElementById('data_input');

    if(inputRef.value != "") {
        myData.push(inputRef.value);
    }

    saveToLocalStorage();

    render();
    inputRef.value = "";
}

function saveToLocalStorage(){
    localStorage.setItem("myData", JSON.stringify(myData));
}

function getFromLocalStorage(){
    const myArr = JSON.parse(localStorage.getItem("myData"));
    
    if(myArr === 0){
    myData = myArr;
    }
}






function render(){
    let contentRef = document.getElementById('content_local');
    contentRef.innerHTML = "";

    for (let index = 0; index < myData.length; index++) {
        contentRef.innerHTML += `<p>${myData[index]}</p>`
    }
}
