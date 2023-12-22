// Précision pour les variables de type float
precision mediump float;

// Varying reçu du vertex shader
varying vec3 vInterpolatedNormal;
varying vec3 vInterpolatedLight;

void main() {
    // Normalisation des normales interpolées
    vec3 normal = normalize(vInterpolatedNormal);
    vec3 lightDir = normalize(vInterpolatedLight);

    // Calcul de l'intensité de la lumière
    float intensity = max(dot(normal, lightDir), 0.0);

    // Utilisation des étapes de luminosité pour créer l'effet toon
    if (intensity > 0.95) intensity = 1.0;
    else if (intensity > 0.5) intensity = 0.7;
    else if (intensity > 0.25) intensity = 0.4;
    else intensity = 0.2;

    // Couleur de base du fragment
    vec3 color = vec3(1.0, 1.0, 0.7); // Couleur


    // Couleur finale avec l'effet toon
    gl_FragColor = vec4(color * intensity, 1.0);
}
