// noz in html

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


// problem ist das zweite basket_content.
// er akzeptiert nur den i in endSumRender().  
