var scene, camera, renderer;
var geometry, material, mesh;
var timer;

var vertShader, fragShader;

var cubeBuddy;
var controls;

//mouse movement
var theta, phi;

loadShaders();
init();
buildMesh();
animate();

function init() {

    var WIDTH = 600,
        HEIGHT = 500,
        VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 1000;


    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);


    renderer.setSize(WIDTH, HEIGHT);

    camera.position.z = 500;
    camera.position.y = 0;
    camera.position.x = 0;


    scene.add(camera);

    document.getElementById("shaderBox").appendChild(renderer.domElement);
    var container = document.querySelector("#shaderBox");
    container.style.width = WIDTH.toString() + "px";
    container.style.height = HEIGHT.toString() + "px";

    timer = new THREE.Clock(true);

    controls = new THREE.TrackballControls(camera, renderer.domElement);

    controls.rotateSpeed = 3.0;
    controls.zoomSpeed = 0.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];
    //controls.addEventListener( 'change', render );

}

 

function buildMesh() {

    var tex = THREE.ImageUtils.loadTexture('/img/lambert.png');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    
    var uniforms = {
        minR: {
            type: 'f',
            value: 0.0
        },
        maxR: {
            type: 'f',
            value: 0.0
        },
        texture: {
            type: 't',
            value: tex
        }
    };

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertShader,
        fragmentShader: fragShader
    });

    var geom = new THREE.Geometry();

    //Build the geometry
    var R = 50;
    var recursionLevel = 4; ////////////////////////////
    // list of faces
    var verts = new Array();
    var faces = new Array();
    var ret = icosphere(recursionLevel);
    verts = ret.verts;
    faces = ret.faces;




    //create heightmap in spherical space
    var nPhi = 50,
        nTh = 100; //heightmap size
    var heightMap = crappyNoise(nPhi, nTh);

    var minR = 100000;
    var maxR = 0;
    //ensure each vertex is at the radius R
    for (var i = 0; i < verts.length; i++) {
        
        var dist = Math.sqrt(verts[i].x*verts[i].x + verts[i].y*verts[i].y + verts[i].z*verts[i].z);

        var delta = R - dist; // calulate offset from the desired height
        
        var dr = {
            x: delta * verts[i].x / dist,
            y: delta * verts[i].y / dist,
            z: delta * verts[i].z / dist
        };
        verts[i] = {
            x: verts[i].x + dr.x,
            y: verts[i].y + dr.y,
            z: verts[i].z + dr.z
        };
    }

    //// create geometry from vert and face arrays ////
    for (var i = 0; i < verts.length; i++) {
        geom.vertices.push(verts[i]);
    }
    
    //generate UV storage
  //  uvs = [];
    geom.faceVertexUvs[0] = [];
    
    ////////////////////////////////////////////////////////////////
    for (var i = 0; i < faces.length; i++) {
        //find length of vertices for normalization
        var v1 = verts[faces[i].a];
        var v2 = verts[faces[i].b];
        var v3 = verts[faces[i].c];
        
        var y1 = v1.y/R;
        var y2 = v2.y/R;
        var y3 = v3.y/R;
        
        
        var angle1 = Math.atan2(v1.x, v1.z)/Math.PI;
        var angle2 = Math.atan2(v2.x, v2.z)/Math.PI;
        var angle3 = Math.atan2(v3.x, v3.z)/Math.PI;
        //correct the seam
        if (angle1*angle2 < 0 || angle1*angle3 < 0) {
            if (angle1 < 0) {
                angle1 += 2;
            }
            if (angle2 < 0) {
                angle2 += 2;
            }
            if (angle3 < 0) {
                angle3 += 2;
            } 
        }
        
        if (Math.abs(y1) == 1) {
    //        angle1 = (angle2 + angle3)/2;
        }
        if (Math.abs(y2) == 1) {
    //        angle2 = (angle1 + angle3)/2;
        }
        if (Math.abs(y3) == 1) {
    //        angle3 = (angle1 + angle2)/2;
        }
        
        uv1 = new THREE.Vector2((angle1+1)/2, (y1+1)/2);
        uv2 = new THREE.Vector2((angle2+1)/2, (y2+1)/2);
        uv3 = new THREE.Vector2((angle3+1)/2, (y3+1)/2);
        
        //calculate vertex normals in X and Y
        geom.faces.push(new THREE.Face3(faces[i].a, faces[i].b, faces[i].c));
        geom.faceVertexUvs[0].push([uv1, uv2, uv3]);
    }

    //compute normals and upload min/max radius to the shader
    geom.uvsNeedUpdate = true;
    geom.computeFaceNormals();
    material.uniforms.minR.value = minR;
    material.uniforms.maxR.value = maxR;

    //Add everything to the scene!
    mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);



    ////cube buddy

    var geo = new THREE.BoxGeometry(50, 50, 50, 1, 1, 1);

    //set the texture regions
    var s1 = [new THREE.Vector2(0.000, 0.333), //US
              new THREE.Vector2(0.250, 0.333),
              new THREE.Vector2(0.250, 0.666),
              new THREE.Vector2(0.000, 0.666)];

    var s2 = [new THREE.Vector2(0.500, 0.333), //india
              new THREE.Vector2(0.750, 0.333),
              new THREE.Vector2(0.750, 0.666),
              new THREE.Vector2(0.500, 0.666)];

    var s3 = [new THREE.Vector2(0.500, 1.000), //canada
              new THREE.Vector2(0.250, 1.000),
              new THREE.Vector2(0.250, 0.666),
              new THREE.Vector2(0.500, 0.666)];

    var s4 = [new THREE.Vector2(0.250, 0.000), //antarctic
              new THREE.Vector2(0.500, 0.000),
              new THREE.Vector2(0.500, 0.333),
              new THREE.Vector2(0.250, 0.333)];

    var s5 = [new THREE.Vector2(0.750, 0.333), //japan
              new THREE.Vector2(1.000, 0.333),
              new THREE.Vector2(1.000, 0.666),
              new THREE.Vector2(0.750, 0.666)];

    var s6 = [new THREE.Vector2(0.250, 0.333), //africa
              new THREE.Vector2(0.500, 0.333),
              new THREE.Vector2(0.500, 0.666),
              new THREE.Vector2(0.250, 0.666)];

    geo.faceVertexUvs[0] = [];

    geo.faceVertexUvs[0][0] = [s1[3], s1[0], s1[2]];
    geo.faceVertexUvs[0][1] = [s1[0], s1[1], s1[2]];

    geo.faceVertexUvs[0][2] = [s2[3], s2[0], s2[2]];
    geo.faceVertexUvs[0][3] = [s2[0], s2[1], s2[2]];

    geo.faceVertexUvs[0][4] = [s3[3], s3[0], s3[2]];
    geo.faceVertexUvs[0][5] = [s3[0], s3[1], s3[2]];

    geo.faceVertexUvs[0][6] = [s4[1], s4[2], s4[0]];
    geo.faceVertexUvs[0][7] = [s4[2], s4[3], s4[0]];

    geo.faceVertexUvs[0][8] = [s5[3], s5[0], s5[2]];
    geo.faceVertexUvs[0][9] = [s5[0], s5[1], s5[2]];

    geo.faceVertexUvs[0][10] = [s6[3], s6[0], s6[2]];
    geo.faceVertexUvs[0][11] = [s6[0], s6[1], s6[2]];


    var mat = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('/img/world_cube.png')
    });

    var cube = new THREE.Mesh(geo, mat);
    scene.add(cube);

    cubeBuddy = cube;


}


function animate() {

    requestAnimationFrame(animate);

    var dt = timer.getDelta();
    var delta = timer.getElapsedTime();

    mesh.rotation.z = -0.4101524;
    mesh.rotation.y += dt/4;

    //   cubeBuddy.rotation.x += dt;
    //    cubeBuddy.rotation.y += dt * 0.513387965;

    controls.update();

    renderer.render(scene, camera);
}

/////////////// Crappy 2d noise function////////////////
function crappyNoise(nPhi, nTh) {
    var dPhI = 10,
        dThI = 10; //resolution?
    var heightMap = new Array(nPhi);
    //initialize to zero
    for (var phi = 0; phi < nPhi; phi++) {
        heightMap[phi] = new Array(nTh);
    }
    // create the initial heightmap
    for (var phi = 0; phi < nPhi; phi += dPhI) {
        for (var theta = 0; theta < nTh; theta += dThI) {
            heightMap[phi][theta] = 2 * Math.random() - 1;
        }
    }
    //do some interpolation
    for (var phi = 0; phi < nPhi; phi++) {
        for (var theta = 0; theta < nTh; theta++) {
            var leftP = Math.floor(phi / dPhI) * dPhI;
            var leftT = Math.floor(theta / dThI) * dThI;
            var rightP = (leftP + dPhI) % nPhi;
            var rightT = (leftT + dThI) % nTh;

            var ht = (heightMap[leftP][leftT] + heightMap[rightP][rightT]) / 2.0;

            heightMap[phi][theta] = ht;
        }
    }
    return heightMap;
}

/******* Icosphere generatioon algorithm ******/
function icosphere(recursionLevel) {
    //Define the dimensions of the icososphere 
    var t = (1.0 + Math.sqrt(5.0)) / 2.0;
    var l = 1.0;

    // list of faces
    var verts = new Array();
    var faces = new Array();

    //// Build Geometry ////
    //X-Y Plane
    verts.push(new THREE.Vector3(-l, t, 0));
    verts.push(new THREE.Vector3(l, t, 0));
    verts.push(new THREE.Vector3(-l, -t, 0));
    verts.push(new THREE.Vector3(l, -t, 0));
    //Y-Z Plane
    verts.push(new THREE.Vector3(0, -l, t));
    verts.push(new THREE.Vector3(0, l, t));
    verts.push(new THREE.Vector3(0, -l, -t));
    verts.push(new THREE.Vector3(0, l, -t));
    //X-Z Plane
    verts.push(new THREE.Vector3(t, 0, -l));
    verts.push(new THREE.Vector3(l, 0, l));
    verts.push(new THREE.Vector3(-t, 0, -l));
    verts.push(new THREE.Vector3(-t, 0, l));

    //// Add faces ////
    //set1
    faces.push({
        a: 0,
        b: 11,
        c: 5
    });
    faces.push({
        a: 0,
        b: 5,
        c: 1
    });
    faces.push({
        a: 0,
        b: 1,
        c: 7
    });
    faces.push({
        a: 0,
        b: 7,
        c: 10
    });
    faces.push({
        a: 0,
        b: 10,
        c: 11
    });
    //set2
    faces.push({
        a: 1,
        b: 5,
        c: 9
    });
    faces.push({
        a: 5,
        b: 11,
        c: 4
    });
    faces.push({
        a: 11,
        b: 10,
        c: 2
    });
    faces.push({
        a: 10,
        b: 7,
        c: 6
    });
    faces.push({
        a: 7,
        b: 1,
        c: 8
    });
    //set3
    faces.push({
        a: 3,
        b: 9,
        c: 4
    });
    faces.push({
        a: 3,
        b: 4,
        c: 2
    });
    faces.push({
        a: 3,
        b: 2,
        c: 6
    });
    faces.push({
        a: 3,
        b: 6,
        c: 8
    });
    faces.push({
        a: 3,
        b: 8,
        c: 9
    });
    //set4
    faces.push({
        a: 4,
        b: 9,
        c: 5
    });
    faces.push({
        a: 2,
        b: 4,
        c: 11
    });
    faces.push({
        a: 6,
        b: 2,
        c: 10
    });
    faces.push({
        a: 8,
        b: 6,
        c: 7
    });
    faces.push({
        a: 9,
        b: 8,
        c: 1
    });


    for (var i = 0; i < recursionLevel; i++) {
        var faces2 = new Array();
        for (var j = 0; j < faces.length; j++) {
            //get the current triangle
            var inds = faces[j];
            var v1 = verts[inds.a];
            var v2 = verts[inds.b];
            var v3 = verts[inds.c];
            //calculate the new vertex values
            var v4 = avgVectors(v1, v2);
            var v5 = avgVectors(v1, v3);
            var v6 = avgVectors(v2, v3);
            //check if those vertices exist already
            var i4 = -1;
            if (i4 = verts.findIndex(function (obj) {
                    return obj == {
                        x: v4.x,
                        y: v4.y,
                        z: v4.z
                    }
                }) == -1) {
                i4 = verts.length;
                verts.push(v4);
            }
            var i5 = -1;
            if (i5 = verts.findIndex(function (obj) {
                    return obj == {
                        x: v5.x,
                        y: v5.y,
                        z: v5.z
                    }
                }) == -1) {
                i5 = verts.length;
                verts.push(v5);
            }
            var i6 = -1;
            if (i6 = verts.findIndex(function (obj) {
                    return obj == {
                        x: v6.x,
                        y: v6.y,
                        z: v6.z
                    }
                }) == -1) {
                i6 = verts.length;
                verts.push(v6);
            }
            faces2.push({
                a: inds.a,
                b: i4,
                c: i5
            });
            faces2.push({
                a: inds.b,
                b: i6,
                c: i4
            });
            faces2.push({
                a: inds.c,
                b: i5,
                c: i6
            });
            faces2.push({
                a: i6,
                b: i5,
                c: i4
            });
        }
        faces = faces2;
    }
    return {
        verts, faces
    };
}

function avgVectors(v1, v2) {
    var v3 = {
        x: (v1.x + v2.x) / 2.0,
        y: (v1.y + v2.y) / 2.0,
        z: (v1.z + v2.z) / 2.0
    }
    return v3;
}



function interpolate(xi, xl, xr, yl, yr) {
    return (xi - xl) / (xr - xl) * (yr - yl) + yl;
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