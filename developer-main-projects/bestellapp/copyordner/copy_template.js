
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
                <a id="counter-${i}" class="a_texts_bucket">${burgerMenus[i].times}x</a>
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
                    <a id="counter-${i}" class="a_texts_bucket">${burgerMenus[i].times}x</a>
                        <img onclick="addOrder(${i})" class="add_button_bucket" src="./Material/Favicon/plus_button.png">
                    <a class="a_texts_bucket">${burgerMenus[i].price.toFixed(2)} €</a>
                        <img onclick="deleteBucket(${i})" class="add_button_bucket" src="./Material/Favicon/trash_orange.png">  
            </div>   
    `
}

function getElementByIdTotalBill(totalPrice) {
    return`
            <div class="Pay_div">
                <div class="seperator"></div>
                <div class="Pay_div_inline">
                    <a class="a_texts_bucket">Zwischensumme</a>
                    <a class="a_texts_bucket"> ${totalPrice.toFixed(2)} €</a>
                </div>
                <div class="Pay_div_inline">
                    <a class="a_texts_bucket">Lieferkosten</a>
                    <a class="a_texts_bucket">5,00 €</a>
                </div>
                <div class="Pay_div_inline">
                    <a class="size_bold">Gesamt</a>
                    <a class="size_bold">${(totalPrice + 5).toFixed(2)} €</a>
                </div>
            </div>
    `;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////db.js

let burgerMenus = [
    {
        "name": "Smash That Burger",
        "description": "mit 2 medium Smashed Beef-Patties, Cheddar und Big-Bangsauce",
        "times": 0,
        "price": 13.50,
        "basicprice": 13.50,
        "add": false
    },
    {
        "name": "Cleopatra Vegan Burger",
        "description": "mit Süßkartoffel-Patty, Pink-Vegan-Mayonnaise und Gurken",
        "times": 0,
        "price": 9.00,
        "basicprice": 9.00,
        "add": false
    },
    {
        "name": "Double Cheese Burger",
        "description": "mit 2 medium Beef-Patties, Cheddar, Senf, Ketchup und Essiggurken",
        "times": 0,
        "price": 13.50,
        "basicprice": 13.50,
        "add": false
    },
    {
        "name": "Paradies Burger",
        "description": "mit medium Beef-Patty, Cheddar, Paradies-Kitchensauce, Salat, Tomaten und Zwiebeln",
        "times": 0,
        "price": 15.00,
        "basicprice": 15.00,
        "add": false
    },
];