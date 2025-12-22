document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('controls-toggle');
    const menuList = document.getElementById('controls-list');

    if (!toggleButton || !menuList) {
        return;
    }

    let expanded = false;

    const updateUi = () => {
        menuList.classList.toggle('collapsed', !expanded);
        toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        toggleButton.textContent = expanded ? 'Steuerung verbergen' : 'Steuerung anzeigen';
        toggleButton.classList.toggle('is-expanded', expanded);
    };

    toggleButton.addEventListener('click', () => {
        expanded = !expanded;
        updateUi();
    });

    updateUi();
});