function log(str)
{
    let newElem = document.createElement( 'p' ); 
    newElem.appendChild( document.createTextNode( str ) );
    document.body.appendChild( newElem );
}

class MainProject
{
    constructor(framework)
    {
        this.framework = framework;
        this.currentScene = null;
        this.guideNormalization = null;
        this.guideAngularVelocity = null;

        // Init imgui window positions and sizes.
        let w = this.framework.canvas.width / this.framework.imgui.scale;
        let h = this.framework.canvas.height / this.framework.imgui.scale;

        this.framework.imgui.initWindow( "Guides", true, new vec2(w-152,2), new vec2(150,45) );
    }

    shutdown()
    {
        this.guideNormalization.free();
        this.guideAngularVelocity.free();
        this.currentScene = null;

        this.framework = null;
    }

    init()
    {
        let resources = this.framework.resources;

        resources.materials["red"] = new Material( resources.shaders["uniformColor"], new color( 1, 0, 0, 1 ), null );
        resources.materials["green"] = new Material( resources.shaders["uniformColor"], new color( 0, 1, 0, 1 ), null );
        resources.materials["green2"] = new Material( resources.shaders["uniformColor"], new color( 0.0, 0.4, 0.2, 1 ), null );
        resources.materials["green3"] = new Material( resources.shaders["uniformColor"], new color( 0.3, 0.6, 0, 1 ), null );
        resources.materials["blue"] = new Material( resources.shaders["uniformColor"], new color( 0, 0, 1, 1 ), null );
        resources.materials["white"] = new Material( resources.shaders["uniformColor"], new color( 1, 1, 1, 1 ), null );

        resources.meshes["vertex"] = new Mesh( this.framework.gl );
        resources.meshes["vertex"].createCircle( 200, 0.5 );
        resources.meshes["edge"] = new Mesh( this.framework.gl );
        resources.meshes["edge"].createBox( new vec2( 1, 0.2 ) );
    
        // Create a camera.
        this.camera = new Camera( new vec3(0, 0, -3), true, 40, this.framework.canvas.width / this.framework.canvas.height );

        // Create the guides.
        this.guideNormalization = new GuideNormalization(
            this,
            this.framework,
            resources.meshes["vertex"],
            resources.materials["white"] );

        this.guideAngularVelocity = new GuideAngularVelocity(
            this,
            this.framework,
            resources.meshes["vertex"],
            resources.materials["blue"] );

        this.currentScene = this.guideNormalization;

        this.loadState();
    }

    loadState()
    {
        if( this.framework.storage != null )
        {
            this.camera.fromJSON( this.framework.storage["cameraState"] );
        }
    }

    saveState()
    {
        if( this.camera )
        {
            if( this.framework.storage != null )
            {
                this.framework.storage["cameraState"] = JSON.stringify( this.camera );
            }
        }
    }

    update(deltaTime, currentTime)
    {
        this.camera.update();
        this.currentScene.update( deltaTime )
    }

    draw()
    {
        let imgui = this.framework.imgui;
        imgui.window( "Guides" );

        if( imgui.button( "Normalization" ) )    { this.currentScene = this.guideNormalization; }
        if( imgui.button( "Angular Velocity" ) ) { this.currentScene = this.guideAngularVelocity; }

        this.currentScene.draw();
    }

    onBeforeUnload()
    {
        this.saveState();
    }

    onMouseMove(x, y)
    {
        this.camera.onMouseMove( x, y );
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.framework.canvas, x, y );
        this.currentScene.onMouseMove( x, y, orthoX, orthoY );
    }

    onMouseDown(buttonID, x, y)
    {
        this.camera.onMouseDown( buttonID, x, y );
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.framework.canvas, x, y );
        this.currentScene.onMouseDown( buttonID, x, y, orthoX, orthoY );
    }

    onMouseUp(buttonID, x, y)
    {
        this.camera.onMouseUp( buttonID, x, y );
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.framework.canvas, x, y );
        this.currentScene.onMouseUp( buttonID, x, y, orthoX, orthoY );
    }

    onMouseWheel(direction)
    {
        this.camera.onMouseWheel( direction );
        this.currentScene.onMouseWheel( direction );
    }

    onKeyDown(keyCode)
    {
        if( this.currentScene.onKeyDown )
            this.currentScene.onKeyDown( keyCode );
    }

    onKeyUp(keyCode)
    {
        if( this.currentScene.onKeyUp )
            this.currentScene.onKeyUp( keyCode );
    }
}

function main()
{
    let framework = new FrameworkMain();
    let runnable = new MainProject( framework );
    
    //framework.init();
    runnable.init();
    framework.run( runnable );
}

main()
    