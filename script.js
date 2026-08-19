// --- CARGA DE DADES DES DE LOCALSTORAGE ---
let biblioteca = JSON.parse(localStorage.getItem('cozy_biblioteca')) || [
    { id: 1, titol: "El nom del vent", autor: "Patrick Rothfuss", tipus: "llibres", estat: "progres", portada: "📖" },
    { id: 2, titol: "El viatge de Chihiro", autor: "Studio Ghibli", tipus: "pelis", estat: "acabats", portada: "🎬" }
];

let forumPosts = JSON.parse(localStorage.getItem('cozy_forum')) || [
    {
        id: 1,
        usuari: "Laura_Reads",
        avatar: "🌸",
        titol: "El nom del vent",
        text: "Una lectura imprescindible per als amants de la fantasia. L'estil d'escriptura és màgic!",
        puntuacio: 5,
        comentaris: ["Totalment d'acord!", "És dels meus llibres preferits."]
    }
];

let perfilUsuari = JSON.parse(localStorage.getItem('cozy_perfil')) || {
    nom: "Usuari/a Cozy",
    bio: "Amant de la lectura i el cinema",
    avatar: "📚"
};

let elsMeusAmics = JSON.parse(localStorage.getItem('cozy_amics')) || [];

let peticionsPendents = JSON.parse(localStorage.getItem('cozy_peticions')) || [
    { id: 101, nom: "Marc_Cine", avatar: "🎬", bio: "Sèries i pel·lícules" }
];

let usuarisBase = [
    { id: 1, nom: "Laura_Reads", avatar: "🌸", bio: "Amant de la lectura" },
    { id: 2, nom: "Marc_Cine", avatar: "🎬", bio: "Sèries i pel·lícules" },
    { id: 3, nom: "Alex_Cozy", avatar: "☕", bio: "Llibres i cafè" }
];

let filtreActiu = 'tots';
let textCerca = '';
let textCercaForum = '';
let darreraRecomanacio = null;

// --- GUARDAR DADES A LOCALSTORAGE ---
function guardarDades() {
    localStorage.setItem('cozy_biblioteca', JSON.stringify(biblioteca));
    localStorage.setItem('cozy_forum', JSON.stringify(forumPosts));
    localStorage.setItem('cozy_perfil', JSON.stringify(perfilUsuari));
    localStorage.setItem('cozy_amics', JSON.stringify(elsMeusAmics));
    localStorage.setItem('cozy_peticions', JSON.stringify(peticionsPendents));
}

// --- RENDERING DE LA BIBLIOTECA ---
function mostrarBiblioteca() {
    let llista = document.getElementById('llista-contingut');
    if (!llista) return;
    
    llista.innerHTML = '';

    let elementsFiltrats = biblioteca.filter(item => {
        let coincideixFiltre = (filtreActiu === 'tots') || (item.tipus === filtreActiu);
        let coincideixCerca = item.titol.toLowerCase().includes(textCerca.toLowerCase()) || 
                               item.autor.toLowerCase().includes(textCerca.toLowerCase());
        
        return coincideixFiltre && coincideixCerca;
    });

    if (elementsFiltrats.length === 0) {
        llista.innerHTML = '<p class="sense-resultats">No s&apos;han trobat coincidències.</p>';
    } else {
        elementsFiltrats.forEach(item => {
            let iconaDefecte = item.tipus === 'pelis' ? '🎬' : item.tipus === 'series' ? '📺' : '📖';
            
            let portadaHTML = (item.portada && item.portada.startsWith('data:image'))
                ? `<img src="${item.portada}" alt="Portada" style="width: 50px; height: 70px; object-fit: cover; border-radius: 6px;">`
                : `<div class="portada-placeholder" style="font-size: 30px;">${item.portada || iconaDefecte}</div>`;
            
            let cardHTML = `
                <div class="card">
                    ${portadaHTML}
                    <div class="card-info">
                        <h3>${item.titol}</h3>
                        <p class="autor">${item.autor}</p>
                        <div class="card-accions">
                            <select onchange="canviarEstat(${item.id}, this.value)" class="select-estat-card">
                                <option value="progres" ${item.estat === 'progres' ? 'selected' : ''}>En progrés</option>
                                <option value="pendents" ${item.estat === 'pendents' ? 'selected' : ''}>Pendent</option>
                                <option value="acabats" ${item.estat === 'acabats' ? 'selected' : ''}>Acabat</option>
                            </select>
                            <button onclick="esborrarElement(${item.id})" class="boto-esborrar" title="Esborrar">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
            llista.innerHTML += cardHTML;
        });
    }

    actualitzarEstadistiquesPerfil();
}

function actualitzarEstadistiquesPerfil() {
    let total = document.getElementById('total-guardats');
    let totalLlibres = document.getElementById('total-llibres');
    let totalPelis = document.getElementById('total-pelis');
    let totalSeries = document.getElementById('total-series');

    if (total) total.textContent = biblioteca.length;
    if (totalLlibres) totalLlibres.textContent = biblioteca.filter(i => i.tipus === 'llibres').length;
    if (totalPelis) totalPelis.textContent = biblioteca.filter(i => i.tipus === 'pelis').length;
    if (totalSeries) totalSeries.textContent = biblioteca.filter(i => i.tipus === 'series').length;
}

function carregarDadesPerfil() {
    let nomDisp = document.getElementById('nom-usuari-display');
    let bioDisp = document.getElementById('bio-usuari-display');
    let avatarDisp = document.getElementById('avatar-display');

    if (nomDisp) nomDisp.textContent = perfilUsuari.nom;
    if (bioDisp) bioDisp.textContent = perfilUsuari.bio;
    if (avatarDisp) avatarDisp.textContent = perfilUsuari.avatar;
}

// --- FÒRUM ---
function mostrarForum() {
    let llistaForum = document.getElementById('llista-forum');
    if (!llistaForum) return;

    llistaForum.innerHTML = '';

    let postsFiltrats = forumPosts.filter(post => {
        return post.titol.toLowerCase().includes(textCercaForum.toLowerCase()) || 
               post.text.toLowerCase().includes(textCercaForum.toLowerCase());
    });

    if (postsFiltrats.length === 0) {
        llistaForum.innerHTML = '<p class="sense-resultats">No hi ha publicacions que coincideixin.</p>';
        return;
    }

    postsFiltrats.forEach(post => {
        let estrelles = '⭐'.repeat(post.puntuacio);
        let comentarisHTML = post.comentaris.map(c => `<div class="comentari-item">💬 ${c}</div>`).join('');

        let postHTML = `
            <div class="post-card">
                <div class="post-capcalera">
                    <div class="usuari-info">
                        <span class="avatar">${post.avatar}</span>
                        <strong>${post.usuari}</strong>
                    </div>
                    <span class="post-estrelles">${estrelles}</span>
                </div>
                <div class="post-titol-llibre">📖 ${post.titol}</div>
                <p>${post.text}</p>
                
                <div class="comentaris-contenidor">
                    ${comentarisHTML}
                    <form onsubmit="afegirComentari(event, ${post.id})" class="form-comentari">
                        <input type="text" id="input-comentari-${post.id}" placeholder="Respon o comenta..." required>
                        <button type="submit">Enviar</button>
                    </form>
                </div>
            </div>
        `;
        llistaForum.innerHTML += postHTML;
    });
}

function afegirComentari(e, postId) {
    e.preventDefault();
    let input = document.getElementById(`input-comentari-${postId}`);
    if (input && input.value.trim() !== '') {
        let post = forumPosts.find(p => p.id === postId);
        if (post) {
            post.comentaris.push(input.value.trim());
            guardarDades();
            mostrarForum();
        }
    }
}

// --- GESTIÓ D'AMICS ---
function actualitzarPantallaAmics() {
    let contenidorPeticions = document.getElementById('llista-peticions');
    let contenidorAmics = document.getElementById('llista-amics');

    if (contenidorPeticions) {
        contenidorPeticions.innerHTML = '';
        if (peticionsPendents.length === 0) {
            contenidorPeticions.innerHTML = '<p style="padding: 10px; color: #8c736c; font-size: 13px;">No tens cap petició pendent.</p>';
        } else {
            peticionsPendents.forEach(u => {
                contenidorPeticions.innerHTML += `
                    <div class="card-usuari" style="display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">${u.avatar}</span>
                            <div>
                                <strong style="color: #5a4038; font-size: 14px;">${u.nom}</strong>
                                <p style="margin: 0; font-size: 12px; color: #8c736c;">${u.bio}</p>
                            </div>
                        </div>
                        <div>
                            <button class="boto-acceptar" onclick="acceptarAmic(${u.id})">Acceptar</button>
                            <button class="boto-rebutjar" onclick="rebutjarAmic(${u.id})">Rebutjar</button>
                        </div>
                    </div>
                `;
            });
        }
    }

    if (contenidorAmics) {
        contenidorAmics.innerHTML = '';
        if (elsMeusAmics.length === 0) {
            contenidorAmics.innerHTML = '<p style="padding: 10px; color: #8c736c; font-size: 13px;">Encara no has afegit cap amic.</p>';
        } else {
            elsMeusAmics.forEach(u => {
                contenidorAmics.innerHTML += `
                    <div class="card-usuari" style="display: flex; align-items: center; gap: 10px; padding: 8px;">
                        <span style="font-size: 20px;">${u.avatar}</span>
                        <div>
                            <strong style="color: #5a4038; font-size: 14px;">${u.nom}</strong>
                            <p style="margin: 0; font-size: 12px; color: #8c736c;">Amic/ga Cozy</p>
                        </div>
                    </div>
                `;
            });
        }
    }
}

window.acceptarAmic = function(id) {
    let index = peticionsPendents.findIndex(u => u.id === id);
    if (index !== -1) {
        elsMeusAmics.push(peticionsPendents[index]);
        peticionsPendents.splice(index, 1);
        guardarDades();
        actualitzarPantallaAmics();
    }
};

window.rebutjarAmic = function(id) {
    peticionsPendents = peticionsPendents.filter(u => u.id !== id);
    guardarDades();
    actualitzarPantallaAmics();
};

function esborrarElement(id) {
    biblioteca = biblioteca.filter(item => item.id !== id);
    guardarDades();
    mostrarBiblioteca();
}

function canviarEstat(id, nouEstat) {
    let element = biblioteca.find(item => item.id === id);
    if (element) {
        element.estat = nouEstat;
        guardarDades();
    }
}

// --- INICIALITZACIÓ ESDEVENIMENTS ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDadesPerfil();
    mostrarBiblioteca();
    mostrarForum();
    actualitzarPantallaAmics();

    // Navegació entre seccions
    document.querySelectorAll('.boto-nav').forEach(boto => {
        boto.addEventListener('click', (e) => {
            document.querySelectorAll('.boto-nav').forEach(b => b.classList.remove('actiu'));
            document.querySelectorAll('.seccio').forEach(s => s.classList.remove('activa'));

            let botoClicat = e.currentTarget;
            botoClicat.classList.add('actiu');
            
            let seccioId = botoClicat.getAttribute('data-seccio');
            let seccioDesti = document.getElementById(seccioId);
            if (seccioDesti) seccioDesti.classList.add('activa');
        });
    });

    // Edició de perfil
    let botoEditar = document.getElementById('boto-editar-perfil');
    let formPerfil = document.getElementById('formulari-perfil');
    let botoGuardarPerfil = document.getElementById('boto-guardar-perfil');

    if (botoEditar && formPerfil) {
        botoEditar.addEventListener('click', () => {
            formPerfil.style.display = (formPerfil.style.display === 'block') ? 'none' : 'block';
        });
    }

    if (botoGuardarPerfil) {
        botoGuardarPerfil.addEventListener('click', () => {
            let nouNom = document.getElementById('input-nom-perfil').value;
            let novaBio = document.getElementById('input-bio-perfil').value;
            let nouAvatar = document.getElementById('select-avatar-perfil').value;

            if (nouNom.trim() !== '') perfilUsuari.nom = nouNom;
            if (novaBio.trim() !== '') perfilUsuari.bio = novaBio;
            perfilUsuari.avatar = nouAvatar;

            guardarDades();
            carregarDadesPerfil();
            formPerfil.style.display = 'none';
        });
    }

    // Formulari nou element biblioteca amb Imatge en Base64
    let formulari = document.getElementById('formulari-nou');
    let formulariContenidor = document.getElementById('formulari-afegir');
    let botoAfegir = document.querySelector('.boto-afegir');

    if (botoAfegir && formulariContenidor) {
        botoAfegir.addEventListener('click', () => {
            formulariContenidor.style.display = (formulariContenidor.style.display === 'block') ? 'none' : 'block';
        });
    }

    if (formulari) {
        formulari.addEventListener('submit', (e) => {
            e.preventDefault();

            let titolNou = document.getElementById('input-titol').value;
            let autorNou = document.getElementById('input-autor').value;
            let tipusNou = document.getElementById('select-tipus').value;
            let estatNou = document.getElementById('select-estat').value;
            let fitxerFoto = document.getElementById('input-portada-llibre')?.files[0];

            let processarIafegir = (portadaBase64) => {
                biblioteca.push({
                    id: Date.now(),
                    titol: titolNou,
                    autor: autorNou,
                    tipus: tipusNou,
                    estat: estatNou,
                    portada: portadaBase64
                });

                guardarDades();
                mostrarBiblioteca();
                formulari.reset();
                if (formulariContenidor) formulariContenidor.style.display = 'none';
            };

            if (fitxerFoto) {
                let reader = new FileReader();
                reader.onloadend = () => processarIafegir(reader.result);
                reader.readAsDataURL(fitxerFoto);
            } else {
                processarIafegir(null);
            }
        });
    }

    // Cercadors
    let inputCerca = document.getElementById('input-cerca');
    if (inputCerca) {
        inputCerca.addEventListener('input', (e) => {
            textCerca = e.target.value;
            mostrarBiblioteca();
        });
    }

    let inputCercaForum = document.getElementById('input-cerca-forum');
    if (inputCercaForum) {
        inputCercaForum.addEventListener('input', (e) => {
            textCercaForum = e.target.value;
            mostrarForum();
        });
    }

    // Cercador d'Usuaris
    let inputCercaUsuaris = document.getElementById('input-cerca-usuaris');
    let contenidorResultats = document.getElementById('resultats-usuaris');

    if (inputCercaUsuaris && contenidorResultats) {
        inputCercaUsuaris.addEventListener('input', (e) => {
            let text = e.target.value.toLowerCase().trim();
            contenidorResultats.innerHTML = '';

            if (text === '') return;

            let trobats = usuarisBase.filter(u => u.nom.toLowerCase().includes(text));

            if (trobats.length === 0) {
                contenidorResultats.innerHTML = '<p style="padding: 10px; color: #8c736c; font-size: 13px;">No s\'ha trobat cap usuari.</p>';
            } else {
                trobats.forEach(u => {
                    contenidorResultats.innerHTML += `
                        <div class="card-usuari" style="display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span>${u.avatar}</span>
                                <div>
                                    <strong>${u.nom}</strong>
                                    <p style="margin: 0; font-size: 12px; color: #8c736c;">${u.bio}</p>
                                </div>
                            </div>
                            <button class="boto-afegir-amic" onclick="alert('Petició d\\'amistat enviada a ${u.nom}!')">+ Afegir</button>
                        </div>
                    `;
                });
            }
        });
    }

    // Formulari Fòrum
    let formulariPost = document.getElementById('formulari-post');
    if (formulariPost) {
        formulariPost.addEventListener('submit', (e) => {
            e.preventDefault();

            let titol = document.getElementById('post-titol').value;
            let text = document.getElementById('post-text').value;
            let puntuacio = parseInt(document.getElementById('post-puntuacio').value);

            forumPosts.unshift({
                id: Date.now(),
                usuari: perfilUsuari.nom,
                avatar: perfilUsuari.avatar,
                titol: titol,
                text: text,
                puntuacio: puntuacio,
                comentaris: []
            });

            guardarDades();
            mostrarForum();
            formulariPost.reset();
        });
    }

    // Pestanyes de filtres
    document.querySelectorAll('.pestanya').forEach(boto => {
        boto.addEventListener('click', (e) => {
            document.querySelectorAll('.pestanya').forEach(b => b.classList.remove('activa'));
            e.target.classList.add('activa');

            filtreActiu = e.target.getAttribute('data-filtre');
            mostrarBiblioteca();
        });
    });

    // Recomanador per IA
    let botoRecomanar = document.getElementById('boto-recomanar-ia');
    let caixaRecomanacio = document.getElementById('caixa-recomanacio');
    let textRecomanacio = document.getElementById('text-recomanacio');
    let botoAfegirRecomanat = document.getElementById('boto-afegir-recomanat');

    if (botoRecomanar) {
        botoRecomanar.addEventListener('click', () => {
            const catalogRecomanacions = [
                { titol: "La trena", autor: "Laetitia Colombani", tipus: "llibres" },
                { titol: "Heartstopper", autor: "Alice Oseman", tipus: "series" },
                { titol: "Gilmore Girls", autor: "Amy Sherman-Palladino", tipus: "series" },
                { titol: "Paddington 2", autor: "Paul King", tipus: "pelis" }
            ];

            let noGuardats = catalogRecomanacions.filter(rec => 
                !biblioteca.some(item => item.titol.toLowerCase() === rec.titol.toLowerCase())
            );

            if (noGuardats.length > 0) {
                darreraRecomanacio = noGuardats[Math.floor(Math.random() * noGuardats.length)];
                textRecomanacio.textContent = `Et recomanem "${darreraRecomanacio.titol}" (${darreraRecomanacio.autor}).`;
                caixaRecomanacio.style.display = 'block';
            } else {
                textRecomanacio.textContent = "Ja tens tots els nostres suggeriments a la teva llista!";
                caixaRecomanacio.style.display = 'block';
            }
        });
    }

    if (botoAfegirRecomanat) {
        botoAfegirRecomanat.addEventListener('click', () => {
            if (darreraRecomanacio) {
                biblioteca.push({
                    id: Date.now(),
                    titol: darreraRecomanacio.titol,
                    autor: darreraRecomanacio.autor,
                    tipus: darreraRecomanacio.tipus,
                    estat: "pendents",
                    portada: null
                });
                guardarDades();
                mostrarBiblioteca();
                caixaRecomanacio.style.display = 'none';
            }
        });
    }

    // Escàner d'estanteries amb OCR
    let inputFoto = document.getElementById('input-foto-estanteria');
    if (inputFoto) {
        inputFoto.addEventListener('change', async (e) => {
            let fitxer = e.target.files[0];
            if (!fitxer) return;

            alert("Processant la imatge... Això pot trigar uns segons.");

            try {
                const result = await Tesseract.recognize(fitxer, 'cat+spa+eng');
                let línies = result.data.text.split('\n');

                let trobats = 0;
                línies.forEach(línia => {
                    let textNetejat = línia.trim();
                    if (textNetejat.length > 3) {
                        biblioteca.push({
                            id: Date.now() + Math.random(),
                            titol: textNetejat,
                            autor: "Detectat per foto",
                            tipus: "llibres",
                            estat: "pendents",
                            portada: null
                        });
                        trobats++;
                    }
                });

                guardarDades();
                mostrarBiblioteca();
                alert(`S'han afegit ${trobats} títols detectats a la teva biblioteca!`);
            } catch (error) {
                console.error("Error en llegir la imatge:", error);
                alert("No s'ha pogut llegir el text de la imatge.");
            }
        });
    }
});