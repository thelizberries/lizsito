
$(document).ready(function () {
    // $('.portfolio-item').append
    var popup_btn = $('.popup-btn');
    popup_btn.magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });
});

//Script for Bio (more info)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#loadMoreInfo').addEventListener('click', function(event) {
        event.preventDefault();
    
        const paragraph = document.querySelector('p span');
        const collapseDiv = document.querySelector('#moreInfoCollapse');
        const moreInfoText = document.getElementById("loadMoreInfo").textContent;
        var showLessText = "Show Less";
    
        if (collapseDiv.classList.contains('show')) {
            // Se già aperto, nascondi il contenuto aggiuntivo e ripristina la situazione originale
            collapseDiv.classList.remove('show');
            collapseDiv.innerHTML = ''; // Pulisci il contenuto
            paragraph.innerHTML = paragraph.innerHTML.replace(/\s*$/, '...'); // Ripristina i tre punti di sospensione
            this.style.display = 'inline'; // Mostra di nuovo il pulsante More Info
        } else {
            // Se non aperto, sostituisci i tre punti e carica il contenuto aggiuntivo
            paragraph.innerHTML = paragraph.innerHTML.replace('...', '.');
    
            fetch('bio-content.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    // Aggiungi il contenuto caricato e il pulsante Show Less
                    if (moreInfoText.includes("Maggiori"))
                        showLessText = "Mostra Meno";
                    else 
                        showLessText = "Show Less";
                    collapseDiv.innerHTML = data + '<br><a href="#" class="text-red text-uppercase font-weight-bold" id="showLess">'+showLessText+'</a>';
                    collapseDiv.classList.add('show');
                    this.style.display = 'none'; // Nascondi il pulsante More Info
    
                    // Gestione del pulsante Show Less
                    document.querySelector('#showLess').addEventListener('click', function(event) {
                        event.preventDefault();
                        collapseDiv.classList.remove('show');
                        collapseDiv.innerHTML = ''; // Pulisci il contenuto aggiuntivo
                        paragraph.innerHTML = paragraph.innerHTML.replace(/\s*$/, '...'); // Ripristina i tre punti di sospensione
                        document.querySelector('#loadMoreInfo').style.display = 'inline'; // Mostra di nuovo More Info
                    });
                })
                .catch(error => {
                    console.error('Error loading content:', error);
                });
        }
    });

    // Pulsanti di scorrimento
    if(document.getElementById('scrollLeft')) {
        document.getElementById('scrollLeft').addEventListener('click', function() {
            console.log('Scroll left button clicked');
            document.getElementById('scrollContainer').scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });
    }

    if(document.getElementById('scrollRight')) {
        document.getElementById('scrollRight').addEventListener('click', function() {
            console.log('Scroll right button clicked');
            document.getElementById('scrollContainer').scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
    }
    // Fine pulsanti di scorrimento

    document.querySelector('.navbar-toggler').addEventListener('click', function() {
        var submenu = document.getElementById('submenu');
        var activeNavItem = document.querySelector('.nav-item.active');
    
        if (submenu.classList.contains('show')) {
            // Se il menu è aperto, chiudilo con l'animazione slideUp
            submenu.classList.remove('show');
            //submenu.style.display = 'none';
            submenu.classList.add('hide');
        } else {
            // Posiziona dinamicamente il sottomenu sotto l'elemento attivo
            var navItemRect = activeNavItem.getBoundingClientRect();
            var submenuWidth = submenu.offsetWidth;
            var navItemWidth = navItemRect.width;
            var leftPosition = navItemRect.left + (navItemWidth / 2) - (submenuWidth / 2);

            // Ensure the submenu is positioned relative to the correct parent element
            var parentRect = submenu.parentElement.getBoundingClientRect();
            leftPosition -= parentRect.left - (navItemWidth / 2) - (submenuWidth / 2);

            submenu.style.left = leftPosition + 'px';
            submenu.style.top = navItemRect.bottom - parentRect.top + 'px';

    
            // Mostra il sottomenu
            submenu.style.display = 'block';
            submenu.classList.remove('hide');
            submenu.classList.add('show');
        }
    });
    
    function handleNavbarToggler() {
        const navbarToggler = document.querySelector('.navbar-toggler:not(.mobile)'); // Seleziona il pulsante originale
        const socialMediaDiv = document.querySelector('.social-media'); // Seleziona il div con classe "social-media"

        if (window.innerWidth <= 768) {
            // Nascondi il pulsante originale solo se non è già nascosto
            if (navbarToggler && navbarToggler.style.display !== 'none') {
                navbarToggler.style.display = 'none';
            }

            // Crea un nuovo pulsante per dispositivi mobili
            let mobileToggler = socialMediaDiv.nextElementSibling?.classList.contains('mobile')
                ? socialMediaDiv.nextElementSibling
                : null;

            if (!mobileToggler) {
                // Crea un nuovo pulsante per dispositivi mobili
                mobileToggler = document.createElement('button');
                mobileToggler.className = 'navbar-toggler mobile'; // Aggiungi la classe "mobile"
                mobileToggler.type = 'button';
                mobileToggler.setAttribute('data-toggle', 'collapse');
                mobileToggler.setAttribute('data-target', '#navbarCollapse');
                mobileToggler.setAttribute('aria-controls', 'navbarCollapse');
                mobileToggler.setAttribute('aria-expanded', 'false');
                mobileToggler.setAttribute('aria-label', 'Toggle navigation');
                mobileToggler.innerHTML = '<span class="navbar-toggler-icon"></span>';

                // Inserisci il pulsante mobile subito dopo il div con classe "social-media"
                socialMediaDiv.insertAdjacentElement('afterend', mobileToggler);
            }
        } else {
            // Mostra il pulsante originale e rimuovi quello mobile
            if (navbarToggler) {
                navbarToggler.style.display = 'block';
            }
            
            const mobileToggler = socialMediaDiv.nextElementSibling?.classList.contains('navbar-toggler.mobile')
                ? socialMediaDiv.nextElementSibling
                : null;

            if (mobileToggler) {
                mobileToggler.remove();
            }
        }
    }

    // Esegui la funzione al caricamento della pagina e al ridimensionamento della finestra
    handleNavbarToggler();
    window.addEventListener('resize', handleNavbarToggler);
    
});

//Script for image carousel
const images = [
];

// Funzione per caricare dinamicamente le immagini
function loadImages() {
    const container = document.getElementById('dynamicImageContainer');
    if (images.length > 0) {
        images.forEach(image => {
            const imgElement = `
                <div class="item">
                    <a href="${image}" class="fancylight popup-btn" data-fancybox-group="light">
                        <img class="img-fluid max-height-155" src="${image}" alt="">
                    </a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', imgElement);
        });
    }
}

// Carica le immagini al caricamento della pagina
document.addEventListener('DOMContentLoaded', loadImages);