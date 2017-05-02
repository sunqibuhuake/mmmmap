/**
 * Created by sunqi on 17/4/12.
 */

var input = ''

var mode = 'IMAGE'

var maxZoomLevel = 4

var zoomLevel = 0;

var planeW = 20000;

var planeH = 10000;

var plane, cb, textLayer;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 100000 );

scene.add(camera)

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.querySelector('#viewer').appendChild( renderer.domElement );


function scaleY() {
    var maxHeight = window.innerHeight
    var scaleLevel = maxHeight / 30

    $('.addBtn').css({
        height: '100%'
    })
    $('.wrapper').css({
        top: '-4px',
        '-webkit-transform': 'scale3d(1,' + scaleLevel + ',1)'
    })
}

function resetScaleY() {
    $('.addBtn').css({
        height: '30%'
    })
    $('.wrapper').css({
        top: '16%',
        '-webkit-transform': 'scale3d(1,' + 27 + ',1)'
    })
}


function textMode() {

    if(plane) {
        plane.visible = false
    }

    if(textLayer && cb) {
        textLayer.visible = true;
        cb.visible = true;
        return false
    }

// Geometry
    var cbgeometry = new THREE.PlaneGeometry( planeW, planeH, 256, 128 );

// Materials
    var cbmaterials = [];

    cbmaterials.push( new THREE.MeshBasicMaterial( { color: 0xcccccc, side: THREE.DoubleSide }) );
    cbmaterials.push( new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide }) );

    var l = cbgeometry.faces.length / 2; // <-- Right here. This should still be 8x8 (64)

    console.log("This should be 64: " + l);// Just for debugging puporses, make sure this is 64

    for( var i = 0; i < l; i ++ ) {
        j = i * 2; // <-- Added this back so we can do every other 'face'
        cbgeometry.faces[ j ].materialIndex = ((i + Math.floor(i/256)) % 2); // The code here is changed, replacing all 'i's with 'j's. KEEP THE 8
        cbgeometry.faces[ j + 1 ].materialIndex = ((i + Math.floor(i/256)) % 2); // Add this line in, the material index should stay the same, we're just doing the other half of the same face
    }

// Mesh
    cb = new THREE.Mesh( cbgeometry, new THREE.MeshFaceMaterial( cbmaterials ) );
    scene.add( cb );

// instantiate a loader
    var loader = new THREE.TextureLoader();

// load a resource
    loader.load(
        // resource URL
        './text2.png',
        //'./assets/map/test.jpg',
        // Function when resource is loaded
        function ( texture ) {
            // do something with the texture
            var material = new THREE.MeshBasicMaterial( {
                map: texture,
                side: THREE.DoubleSide,
                alpha: true,
                transparent: true
            });
            var geometry = new THREE.PlaneGeometry( planeW, planeH, 2 );
            textLayer = new THREE.Mesh( geometry, material );
            textLayer.position.z = 2
            textLayer.material.side = THREE.DoubleSide;
            scene.add( textLayer );
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
}

function imageMode() {

    if(cb) {
        cb.visible = false
    }

    if(textLayer) {
        textLayer.visible = false
    }

    if(plane) {
        plane.visible = true;
        return false;
    }



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
            plane = new THREE.Mesh( geometry, material );

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
}

imageMode()

var base = 6000;

camera.position.z = base;

function zoom(k) {

    camera.position.z = base + (k * 900);

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


function bindMouseEvent() {
    $(function() {

        $('.address_input').on('input', function() {
            var val = $('.address_input').val().trim()
            if (!val) {
                hanging = true
            }
        })

        $('.switchswitch').click(function() {

            camera.position.z = 6000

            zoomLevel = 0

            if (mode == 'IMAGE') {

                maxZoomLevel = 6

                textMode()

                mode = 'TEXT'

            } else {

                maxZoomLevel = 4

                imageMode()
            }

        })


        $('.listBtn').click(function() {
            $('.address_input').val('Wenzhou Buenos Aires Jaipur');
        })

        $('.downloadBtn').click(function() {
            window.location.href = 'http://on7tgdgw1.bkt.clouddn.com/webpage.zip';
        })

        $('.shareBtn').click(function() {
            window.open('./new.html');
        })

        $('.rightBtn').click(function() {
            zoomLevel--;
            if(zoomLevel < -5) {
                zoomLevel = -5;
            }
            zoom(zoomLevel)
        })

        $('.leftBtn').click(function() {
            zoomLevel++
            if(zoomLevel > maxZoomLevel) {
                zoomLevel = maxZoomLevel;
            }
            zoom(zoomLevel)
        })


        $('.zoomOutBtn').click(function() {
            $('.green-layer').fadeIn(300)
        })

        $('.green-layer').click(function() {
            $('.green-layer').fadeOut(300)
        })


        $('.addBtn').click(function() {
            scaleY()
        })
    })
}

bindMouseEvent()

function bindKeyboardEvent() {
    document.onkeydown=function(event){
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if(e && e.keyCode==13){ // enter 键
            //要做的事情
            console.log('enter')
            e.preventDefault();
            var address = $('.address_input').val().trim();

            var newInput = address.replace(input, '')

            input = $('.address_input').val().trim();
            if (newInput) {
                queryLocation(newInput)
            }
        }
        if(e && e.keyCode==27){ // enter 键
            resetScaleY()
        }
    }

}

bindKeyboardEvent()

