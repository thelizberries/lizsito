
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
                    collapseDiv.innerHTML = data + '<br><a href="#" class="text-red text-uppercase font-weight-bold" id="showLess">Show Less</a>';
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
            leftPosition -= parentRect.left - (navItemWidth / 2) - (submenuWidth / 2) - 10;

            submenu.style.left = leftPosition + 'px';
            submenu.style.top = navItemRect.bottom - parentRect.top + 'px';

    
            // Mostra il sottomenu
            submenu.style.display = 'block';
            submenu.classList.remove('hide');
            submenu.classList.add('show');
        }
    });
    
    
});

//Script for image carousel
const images = [
    "../lizards/lizardsPhotos/photo_carousel/13-shooting-24.jpg",
    "../lizards/lizardsPhotos/photo_carousel/14-shooting-24.jpg",
    "../lizards/lizardsPhotos/photo_carousel/15-shooting-24.jpg",
    "../lizards/lizardsPhotos/photo_carousel/1-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/2-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/3-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/4-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/5-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/6-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/7-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/8-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/9-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/10-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/11-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/12-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/13-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/14-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/15-live.jpg",
    "../lizards/lizardsPhotos/photo_carousel/16-live.jpg"
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