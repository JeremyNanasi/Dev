


function minusTimes(i) {
    burgerMenus[i].times -= 1;
    resultInvoiceMinus(i);
    renderBasket();
}

function addOrder(i) {
    burgerMenus[i].times += 1;
    resultInvoicePlus(i);
    renderBasket();
}

function resultInvoicePlus(i) {
    burgerMenus[i].price = burgerMenus[i].basicprice * burgerMenus[i].times;
    sumMeals(i);
    renderBasket();
}

function resultInvoiceMinus(i) {
    burgerMenus[i].price = burgerMenus[i].basicprice * burgerMenus[i].times;
    renderBasket();
}

function deleteBucket(i) {
    burgerMenus[i].times = 0;
    burgerMenus[i].add = false;
    renderBasket();
}

let = totalPrice = 0;

function sumMeals(i) {
    totalPrice += burgerMenus[i].price;
    // console.log(burgerMenus[i].price);
    console.log(totalPrice);
    
    endSumRender();
}


// Aufgabe: 
// alle burgerMenus[i].price mulitplizieren
// nur der erste funktioniert. nicht der zweite oder dritte, die rechnung ist verwirrend, jedoch ist das ergebnis richtig 
// 2. 
// delievery ist sofort offen und menu 0 wird ohne onclick angenommen 