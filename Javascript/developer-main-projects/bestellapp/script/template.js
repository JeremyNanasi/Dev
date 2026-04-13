
function getElementById(i) {
    return`
            <div class="Meal">
                <div class="Meal_header_and_add_div">
                    <h2>${burgerMenus[i].name}</h2>
                    <img onclick="addBasket(${i})" class="add_button_meals" src="./Material/Favicon/plus_button.png">
                    <img onclick="addBasketMobil(${i})" class="add_button_meals_mobil" src="./Material/Favicon/plus_button.png">
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

function getElementByIdTotalBill(subtotal, delivery, total, i) {
    return`
            <div id="Pay_div" class="Pay_div">
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
                <div class="orderall_div">
                    <button onclick="deleteAllBucket(${i})" class="orderall">Bestellen</Button>
                </div>
            </div>
    `;
}

function getElementByIdEmpty() {
    return`
        <div>seems like you haven´t order anything</div> 
    `;
}

function getElementbyMessage() {
    return`
        <div class="purchase-confirmation">
            <h3>Vielen Dank für deine Bestellung!</h3>
            <p>Deine Bestellung wurde erfolgreich übermittelt und wird in Kürze bearbeitet.</p>
        </div>
    `;
}