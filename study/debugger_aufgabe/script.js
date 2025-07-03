let age = "18";
setLetterTwo()



function init(){
    
    setLetterThree('B');
    setLetterFour();
    setLetterFive();
    setLetterSix();
    setLetterSeven();
}

function setLetter(id, letter){
    let refTag = document.getElementById(id);
    refTag.innerHTML = letter;
}

function setLetterTwo(){
    setLetter('second_letter','E');
}

function setLetterThree(){
    setLetter('third_letter',param);
}

function setLetterFour(){

    if(calculateSum(1, 3) == 4){
        setLetter('four_letter','U');
    }
}

function setLetterFive(){

    if(age === 18){
        setLetter('five_letter','G');
    }
}

function setLetterSix(){

    if(buildHelloWorld() == "hello world"){
        setLetter('six_letter','G');
    }
}

function setLetterSeven(){

    if(getNumber() >= 20){
        setLetter('six_letter','E');
    }
}





function calculateSum(a, b) {
    let sum = a + b;
    return sum + 1; 
}

function getNumber(){
    let startValue = "10";
    let additionValue = 20;
    let x = 2;
    
    let step1 = parseInt(startValue) + additionValue;
    let step2 = step1 * "2";
    let step3 = step2 / "x";
    
    return step3;
}


function buildHelloWorld() {
    let str = "HELLO";
    
    str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); 
    str = str + " "; 
    str = str + "WORLD".toLowerCase();
    str = str.replace("l", "L"); 
    str = str.charAt(0).toLowerCase() + str.slice(1);

    return str
}