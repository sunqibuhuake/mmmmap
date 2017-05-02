/**
 * Created by sunqi on 17/4/12.
 */


var planeW = 20000;

var planeH = 10000;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 100000 );

scene.add(camera)

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.querySelector('#viewer').appendChild( renderer.domElement );

// instantiate a loader
var loader = new THREE.TextureLoader();

// load a resource
loader.load(
    // resource URL
    './/bg2.png',
    //'./assets/map/test.jpg',
    // Function when resource is loaded
    function ( texture ) {
        // do something with the texture
        var material = new THREE.MeshBasicMaterial( {
            map: texture,
            side: THREE.DoubleSide
        });
        var geometry = new THREE.PlaneGeometry( planeW, planeH, 2 );
        var plane = new THREE.Mesh( geometry, material );

        plane.material.side = THREE.DoubleSide;

        scene.add( plane );
    },
    // Function called when download progresses
    function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    },
    // Function called when download errors
    function ( xhr ) {
        console.log( 'An error happened' );
    }
);


var base = 2500;
camera.position.z = base;

function zoom(k) {
    camera.position.z = base + (k * 300);
}


var flag = 1;

var hanging = true;

function hang() {

    if(!hanging) {
        return false;
    }
    var x = camera.position.x;
    if(x > 0) {
        var gap = planeW / 2 - camera.position.x;
    } else {
        var gap = planeW / 2 + camera.position.x;
    }
    if(gap < camera.position.z) {
        flag = -flag;
    }
    camera.position.x += (2 * flag);
}


window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


function move(lng,lat) {

    hanging = false;

    var target = geo2pixel(lng, lat);

    console.log(target)

    TweenLite.to(camera.position, 2, target)

}

function geo2pixel(lng, lat) {
    var x = (planeW / 360) * lng;
    var y = lat * (planeH / 180);

    return {
        x: x,
        y: y
    }
}

function render() {

    hang()
    requestAnimationFrame( render );
    renderer.render( scene, camera );
}
render();


function queryLocation(location) {
    // show loading
    var query = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=AIzaSyCEyb29M2-l_dpiD-qgL31xoz0tHORryjQ';
    $.get(query, function(data) {
        // hide loading
        console.log(data)
        var pos = data.results[0].geometry.location
        move(pos.lng, pos.lat);
    })
}
