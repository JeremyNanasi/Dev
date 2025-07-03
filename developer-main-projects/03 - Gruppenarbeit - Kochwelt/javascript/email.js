
function sendMail(event){
    event.preventDefault();
    const data = new FormData(event.target);

    fetch("https://formspree.io/f/xnnjzvza", {
        body: new FormData(event.target),
        method: "POST",
        headers: {
            'Accept': 'application/json'
        }
    }).then(() => {
        document.querySelector('form').onsubmit = e => {
            e.target.submit();
            e.target.reset();
            return false;
        };
        // alert('Ihre Nachricht wurde erfolgreich versendet und eine baldige Antwort wird ihnen zugesendet');
    }).catch((error) => {
        console.log(error);
    });
}
