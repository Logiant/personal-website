varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPos;

varying vec2 vUv;

uniform sampler2D texture;

void main() {

//	vec3 light = vec3(-0.45, 0.2, 1.0);

//	light = normalize(light);

//	float dp = max(0.9, dot(vNormal, light));
        
    
//    gl_FragColor = vec4(vColor/255.0, 1.0);
    gl_FragColor = texture2D(texture, vUv);// vec2(0.5, 0.5));
}