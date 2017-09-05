uniform float minR;
uniform float maxR;


varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vPos;

varying vec2 vUv;



//color definitions
const vec3 ice   = vec3(255, 248, 224);
const vec3 rock  = vec3(238, 238, 224);
const vec3 grass = vec3( 34, 139,  34);
const vec3 dirt  = vec3(199,  97,  20);
const vec3 water = vec3( 32, 178, 170);

void main() {

    vUv = uv;
    
    
    //caluclate terrain height and compare to the range generated
    float R = sqrt((position.x*position.x) + (position.y*position.y) + (position.z*position.z));
    R = (R - minR)/(maxR-minR);
    
//    R = 0.5;
    
    //set the vertex color based on height
    if (R < 0.6) {
        vColor = water;
    } else if (R < 0.7) {
        vColor = dirt;
    } else if (R < 0.8) {
        vColor = grass;
    } else if (R < 0.9) {
        vColor = rock;
    } else {
        vColor = ice;
    }
    
    vNormal     = vec3(normal);
    vPos        = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}