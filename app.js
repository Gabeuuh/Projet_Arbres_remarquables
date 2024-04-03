/* =================== */
/* GET DATA */
/* =================== */

// Reference : https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON
// Request : https://datarmor.cotesdarmor.fr/datasets/arbres-remarquables-des-cotes-d'armor/api-doc

/*
Call The API an return the remarquable trees of Côtes-d'Armor
*/
let map
let ID = 26

let treeIcon = L.icon({
    iconUrl: './images/marker.png',
    iconSize:     [38, 60],
    iconAnchor:   [19, 60],
    popupAnchor:  [0, 62]
})


async function getTrees() {
    const requestURL =
        "https://datarmor.cotesdarmor.fr/data-fair/api/v1/datasets/arbres-remarquables-des-cotes-d'armor/lines?size=1000&q=typearbre=remarquable"; // Fournir l'url
    const request = new Request(requestURL)

    const response = await fetch(request)
    const respJSON = await response.json() // Fournir la fonction jusque-là ?

    const trees = respJSON.results

    return trees
}

/* The trees from the API */
const TREES = await getTrees()


//Fonction pour afficher la map
function showMap(lat, long, zoom) {
    map = L.map('map').setView([lat, long], zoom);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

}
showMap(48.6, -2.8, 9)

// Fonction pour afficher le détail d'un arbre en fonction de son ID
function showTree(ID) {
    if (TREES[ID]._geopoint) {

        const base = document.querySelector(".tree-focus")
        base.innerText = ""

        const title = document.createElement("h3")
        title.innerText = TREES[ID].Essence
        base.append(title)

        const subtitle = document.createElement("h4")
        subtitle.innerText = "à " + TREES[ID].Commune
        base.append(subtitle)

        if (TREES[ID].Dimensioncirconference) {
            const circonf = document.createElement("p")
            circonf.innerText = "Circonférence : " + TREES[ID].Dimensioncirconference + " m"
            base.append(circonf)
        }
        if (TREES[ID].dimensionenvergure) {
            const enverg = document.createElement("p")
            enverg.innerText = "Envergure : " + TREES[ID].dimensionenvergure + " m"
            base.append(enverg)
        }
        return base
    }

}


showTree(ID)


// Fonction pour afficher les marqueurs dans un layer afin de pouvoir les supprimer lors du trie
let markers
function showMarker() {
    markers = new L.FeatureGroup()
    for (let ID in TREES) {
        if (TREES[ID]._geopoint) {
            let coord = TREES[ID]._geopoint.split(",")
            var markerArbre = L.marker([coord[0], coord[1]], { icon: treeIcon })
            markers.addLayer(markerArbre)


            markerArbre.addEventListener("click", (e) => {
                showTree(ID)
                showPopUp(ID)
            })

        }

    }
    map.addLayer(markers)

}
showMarker()

// Fonction pour afficher une pop-up
function showPopUp(ID) {
    if (TREES[ID]._geopoint) {
        let coord = TREES[ID]._geopoint.split(",")
        if (TREES[ID].Dimensioncirconference) {
            var circonf = '<br> Circonférence : ' + TREES[ID].Dimensioncirconference + ' m'
        }
        else {
            var circonf = " "
        }
        if (TREES[ID].dimensionenvergure) {
            var enverg = '<br> Envergure : ' + TREES[ID].dimensionenvergure + ' m'
        }
        else {
            var enverg = " "
        }
        let desc = 'Essence : ' + TREES[ID].Essence + '<br> Lieu : ' + TREES[ID].Commune + circonf + enverg

        L.popup(coord, { content: desc })
            .openOn(map);
    }
}

const flecheGauche = document.querySelector(".gauche")
const flecheDroite = document.querySelector(".droite")

// Evènement lors du clique sur les flèches droites et gauche ainsi que celle du clavier
flecheDroite.addEventListener("click", (e) => {
    if (ID < TREES.length - 1) {
        ID++
    }
    else {
        ID = 0
    }
    showTree(ID)
    showPopUp(ID)

})

flecheGauche.addEventListener("click", (e) => {
    if (ID > 0) {
        ID--
    }
    else {
        ID = TREES.length - 1
    }
    showTree(ID)
    showPopUp(ID)

})

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") {
        if (ID > 0) {
            ID--
        }
        else {
            ID = TREES.length - 1
        }
        showTree(ID)
        showPopUp(ID)
    }
    else if (e.code === "ArrowRight") {
        if (ID < TREES.length - 1) {
            ID++
        }
        else {
            ID = 0
        }
        showTree(ID)
        showPopUp(ID)

    }
})

// Fonction pour générer le menu déroulant avec les différents types d'essences
function getAllEssence() {
    const tabEssence = []
    TREES.forEach(tree => {
        if (!tabEssence.includes(tree.Essence)) {
            tabEssence.push(tree.Essence)
        }
    })
    let allChoice = document.querySelector('.choice')
    tabEssence.forEach(essence => {
        let oneChoice = document.createElement("option")
        oneChoice.value = essence
        oneChoice.textContent = essence
        allChoice.append(oneChoice)
    })
    return allChoice
}
getAllEssence()

document.addEventListener('change', (e) => {
    let selectedChoice = document.querySelector(".choice").value
    showSort(selectedChoice)
})


// Fonction pour trier en fonction de l'essence sélectionnée
function showSort(selectedChoice) {
    markers.clearLayers()
    for (let ID in TREES) {
        if (TREES[ID].Essence === selectedChoice) {
            showTree(ID)
            showPopUp(ID)
            let coord = TREES[ID]._geopoint.split(",")
            var markerArbre = L.marker([coord[0], coord[1]], { icon: treeIcon })
            markers.addLayer(markerArbre)
        }
    }
    if (selectedChoice === "all") {
        showMarker()
        showTree(ID)
        showPopUp(ID)
    }
    map.addLayer(markers)
}
