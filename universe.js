// Lien du modèle: https://www.thingiverse.com/thing:3084466
// Lien du skybox: https://www.humus.name/index.php?page=Cubemap&item=SantaMariaDeiMiracoli

"use strict";
import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';

let scene, camera, renderer, canvas;  // Bases pour le rendu Three.js
// Variable pour stocker la lumière directionnelle.
let directionalLight;
// Variable pour les contrôles de la caméra.
let controls;
// Variable pour le matériau à appliquer sur les objets 3D.
let material; 
// Variable pour l'effet de contour appliqué au modèle
let outlineEffect;

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}

/* Création de la scène 3D */
function createScene() {
    // Initialisation de la scène
    scene = new THREE.Scene();
    // Définition du fond de la scène avec une couleur blanche
    scene.background = new THREE.Color(0xffffff);

    // Ajout d'une caméra perspective avec un champ de vision de 75 degrés
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    // Positionnement de la caméra (x, y, z)
    camera.position.set(0, 0, 5);

    // Création et ajout d'une lumière directionnelle
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Lumière blanche avec intensité maximale
    directionalLight.position.set(0, 0, 1); // Position relative à la caméra pour suivre sa vue
    camera.add(directionalLight); // Ajout de la lumière directionnelle à la caméra

    // Ajout d'une lumière ambiante 
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Lumière blanche avec faible intensité
    scene.add(ambientLight); // Ajout de la lumière ambiante à la scène

    scene.add(directionalLight); // Ajout de la lumière directionnelle à la scène
}


function createEnvironment() {
    // Création d'un chargeur de texture cubique pour charger les images du skybox
    const loader = new THREE.CubeTextureLoader();

    // Chargement des six images constituant la skybox.
    const textureCube = loader.load([
        'SantaMariaDeiMiracoli/posx.jpg', // face positive de l'axe x (droite)
        'SantaMariaDeiMiracoli/negx.jpg', // face négative de l'axe x (gauche)
        'SantaMariaDeiMiracoli/posy.jpg', // face positive de l'axe y (haut)
        'SantaMariaDeiMiracoli/negy.jpg', // face négative de l'axe y (bas)
        'SantaMariaDeiMiracoli/posz.jpg', // face positive de l'axe z (avant)
        'SantaMariaDeiMiracoli/negz.jpg'  // face négative de l'axe z (arrière)
    ]);

    // Application de la texture cubique comme arrière-plan de la scène
    scene.background = textureCube;
}


function createMaterial(vertShader, fragShader){
    var x = 0, y = 0, z = 1, w = 0.0; // coordonnees de la lumière
    // Création d'un objet contenant les uniformes pour le shader
    const uniforms = {
        // Direction de la lumière pour le calcul de l'éclairage dans le shader (normalisée pour une longueur unitaire)
        lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },

        // Position de la caméra pour le calcul de l'éclairage et des effets basés sur la vue
        viewPosition: { value: camera.position },
        lightPosition: { type: 'v4', value: new THREE.Vector4(x, y, z, w) }
    }

    // Création d'un matériau personnalisé utilisant les shaders fournis en param
    // Les uniforms sont passés aux shaders pour un comportement dynamique
    const toonShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vertShader,
        fragmentShader: fragShader,
        uniforms: uniforms
    })

    // Renvoi du matériau créé pour utilisation sur le modele
    return toonShaderMaterial
}


function animate() {
    requestAnimationFrame(animate);

    // Dessine la scène avec la caméra actuelle
    renderer.render(scene, camera);

    // Mise à jour des uniformes dans le matériau du shader
    if (material && material.uniforms && material.uniforms.lightDirection) {
        // Convertit la position de la lumière en direction relative à la caméra
        var lightDirection = directionalLight.position.clone().sub(camera.position).normalize();
        material.uniforms.lightDirection.value = lightDirection;
    }

    // Ajoute la caméra à la scène
    scene.add(camera); 

    // Met à jour les contrôles de la caméra
    controls.update();


    // Dessiner un contour autour du modele
    outlineEffect.render(scene, camera);
}


function loadSTLModel() {
    const loader = new STLLoader();

    // Chargement du modèle STL
    loader.load('low_drogon-scaled.stl', function (geometry) {

        // Charger les shader depuis les fichiers
        const vertexShaderSource = loadFile("./shader.vert");
        const fragmentShaderSource = loadFile("./shader.frag");

        // Création du matériau shader à partir des sources chargées
        material = createMaterial(vertexShaderSource, fragmentShaderSource);

        // Création d'un mesh en utilisant la géométrie du modèle STL et le matériau shader
        const mesh = new THREE.Mesh(geometry, material);

        // Redimensionnement et positionnement du modèle
        mesh.scale.set(0.04, 0.04, 0.04);
        // Rotation pour orienter correctement le modèle
        mesh.rotation.set(-Math.PI / 2, 0, 0);
        // Positionnement du modèle dans la scène
        mesh.position.set(0, -1, 0);

        // Ajout du modèle à la scène
        scene.add(mesh);
    });
}



function init() {
    try {
        canvas = document.getElementById("canvas");
        renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );

        // Initialiser OutlineEffect avec le renderer
        outlineEffect = new OutlineEffect(renderer, {
            defaultColor: new THREE.Color(0x000000), // Couleur noire pour le contour
            defaultAlpha: 0.8, // Opacité du contour 
            defaultThickness: 0.01 // Épaisseur du contour
        });
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML="<p><b>Sorry, an error occurred:<br>" +
            e + "</b></p>";
        return;
    }
    
    // Création de la scène 3D
    createScene();
    createEnvironment();

    loadSTLModel();
    controls = new ArcballControls(camera, renderer.domElement);

    // Animation de la scèene (appelée toutes les 30 ms)
    animate();
}

init();