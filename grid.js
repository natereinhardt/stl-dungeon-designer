if ( WEBGL.isWebGLAvailable() === false ) {

				document.body.appendChild( WEBGL.getWebGLErrorMessage() );

			}

			var camera, scene, renderer;
			var plane, cube;
			var mouse, raycaster, isShiftDown = false;

			var rollOverMesh, rollOverMaterial;
			var cubeGeo, cubeMaterial;

			var objects = [];

			init();
			render();

			function init() {

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.set( 500, 800, 1300 );
				camera.lookAt( 0, 0, 0 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xf0f0f0 );

				// roll-over helpers

				var rollOverGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
				rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
				rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
				scene.add( rollOverMesh );

				//STL LOADER

// 				var loader = new THREE.STLLoader();
// loader.load('stls\DLU_Dungeon_Floor_2x2.stl', function(geometry) {

//   var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
//     color: 0xff00ff,
//     wireframe: true
//   }));
//   mesh.rotation.set(-Math.PI / 2, 0, 0);
//   mesh.scale.setScalar(100);
//   scene.add(mesh);

//   console.log("stl volume is " + getVolume(geometry));
// });

				cubeGeo = new THREE.STLLoader().load( 'stls\DLU_Dungeon_Floor_2x2.stl' )
				//cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map:  } );

				// cubeGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
				// cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.STLLoader().load( 'stls\DLU_Dungeon_Floor_2x2.stl' ) } );

				// grid

				var gridHelper = new THREE.GridHelper( 1000, 20 );
				scene.add( gridHelper );

				//

				raycaster = new THREE.Raycaster();
				mouse = new THREE.Vector2();

				var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
				geometry.rotateX( - Math.PI / 2 );

				plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
				scene.add( plane );

				objects.push( plane );

				// lights

				var ambientLight = new THREE.AmbientLight( 0x606060 );
				scene.add( ambientLight );

				var directionalLight = new THREE.DirectionalLight( 0xffffff );
				directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
				scene.add( directionalLight );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'keydown', onDocumentKeyDown, false );
				document.addEventListener( 'keyup', onDocumentKeyUp, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseMove( event ) {

				event.preventDefault();

				mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

				raycaster.setFromCamera( mouse, camera );

				var intersects = raycaster.intersectObjects( objects );

				if ( intersects.length > 0 ) {

					var intersect = intersects[ 0 ];

					rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
					rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

				}

				render();

			}

			function onDocumentMouseDown( event ) {

				event.preventDefault();

				mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

				raycaster.setFromCamera( mouse, camera );

				var intersects = raycaster.intersectObjects( objects );

				if ( intersects.length > 0 ) {

					var intersect = intersects[ 0 ];

					// delete cube

					if ( isShiftDown ) {

						if ( intersect.object !== plane ) {

							scene.remove( intersect.object );

							objects.splice( objects.indexOf( intersect.object ), 1 );

						}

						// create cube

					} else {
						var loader = new THREE.STLLoader();
						loader.load('https://raw.githubusercontent.com/natereinhardt/stl-dungeon-designer/master/stls/DLU_Dungeon_Floor_2x2.stl', function(geometry) {
							var material = new THREE.MeshPhongMaterial( { color: 0xAAAAAA, specular: 0x111111, shininess: 200 } );
							var mesh = new THREE.Mesh(geometry, material);
							mesh.position.copy( intersect.point ).add( intersect.face.normal );
							mesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
							mesh.rotation.set( - Math.PI / 2, 0, 0 );
							scene.add( mesh );
				
							objects.push( mesh );
						
						  });
					}

					render();

				}

			}

			function onDocumentKeyDown( event ) {

				switch ( event.keyCode ) {

					case 16: isShiftDown = true; break;

				}

			}

			function onDocumentKeyUp( event ) {

				switch ( event.keyCode ) {

					case 16: isShiftDown = false; break;

				}

			}

			function render() {

				renderer.render( scene, camera );

			}
