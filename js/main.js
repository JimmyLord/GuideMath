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
        this.framework.autoRefresh = false;

        this.scenes = [];
        this.currentScene = null;
        this.currentSceneKey = null;

        // Settings.
        this.showGrid = true;

        // Init imgui window positions and sizes.
        this.initWindows( false );

        this.framework.clearColor.set( 32/255.0, 32/255.0, 32/255.0, 1.0 );
    }

    initWindows(force)
    {
        let w = this.framework.canvas.width / this.framework.imgui.scale;
        let h = this.framework.canvas.height / this.framework.imgui.scale;

        //this.framework.imgui.initWindow( "Guides", !force, new vec2(w-152,12), new vec2(150,45) );
    }

    shutdown()
    {
        this.currentScene = null;

        this.framework = null;
    }

    init()
    {
        let resources = this.framework.resources;

        resources.materials["red"] =        new Material( resources.shaders["uniformColor"], new color( 1   , 0   , 0   , 1 ), null );
        resources.materials["green"] =      new Material( resources.shaders["uniformColor"], new color( 0   , 1   , 0   , 1 ), null );
        resources.materials["green2"] =     new Material( resources.shaders["uniformColor"], new color( 0   , 0.4 , 0.2 , 1 ), null );
        resources.materials["green3"] =     new Material( resources.shaders["uniformColor"], new color( 0.3 , 0.6 , 0   , 1 ), null );
        resources.materials["blue"] =       new Material( resources.shaders["uniformColor"], new color( 0   , 0   , 1   , 1 ), null );
        resources.materials["white"] =      new Material( resources.shaders["uniformColor"], new color( 1   , 1   , 1   , 1 ), null );
        resources.materials["lightGray"] =  new Material( resources.shaders["uniformColor"], new color( 0.7 , 0.7 , 0.7 , 1 ), null );
        resources.materials["gray"] =       new Material( resources.shaders["uniformColor"], new color( 0.5 , 0.5 , 0.5 , 1 ), null );
        resources.materials["darkGray"] =   new Material( resources.shaders["uniformColor"], new color( 0.35, 0.35, 0.35, 1 ), null );
        resources.materials["VDarkGray"] =  new Material( resources.shaders["uniformColor"], new color( 0.2 , 0.2 , 0.2 , 1 ), null );

        resources.meshes["vertex"] = new Mesh( this.framework.gl );
        resources.meshes["vertex"].createCircle( 200, 0.04 );
        resources.meshes["edge"] = new Mesh( this.framework.gl );
        resources.meshes["edge"].createBox( new vec2( 1, 0.02 ) );
        resources.meshes["circle"] = new Mesh( this.framework.gl );
        resources.meshes["circle"].createCircle( 200, 1.0, true );
    
        // Create the guides.
        this.scenes["Math"] = [];
        this.scenes["Math"]["Normalization"] = new GuideNormalization( this, this.framework );
        this.scenes["Math"]["Dot Product"] = new GuideDotProduct( this, this.framework );
        this.scenes["Physics"] = [];
        this.scenes["Physics"]["Angular Velocity"] = new GuideAngularVelocity( this, this.framework );
        this.scenes["Physics"]["Acceleration"] = new GuideAcceleration( this, this.framework );
        this.scenes["TODO"] = [];
        this.scenes["TODO"]["TODO"] = null;

        this.currentSceneKey = "Math/Normalization";
        let parts = this.currentSceneKey.split( '/' );
        this.currentScene = this.scenes[parts[0]][parts[1]];

        this.loadState();
    }

    loadState()
    {
        if( this.framework.storage != null )
        {
            //this.camera.fromJSON( this.framework.storage["cameraState"] );
            let key = this.framework.storage["currentSceneKey"];
            let parts = key.split( '/' );
            let scene = null;
            if( this.scenes[parts[0]] !== undefined && this.scenes[parts[0]][parts[1]] !== undefined )
                scene = this.scenes[parts[0]][parts[1]];

            if( scene !== null )
            {
                this.currentScene = scene;
                this.currentSceneKey = key;
            }
        }
    }

    saveState()
    {
        if( this.framework.storage != null )
        {
            //if( this.camera )
                //this.framework.storage["cameraState"] = JSON.stringify( this.camera );
            this.framework.storage["currentSceneKey"] = this.currentSceneKey;
        }
    }

    update(deltaTime, currentTime)
    {
        let imgui = this.framework.imgui;

        // Add main menu bar.
        imgui.mainMenuBar();
        if( imgui.menu( "Guides" ) )
        {
            for( let key1 in this.scenes )
            {
                if( imgui.submenu( key1 ) )
                {
                    for( let key2 in this.scenes[key1] )
                    {
                        if( imgui.menuItem( key2 ) )
                        {
                            this.currentSceneKey = key1 + "/" + key2;
                            this.currentScene = this.scenes[key1][key2];

                            imgui.closeAllMenus();
                            this.framework.refresh();
                        }
                    }
                    imgui.endSubmenu();
                }
            }
        }
        if( imgui.menu( "Settings" ) )
        {
            if( imgui.submenu( "UI Scale" ) )
            {
                if( imgui.menuItem( "1" ) )
                {
                    imgui.scale = 1;
                    imgui.closeAllMenus();
                    this.framework.refresh();
                }
                if( imgui.menuItem( "2" ) )
                {
                    imgui.scale = 2;
                    imgui.closeAllMenus();
                    this.framework.refresh();
                }
                if( imgui.menuItem( "3" ) )
                {
                    imgui.scale = 3;
                    imgui.closeAllMenus();
                    this.framework.refresh();
                }
                imgui.endSubmenu();
            }
            if( imgui.menuItem( "Reset Layout" ) )
            {
                this.initWindows( true );
                this.currentScene.initWindows( true );
                imgui.closeAllMenus();
                this.framework.refresh();
            }
        }
        if( imgui.menu( "Grid" ) )
        {
            if( imgui.menuItem( "Show grid" ) )
            {
                this.showGrid = !this.showGrid;
                imgui.closeAllMenus();
                this.framework.refresh();
            }
        }

        this.currentScene.update( deltaTime )
    }

    draw()
    {
        //let imgui = this.framework.imgui;
        //imgui.window( "Debug" );
        //imgui.text( "" + imgui.windowBeingResized?.name );
        //for( let key in imgui.activeMenus )
        //    imgui.text( key );

        this.currentScene.draw();
    }

    onBeforeUnload()
    {
        this.saveState();
    }

    onMouseMove(x, y)
    {
        this.currentScene.onMouseMove( x, y );

        this.framework.refresh();
    }

    onMouseDown(buttonID, x, y)
    {
        this.currentScene.onMouseDown( buttonID, x, y );

        this.framework.refresh();
    }

    onMouseUp(buttonID, x, y)
    {
        this.currentScene.onMouseUp( buttonID, x, y );

        this.framework.refresh();
    }

    onMouseWheel(direction)
    {
        this.currentScene.onMouseWheel( direction );

        this.framework.refresh();
    }

    onKeyDown(keyCode)
    {
        if( this.currentScene.onKeyDown )
            this.currentScene.onKeyDown( keyCode );

        this.framework.refresh();
    }

    onKeyUp(keyCode)
    {
        if( this.currentScene.onKeyUp )
            this.currentScene.onKeyUp( keyCode );

        this.framework.refresh();
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
    