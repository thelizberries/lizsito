
$(document).ready(function () {
    var popup_btn = $('.popup-btn');
    popup_btn.magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {

    const backToTopButton = document.getElementById('backToTop');

    // Mostra o nasconde l'icona in base alla posizione di scorrimento
    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) { // Mostra l'icona se l'utente ha scrollato più di 300px
            backToTopButton.classList.remove('hidden');
        } else {
            backToTopButton.classList.add('hidden');
        }
    });

    // Torna in cima alla pagina quando l'icona viene cliccata
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // code for Lazy load iframes
    var lazyloadIframes = document.querySelectorAll('iframe.lazyload');
    var lazyloadThrottleTimeout;

    function lazyload() {
        if (lazyloadThrottleTimeout) {
            clearTimeout(lazyloadThrottleTimeout);
        }

        lazyloadThrottleTimeout = setTimeout(function() {
            var scrollTop = window.pageYOffset;
            lazyloadIframes.forEach(function(iframe) {
                if (iframe.offsetTop < (window.innerHeight + scrollTop)) {
                    iframe.src = iframe.dataset.src;
                    iframe.classList.remove('lazyload');
                }
            });
            if (lazyloadIframes.length == 0) {
                document.removeEventListener('scroll', lazyload);
                window.removeEventListener('resize', lazyload);
                window.removeEventListener('orientationChange', lazyload);
            }
        }, 20);
    }

    document.addEventListener('scroll', lazyload);
    window.addEventListener('resize', lazyload);
    window.addEventListener('orientationChange', lazyload);

    // Check if the browser supports the scrollbar-width property
    if (CSS.supports('scrollbar-width', 'thin')) {
        // Apply the styles dynamically
        const style = document.createElement('style');
        style.innerHTML = `
            .portfolio-item-container {
                scrollbar-width: thin; /* For Firefox */
            }
        `;
        document.head.appendChild(style);
    }

    // Carica il contenuto aggiuntivo al click del pulsante "More Info"
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
             leftPosition -= parentRect.left - (navItemWidth / 2) - (submenuWidth / 2) +100;
 
             submenu.style.left = leftPosition + 'px';
             submenu.style.top = navItemRect.bottom - parentRect.top + 'px';
 
     
             // Mostra il sottomenu
             submenu.style.display = 'block';
             submenu.classList.remove('hide');
             submenu.classList.add('show');
        }
    });

    // Funzione per gestire il pulsante navbar-toggler
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
            
            const mobileToggler = socialMediaDiv.nextElementSibling?.classList.contains('navbar-toggler') 
            && socialMediaDiv.nextElementSibling?.classList.contains('mobile')
                ? socialMediaDiv.nextElementSibling
                : null;

            if (mobileToggler) {
                mobileToggler.remove();
            }
        }
    }

    // Funzione per gestire il ridimensionamento degli h2
    function adjustHeadingForMobile() {
        const headings = document.querySelectorAll('h2'); // Seleziona tutti gli h2

        headings.forEach(heading => {
            const text = heading.textContent.trim(); // Ottieni il testo del tag h2
            const isMobile = window.innerWidth <= 768; // Verifica se è un dispositivo mobile

            if (isMobile && (text.length > 10 && !text.includes(' ') || text.length > 15)) {
                heading.classList.remove('display-4'); 
                heading.classList.add('display-5');
                heading.style.textAlign = 'center'; 
            } else {
                // Ripristina lo stile originale se non è più un dispositivo mobile
                heading.classList.remove('display-5');
                heading.classList.add('display-4');
                heading.style.textAlign = 'center'; 
            }
        });
    }

    // Esegui le funzioni al caricamento della pagina
    handleNavbarToggler();
    adjustHeadingForMobile();

     // Esegui le funzioni al ridimensionamento della finestra
    window.addEventListener('resize', function () {
        handleNavbarToggler();
        adjustHeadingForMobile();
    });
    
});

//Script for image carousel
const images = [
    "../lizberries/lizberriesPhotos/photo_carousel/13-shooting-24.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/14-shooting-24.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/15-shooting-24.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/1-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/2-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/3-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/4-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/5-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/6-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/7-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/8-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/9-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/10-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/11-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/12-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/13-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/14-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/15-live.webp",
    "../lizberries/lizberriesPhotos/photo_carousel/16-live.webp"
];

const imgPress = [
    "../lizberries/lizberriesPhotos/pressImages/limerick-post_01_2023.webp",
    "../lizberries/lizberriesPhotos/pressImages/limerick-post_01_2024.webp",
    "../lizberries/lizberriesPhotos/pressImages/limerick-post_06_2025.webp",
    "../lizberries/lizberriesPhotos/pressImages/limerick-post_07_2025.webp",
    "../lizberries/lizberriesPhotos/pressImages/web-lombardia_11_2024.webp",
    "../lizberries/lizberriesPhotos/pressImages/la-repubblica_03_2025.webp",
    "../lizberries/lizberriesPhotos/pressImages/la-stampa_03_2019.webp",
    "../lizberries/lizberriesPhotos/pressImages/corriere-milano_03_2025.webp",
    "../lizberries/lizberriesPhotos/pressImages/la-martesana_05_2024.webp"
];

// Funzione per caricare dinamicamente le immagini
function loadImages() {
    const container = document.getElementById('dynamicImageContainer');

    let picCount = 1;

    if (images.length > 0) {
        images.forEach(image => {
            const imgElement = `
                <div class="item">
                    <a href="${image}" class="fancylight popup-btn" data-fancybox-group="light"
                    aria-label="Visualizza l'immagine ${picCount} della galleria fotografica">
                        <img class="img-fluid max-height-155" src="${image}" alt="">
                    </a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', imgElement);
            picCount++;
        });
    }
}

// Carica le immagini al caricamento della pagina
document.addEventListener('DOMContentLoaded', loadImages);

function loadPressImages() {
    const container = document.getElementById('press-gallery');

    let picPressCount = 1;

    if (imgPress.length > 0) {
        imgPress.forEach((prsimage, index) => {
            // Extract the filename from the image path
            const filename = prsimage.split('/').pop().split('.')[0];
            // Apply the transformation rules
            let altText = filename.split('_')[0].replace(/-/g, ' ');
            // Capitalize the first character and the character after each space
            altText = altText.replace(/\b\w/g, char => char.toUpperCase());

            const rotation = Math.random() * 2 - 1;
            //console.log(`Image ${index + 1}: ${prsimage}, Rotation: ${rotation}, Alt Text: ${altText}`);

            const prsimgElement = `
                <div class="polaroid" style="--rotation: ${rotation}">
                    <a href="${prsimage}" class="image-link" aria-label="Visualizza l'immagine ${picPressCount} della sezione Press">
                        <img src="${prsimage}" alt="${altText}" class="img-fluid">
                    </a>
                    <div class="caption">${altText}</div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', prsimgElement);
            picPressCount++;
        });
    }

    //Script per aprire le immagini in Press in modalità lightbox 
    $('.image-link').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });
}

// Carica le immagini al caricamento della pagina
document.addEventListener('DOMContentLoaded', loadPressImages);

// Gestione del form per il download di MusicopoLiz
// IMPORTANT: Configure Cloudflare Worker first following instructions in MusicopoLiz/worker/SETUP.md
// Replace the URL below with your Worker URL
const MUSICOPOLIZ_WORKER_URL = 'https://musicopoliz-download.lizberries.workers.dev';

document.addEventListener('DOMContentLoaded', function() {
    const musicopolizForm = document.getElementById('musicopolizForm');
    
    if (musicopolizForm) {
        musicopolizForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const password = document.getElementById('downloadPassword').value;
            const messageDiv = document.getElementById('downloadMessage');
            const messageText = document.getElementById('downloadMessageText');
            const submitBtn = musicopolizForm.querySelector('button[type="submit"]');
            
            // Disable button during request
            submitBtn.disabled = true;
            
            // Show loading message
            messageText.textContent = 'Verifying...';
            messageText.className = 'text-info font-weight-bold';
            messageDiv.style.display = 'block';
            
            try {
                // Call Cloudflare Worker to validate password and download file
                const response = await fetch(MUSICOPOLIZ_WORKER_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password: password })
                });
                
                if (response.ok) {
                    // Password correct - download file
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'MusicopoLiz.zip';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    
                    // Show success message
                    messageText.textContent = 'Download started successfully!';
                    messageText.className = 'text-success font-weight-bold';
                    
                    // Reset form after 3 seconds
                    setTimeout(function() {
                        musicopolizForm.reset();
                        messageDiv.style.display = 'none';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    // Wrong password or other error
                    const errorData = await response.json();
                    messageText.textContent = errorData.error || 'Download error';
                    messageText.className = 'text-danger font-weight-bold';
                    submitBtn.disabled = false;
                    
                    // Hide message after 3 seconds
                    setTimeout(function() {
                        messageDiv.style.display = 'none';
                    }, 3000);
                }
            } catch (error) {
                console.error('Download error:', error);
                messageText.textContent = 'Connection error. Please try again.';
                messageText.className = 'text-danger font-weight-bold';
                submitBtn.disabled = false;
                
                setTimeout(function() {
                    messageDiv.style.display = 'none';
                }, 3000);
            }
        });
    }
});
