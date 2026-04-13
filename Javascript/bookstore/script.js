
function render(indexBook) {
    let booksContentRef = document.getElementById('books_content');
    booksContentRef.innerHTML = "";

    for (indexBook = 0; indexBook < books.length; indexBook++) {
        booksContentRef.innerHTML += getBookTemplate(indexBook);
    }
}

function likeButton(indexBook) {
    let book = books[indexBook];

    if(books[indexBook].like === true) {
        book.likes += 1;
        books[indexBook].like = false;
    } else {
        book.likes -= 1;
        books[indexBook].like = true;
    }
    console.log();
    
    render();
}

localStorage.setItem(
    JSON.stringify(books[indexBook].likes)
); // dauerspeichern

console.log(
    JSON.stringify(books)
); // === macht daraus einen string  
