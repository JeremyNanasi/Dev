// not in html

function minusTimes(i) {
    if( burgerMenus[i].amount > 0) {
    burgerMenus[i].amount--;
    burgerMenus[i].price = burgerMenus[i].basicprice * burgerMenus[i].amount;
    renderBasket();
    }
}

function addOrder(i) {
    burgerMenus[i].amount++;
    burgerMenus[i].price = burgerMenus[i].basicprice * burgerMenus[i].amount;
    renderBasket(i);
}

function resultInvoicePlus(i) {
    burgerMenus[i].price = burgerMenus[i].basicprice * burgerMenus[i].amount;
    renderBasket();
}

function resultInvoiceMinus(i) {
    burgerMenus[i].price = burgerMenus[i].basicprice * burgerMenus[i].amount;
    renderBasket();
}

function deleteBucket(i) {
    burgerMenus[i].amount = 0;
    burgerMenus[i].add = false;
    renderBasket();
}

let totalPrice = 0;

function sumMeals(i) {
    totalPrice += burgerMenus[i].price;
    console.log(totalPrice);
    
    endSumRender();
}

function getCalculatedSum() {
    let sum = 0;
    for (let i = 0; i < burgerMenus.length; i++) {
        sum += burgerMenus[i].amount * burgerMenus[i].basicprice
    }
    return sum
}
