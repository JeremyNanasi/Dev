

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
    resultInvoice(i);
    cartStyle();
}

function addBasketMobil(i) {
    cartMobileButton();
    addOrder(i);
    resultInvoice(i);
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

        basketSumDesktop.style.display = "flex";
        basketSumMobile.style.display = "flex";
        
        basketSumDesktop.innerHTML = getElementByIdTotalBill(subtotal, delivery, total, i);
        basketSumMobile.innerHTML = getElementByIdTotalBill(subtotal, delivery, total, i);
    } else {
        emptyElement();
    }
}

function emptyElement() {
        let empty = document.getElementById('basket_sum_desktop');
        let emptyMobile = document.getElementById('basket_sum_mobile');

        empty.innerHTML = getElementByIdEmpty();
        emptyMobile.innerHTML = getElementByIdEmpty();
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
    resultInvoice(i);
    }
}

function addOrder(i) {
    burgerMenus[i].amount++;
    resultInvoice(i);
}

function resultInvoice(i) {
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
    let payDiv = document.getElementById("basket_sum_desktop");
    let payDivmobile = document.getElementById("basket_sum_mobile");
    payDiv.style.display = "none";
    payDivmobile.style.display = "none";
    
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
