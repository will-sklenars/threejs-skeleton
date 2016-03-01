$(document).on('ready', function () {

  function Environment () {
    this.container = document.getElementById( "container" );
    this.scene = new THREE.Scene();
    this.onRenderFcts = []
  }

  Environment.prototype.init = function () {
    var self = this
    /////////////////////////// set up camera ///////////////////////////////////////
    this.initializeCamera()
    /////////////////////////// set up controls /////////////////////////////////////
    this.initializeControls()
    /////////////////////////// set up renderer /////////////////////////////////////
    this.initializeRenderer()
    ///////////////////// On Window Resize //////////////////////////////////////////
    this.initWindowResize()
    ///////////////////////////////////// Dom Events ////////////////////////////////
    this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement)
    ///////////////////////////////////// Stats /////////////////////////////////////
    this.initStats()
    this.initRendererStats()
    /////////////////////// render the scene ////////////////////////////////////////
    this.onRenderFcts.push(function(){
      self.renderer.render( self.scene, self.camera );
    })
  }

  Environment.prototype.populateScene = function () {
    this.knot = {}
    var geometry = new THREE.TorusKnotGeometry(5, 1, 64, 8, 2, 3, 1);
    var material = new THREE.MeshNormalMaterial({shading: THREE.FlatShading});
    this.knot.mesh = new THREE.Mesh(geometry, material);
    this.addObjectToScene(this.knot);
  }

  Environment.prototype.animate = function () {
  }

  Environment.prototype.render = function () {

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


  /////////////////////////////////////////////////////////////////////
  ///////////////////////////// init fxns /////////////////////////////
  /////////////////////////////////////////////////////////////////////


  Environment.prototype.initializeCamera = function () {
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.0001, 10000 );
    this.camera.position.set(0,0,-20)
  }

  Environment.prototype.initializeControls = function () {
    this.controls = new THREE.OrbitControls( this.camera, this.container );
    // this.controls.maxDistance = 5
    this.controls.minDistance = 1.7
    this.controls.zoomSpeed = 0.2
    this.controls.target.set(1,1,1)
    this.controls.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE };
    this.controls.enableKeys = false

    this.onRenderFcts.push(this.controls.update)
  }

  Environment.prototype.initializeRenderer = function () {
    var self = this

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setClearColor( 0x222628 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.sortObjects = false;
    this.renderer.rendering = true
    this.container.appendChild( this.renderer.domElement );
  }

  Environment.prototype.initWindowResize = function () {
    this.windowResize = new THREEx.WindowResize(this.renderer, this.camera)
  }

  Environment.prototype.initStats = function () {
    var self = this
    this.stats = new Stats();
    this.stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
    // align top-left
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';
    document.body.appendChild( this.stats.domElement );
    var $stats = $(this.stats.domElement)
    $stats.hide()
    this.onRenderFcts.push(function () {
      self.stats.begin();
      self.stats.end();
    })

    $(document).on('keypress', function (e) {
      if ( e.keyCode === 115 || e.keyCode === 83) {
        $stats.toggle()
      }
    })
  }

  Environment.prototype.initRendererStats = function  () {
    var self = this
    this.rendererStats   = new THREEx.RendererStats()

    this.rendererStats.domElement.style.position = 'absolute'
    this.rendererStats.domElement.style.right = '0px'
    this.rendererStats.domElement.style.top   = '0px'
    document.body.appendChild( this.rendererStats.domElement )

    var $rendererStats = $(this.rendererStats.domElement)
    $rendererStats.hide()

    this.onRenderFcts.push(function () {
      self.rendererStats.update(self.renderer);
    })

    $(document).on('keypress', function (e) {
      if ( e.keyCode === 115 || e.keyCode === 83) {
        $rendererStats.toggle()
      }
    })
  }



  ///////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////// UTILITIES ////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////

  ///////////////////////// adding & removing objects from scene /////////////////////////////////

  Environment.prototype.addObjectsToScene = function (objects) {
    _.forEach(objects, this.addObjectToScene.bind(this))
  }

  Environment.prototype.addObjectToScene = function (object) {
    if (object.mesh) {
      this.scene.add(object.mesh)
    } else {
      this.scene.add(object)
    }
  }

  Environment.prototype.removeObjectFromScene = function (object) {
    this.scene.remove( object.mesh )
  }

  Environment.prototype.removeObjectsFromScene = function (objects) { // duplicate of ebove function
    _.forEach( objects, this.removeObjectFromScene.bind(this) )
  }

  //////////////////////////////////// billboarding ////////////////////////////////////////////////

  Environment.prototype.billboardObjects = function (objects) {
    _.forEach(objects, this.billboardObject.bind(this))
  }

  Environment.prototype.billboardObject = function (object) {
    object.mesh.quaternion.copy( this.camera.quaternion )
  }

  var environment = new Environment()

  environment.init()

  environment.populateScene()

  environment.animate()

  environment.render()









})