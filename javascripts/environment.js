$(document).on('ready', function () {

  var environment = {}
  environment.container = undefined
  environment.camera = undefined
  environment.controls = undefined
  environment.scene = undefined
  environment.renderer  = undefined
  environment.onRenderFcts = []
  environment.dollyOut = true

  environment.init = function (opts) {

    var self = this

    this.container = document.getElementById( "container" );


    /////////////////////////// set up camera /////////////////////////////

    this.camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.0001, 10000 );
    this.camera.position.set(0,0,10)


    /////////////////////////// set up controls /////////////////////////////

    this.controls = new THREE.OrbitControls( this.camera, this.container );
    this.controls.zoomSpeed = 0.2
    this.controls.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE };

    this.onRenderFcts.push(this.controls.update)

    /////////////////////////// set up scene /////////////////////////////

    this.scene = new THREE.Scene();

    /////////////////////////// set up renderer /////////////////////////////

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setClearColor( 0xffffff );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.container.appendChild( this.renderer.domElement );

    ///////////////////// On Window Resize ////////////////////////

    var windowResize = new THREEx.WindowResize(this.renderer, this.camera)

    ///////////////////////////////////// Stats ////////////////////////////////////////

    var stats = new Stats();

    stats.setMode( 1 ); // 0: fps, 1: ms, 2: mb

    // align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );
    var $stats = $(stats.domElement)

    $stats.hide()

    this.onRenderFcts.push(function () {
      stats.begin();
      stats.end();
    })

    var rendererStats = new THREEx.RendererStats()

    rendererStats.domElement.style.position = 'absolute'
    rendererStats.domElement.style.right = '0px'
    rendererStats.domElement.style.top   = '0px'
    document.body.appendChild( rendererStats.domElement )

    var $rendererStats = $(rendererStats.domElement)
    $rendererStats.hide()


    this.onRenderFcts.push(function () {
      rendererStats.update(self.renderer);
    })

    $(document).on('keypress', function (e) {
      if ( e.keyCode == 115 || e.keyCode == 83) {
        $stats.toggle()
        $rendererStats.toggle()
      }
    })


    //////////////////////////////////////////////////////////////////////////////
    //                         render the scene                                 //
    //////////////////////////////////////////////////////////////////////////////

    this.onRenderFcts.push(function(){
      self.renderer.render( self.scene, self.camera );
    })

  }

  environment.populateScene = function () {
    this.knot = {}
    var geometry = new THREE.TorusKnotGeometry(5, 1, 64, 8, 2, 3, 1);
    var material = new THREE.MeshNormalMaterial({shading: THREE.FlatShading});
    this.knot.mesh = new THREE.Mesh(geometry, material);
    this.addObjectToScene(this.knot);
  }

  environment.animate = function () {
  }

  environment.render = function () {

    var self = this
    var lastTimeMsec = null
    requestAnimationFrame(function animate(nowMsec){

      // keep looping
      requestAnimationFrame( animate );

      // measure time
      lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
      var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
      lastTimeMsec  = nowMsec

      // call each update function
      self.onRenderFcts.forEach(function(onRenderFct){
        onRenderFct(deltaMsec/1000, nowMsec/1000)
      })

      // update TWEEN functions
      // TWEEN.update(nowMsec);

    })
  }


  ///////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////// UTILITIES ////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////

  ///////////////////////// adding & removing objects from scene /////////////////////////////////

  environment.addObjectsToScene = function (objects) {
    _.forEach(objects, environment.addObjectToScene)
  }

  environment.addObjectToScene = function (object) {
    environment.scene.add(object.mesh)
  }

  environment.removeObjectFromScene = function (object) {
    environment.scene.remove( object.mesh )
  }

  environment.removeObjectsFromScene = function (objects) { // duplicate of ebove function
    _.forEach( objects, environment.removeObjectFromScene )
  }

  //////////////////////////////////// billboarding ////////////////////////////////////////////////

  environment.billboardObjects = function (objects) {
    _.forEach(objects, function(object) {
      environment.billboardObject(object)
    })
  }

  environment.billboardObject = function (object) {
    object.mesh.quaternion.copy( environment.camera.quaternion )
  }

  environment.init()

  environment.populateScene()

  environment.animate()

  environment.render()









})