
function getBookTemplate(indexBook) {
    return`
            <div class="underdiv">
                <div onclick="likeButton(${indexBook})" class="under_under_div">
                    <div class="bookheader">
                        <h2>${books[indexBook].name}</h2>
                    </div>
                    <div class="img_div">
                        <img class="booksimg" src="${books[indexBook].image}">
                    </div>
                    <div>
                        <h3>${books[indexBook].price} €</h3>
                        <div class="bookdetail_div">
                            <a>Author:</a>
                            <a>${books[indexBook].author}</a>
                        </div>
                        <div class="bookdetail_div">
                            <a>Erscheinungsjahr:</a>
                            <a>${books[indexBook].publishedYear}</a>
                        </div class="bookdetail_div">
                    </div>
                    <div class="likebutton_div">
                        <a>${books[indexBook].likes}</a>
                        <button>
                            ${books[indexBook].like ? '🤍' : '❤️'}
                        </button>
                    </div>
                    <div>
                        <a></a>
                    </div>
                </div>
            </div>
    `;
}
