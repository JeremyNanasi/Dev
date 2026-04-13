



function render() {
    let burgerMenuContentRef = document.getElementById('burger_content');
    burgerMenuContentRef.innerHTML = "";
    
    for (let i = 0; i < burgerMenus.length; i++) {
        burgerMenuContentRef.innerHTML += getElementById(i);
        }
}

function addBasket(i) {
    let emptyContent = document.getElementById('emptyContent');
    if(emptyContent) {
        emptyContent.style.display = "none";
    }

    let menuBasket = document.getElementById('basket');
    menuBasket.style.display = "flex";

    document.getElementById('basket_content');

    addOrder(i);
    resultInvoicePlus(i);
    cartStyle();
}

function addBasketMobil(i) {

    cartMobileButton();
    addOrder(i);
    resultInvoicePlus(i);
}

function renderBasket() {
    let basket = document.getElementById("basket_content_desktop");
    let basketMobile = document.getElementById("basket_content_mobile");

        basket.innerHTML = "";
        basketMobile.innerHTML = "";

    for (let i = 0; i < burgerMenus.length; i++) {
        if(burgerMenus[i].amount > 0) {
            basket.innerHTML += getElementByIdBasket(i);
            basketMobile.innerHTML += getElementByIdMobile(i);
        }
        endSumRender(i);
    }
}

function endSumRender(i) {
    let subtotal = getCalculatedSum();
    let delivery = 5.00;
    if (subtotal) {
        let total = subtotal + delivery;

        let basketSumDesktop = document.getElementById('basket_sum_desktop');
        let basketSumMobile = document.getElementById('basket_sum_mobile');
        
        basketSumDesktop.innerHTML = getElementByIdTotalBill(subtotal, delivery, total, i);
        basketSumMobile.innerHTML = getElementByIdTotalBill(subtotal, delivery, total, i);
    } else {
        let empty = document.getElementById('basket_sum_desktop');
        let emptyMobile = document.getElementById('basket_sum_mobile');

        empty.innerHTML = getElementByIdEmpty();
        emptyMobile.innerHTML = getElementByIdEmpty();
    }
}

function cartButton() { 
    let menuBasket = document.getElementById('basket');
    if (menuBasket.style.display === "flex") {
        menuBasket.style.display = "none";
        cartStyleNone();
    } else if(window.outerWidth < 701) {
        menuBasket.style.display = "none";
        window.addEventListener("resize", cartButton);
    } else {
        menuBasket.style.display = "flex";
        if(window.outerWidth < 1820) {
        cartStyle();
        }
    }
}

function cartStyle() {
    let content = document.getElementById('content');
    if(content){
        document.getElementById('content').id = "contentWithCart";
    }
    window.addEventListener("resize", cartButton);
}


function cartStyleNone() {
    let contentWithCart = document.getElementById('contentWithCart');
    if(contentWithCart) {
        document.getElementById('contentWithCart').id = "content";
    }
    window.addEventListener("resize", cartButton);
}

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
    renderBasket();
}

function deleteAllBucket(i) {
    for (i = 0; i < burgerMenus.length; i++) {
        burgerMenus[i].amount = 0;
    }
    showPurchase();
}

function showPurchase() {
    let payDiv = document.getElementById("Pay_div");
    payDiv.style.display = "none";
    
    let basket = "";
    let mobileBasket = "";

    basket = document.getElementById("basket_content_desktop");
    mobileBasket = document.getElementById("basket_content_mobile");

    basket.innerHTML = getElementbyMessage();
    mobileBasket.innerHTML = getElementbyMessage();    
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

function cartMobileButton() {
    let content = document.getElementById('content_none');

    if(window.getComputedStyle(content).display === 'block') {
        content = document.getElementById('content_none');
        content_cart = document.getElementById('CartContent');
        content.style.display = 'none';
        content_cart.style.display = 'flex';       
    } else {
        let content = document.getElementById('content_none');
        content_cart = document.getElementById('CartContent');
        content.style.display = 'block';
        content_cart.style.display = 'none'; 
    }
    renderBasket();
}


// showPurchase löscht nicht in mobile. wahrscheinlich weil pay_div zweimal existiert und er nimmt nur den ersten 

//////////////////////////////////////db.js


let burgerMenus = [
    {
        "name": "Smash That Burger",
        "description": "mit 2 medium Smashed Beef-Patties, Cheddar und Big-Bangsauce",
        "amount": 0,
        "price": 13.50,
        "basicprice": 13.50,
    },
    {
        "name": "Cleopatra Vegan Burger",
        "description": "mit Süßkartoffel-Patty, Pink-Vegan-Mayonnaise und Gurken",
        "amount": 0,
        "price": 9.00,
        "basicprice": 9.00,
    },
    {
        "name": "Double Cheese Burger",
        "description": "mit 2 medium Beef-Patties, Cheddar, Senf, Ketchup und Essiggurken",
        "amount": 0,
        "price": 13.50,
        "basicprice": 13.50,
    },
    {
        "name": "Paradies Burger",
        "description": "mit medium Beef-Patty, Cheddar, Paradies-Kitchensauce, Salat, Tomaten und Zwiebeln",
        "amount": 0,
        "price": 15.00,
        "basicprice": 15.00,
    },
];

/////////////////////////////////////////template.js 


function getElementById(i) {
    return`
            <div class="Meal">
                <div class="Meal_header_and_add_div">
                    <h2>${burgerMenus[i].name}</h2>
                    <img onclick="addBasket(${i})" class="add_button_meals" src="./Material/Favicon/plus_button.png">
                </div>
                <div class="product-info">
                    <a>${burgerMenus [i].description}</a>
                    <a class="a_price_orange">${burgerMenus[i].price.toFixed(2)} €</a>
                </div>
            </div>
    `;
} 

function getElementByIdBasket(i) {
    return`
            <h4>${burgerMenus[i].name}</h4>
            <div class="buy_info_bucket">
                    <img onclick="minusTimes(${i})" class="add_button_bucket" src="./Material/Favicon/minus_orange.png">
                <a id="counter-${i}" class="a_texts_bucket">${burgerMenus[i].amount}x</a>
                    <img onclick="addOrder(${i})" class="add_button_bucket" src="./Material/Favicon/plus_button.png">
                <a class="a_texts_bucket">${burgerMenus[i].price.toFixed(2)} €</a>
                    <img onclick="deleteBucket(${i})" class="add_button_bucket" src="./Material/Favicon/trash_orange.png">
            </div>
    `;
}

function getElementByIdMobile(i) {
    return`
            <h4>${burgerMenus[i].name}</h4>
            <div class="buy_info_bucket">
                        <img onclick="minusTimes(${i})" class="add_button_bucket" src="./Material/Favicon/minus_orange.png">
                    <a id="counter-${i}" class="a_texts_bucket">${burgerMenus[i].amount}x</a>
                        <img onclick="addOrder(${i})" class="add_button_bucket" src="./Material/Favicon/plus_button.png">
                    <a class="a_texts_bucket">${burgerMenus[i].price.toFixed(2)} €</a>
                        <img onclick="deleteBucket(${i})" class="add_button_bucket" src="./Material/Favicon/trash_orange.png">  
            </div>   
    `
}

function getElementByIdTotalBill(subtotal, delivery, total) {
    return`
            <div class="Pay_div">
                <div class="seperator"></div>
                <div class="Pay_div_inline">
                    <a class="a_texts_bucket">Zwischensumme</a>
                    <a class="a_texts_bucket"> ${subtotal.toFixed(2)} €</a>
                </div>
                <div class="Pay_div_inline">
                    <a class="a_texts_bucket">Lieferkosten</a>
                    <a class="a_texts_bucket">${delivery.toFixed(2)} €</a>
                </div>
                <div class="Pay_div_inline">
                    <a class="size_bold">Gesamt</a>
                    <a class="size_bold">${total.toFixed(2)} €</a>
                </div>
            </div>
    `;
}
