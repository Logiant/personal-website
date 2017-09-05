var scene, camera, renderer;
var geometry, material, mesh;
var timer;

var vertShader, fragShader;

loadShaders();
init();
buildMesh();
animate();

function init() {

    var WIDTH = 400,
        HEIGHT = 300,
        VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 1000;
    
    

    renderer = new THREE.WebGLRenderer();
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene = new THREE.Scene();


    renderer.setSize(WIDTH, HEIGHT);

    camera.position.z = 300;


    scene.add(camera);

    document.getElementById("shaderBox").appendChild(renderer.domElement);
    var container = document.querySelector("#shaderBox");
    container.style.width = WIDTH.toString() + "px";
    container.style.height = HEIGHT.toString() + "px";

    timer = new THREE.Clock(true);
}



function buildMesh() {
    var radius = 50,
        segments = 16,
        rings = 16;
    
    var squareTexture = THREE.ImageUtils.loadTexture("img/texture.jpg");

    var uniforms = {
        color: {
            type: '3f',
            value: [0.0/255, 104.0/255, 139.0/255]
        },
        uTex: {
            type: 't',
            value: squareTexture
        }
    };

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        map: squareTexture,
        vertexShader: vertShader,
        fragmentShader: fragShader
    });


    var cellSize = 50;
    var width = 10;
    var height = 10;
    
    var vOff = 0;
    
    var v1, v2, v3, v4
    
    var geom = new THREE.Geometry();
    
    
    for (i=1;i<=width;i++) {
        for (j=1;j<=height;j++) {
            
                
        v1 = new THREE.Vector3(width*(i-1),height*(j-1), 0);
        v2 = new THREE.Vector3(width*i    ,height*j    , 0);
        v3 = new THREE.Vector3(width*(i-1),height*j    , 0);
        v4 = new THREE.Vector3(width*i    ,height*(j-1), 0);
    
        geom.vertices.push(v1);
        geom.vertices.push(v2);
        geom.vertices.push(v3);
        geom.vertices.push(v4);
    
        geom.faces.push(new THREE.Face3(0+vOff, 1+vOff, 2+vOff));
        geom.faces.push(new THREE.Face3(0+vOff, 3+vOff, 1+vOff));
        vOff += 4;
            
        }
    }

 

    
    
    
    
    
    geom.computeFaceNormals();
    mesh = new THREE.Mesh(geom, material);
    
    mesh.position.x = -width*cellSize/10;
    mesh.position.y = -height*cellSize/10;

    mesh.position.z = -50;
   

    
    //   mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), material);
    
    scene.add(mesh);

    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 5;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    scene.add(pointLight);



}

function animate() {

    requestAnimationFrame(animate);
    
    var dt = timer.getDelta();
    var delta = timer.getElapsedTime();
    
//    mesh.rotation.x += dt;
    mesh.rotation.x = Math.sin(delta)/3;

    renderer.render(scene, camera);

}



function loadShaders() {
    
    $.ajax({
        url: "shaders/vert.glsl",
        async: false,
        success: function (vs) {
            vertShader = vs;
        }        
    });

    $.ajax({
        url: "shaders/frag.glsl",
        async: false,
        success: function (fs) {
            fragShader = fs;
        }
    });
}