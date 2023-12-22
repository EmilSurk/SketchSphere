// declaration des varyings
varying vec3 vInterpolatedNormal;
varying vec3 vInterpolatedLight;

// Declaration de l'uniforme
uniform vec4 lightPosition;

void main() {
    vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * worldPosition;

    // Interpolation de la normale
    vInterpolatedNormal = normalize(normalMatrix * normal);

    // Interpolation de la direction de la lumière
    if (lightPosition.w == 0.0) {
        vInterpolatedLight = normalize(lightPosition.xyz);
    } else {
        vInterpolatedLight = normalize((lightPosition.xyz / lightPosition.w) - worldPosition.xyz);
    }
}
