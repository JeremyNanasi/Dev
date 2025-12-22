document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('controls-toggle');
    const menuList = document.querySelector('.menu-list');

    if (!toggleButton || !menuList) {
        return;
    }

    let expanded = false;

    const updateUi = () => {
        if (expanded) {
            menuList.classList.remove('collapsed');
            toggleButton.setAttribute('aria-expanded', 'true');
            toggleButton.textContent = 'Steuerung verbergen';
        } else {
            menuList.classList.add('collapsed');
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.textContent = 'Steuerung anzeigen';
        }
    };

    toggleButton.addEventListener('click', () => {
        expanded = !expanded;
        updateUi();
    });

    updateUi();
});