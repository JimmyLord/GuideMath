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

        this.guides = MasterGuideList;
        this.currentGuide = null;
        this.currentGuidePath = null;

        // Settings.
        this.showGrid = true;
        this.defaultPath = "Math/Normalization";

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
        this.currentGuide = null;

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

        // Preinit imgui to have a main menu bar so guide windows show up in the right spots.
        this.framework.imgui.mainMenuBar();

        this.loadState();

        if( this.currentGuide === null )
        {
            this.switchToGuide( this.defaultPath );
        }
    }

    loadState()
    {
        if( this.framework.storage != null )
        {
            //this.camera.fromJSON( this.framework.storage["cameraState"] );
            let key = this.framework.storage["currentGuidePath"];
            if( this.isValidPath( key ) )
            {
                window.location.hash = key;
                this.switchToGuide( key );
            }
        }
    }

    saveState()
    {
        if( this.framework.storage != null )
        {
            //if( this.camera )
                //this.framework.storage["cameraState"] = JSON.stringify( this.camera );

            let pathWithPage = this.currentGuidePath + "/" + this.currentGuide.page;

            this.framework.storage["currentGuidePath"] = pathWithPage;
        }
    }

    isValidPath(guidePath)
    {
        if( guidePath === undefined )
            return false;

        let parts = guidePath.split( '/' );

        // Cut out hash character from start of string if it's there.
        if( parts[0][0] == '#' )
            parts[0] = parts[0].substring( 1 );

        if( parts.length < 2 )
            return false;

        if( this.guides[parts[0]] === undefined )
            return false;

        if( this.guides[parts[0]][parts[1]] === undefined )
            return false;

        return true;
    }

    switchToGuide(guidePath)
    {
        if( this.isValidPath( guidePath ) == false )
            return;

        let parts = guidePath.split( '/' );

        // Cut out hash character from start of string if it's there.
        if( parts[0][0] == '#' )
            parts[0] = parts[0].substring( 1 );

        if( this.guides[parts[0]][parts[1]].guide === null )
        {
            this.guides[parts[0]][parts[1]].createFunc( this, this.framework );
        }

        this.currentGuide = this.guides[parts[0]][parts[1]].guide;

        let pageIndex = parseInt( parts[2], 10 );
        if( isNaN( pageIndex ) == false )
        {
            this.currentGuide.switchPage( pageIndex );
        }

        this.currentGuidePath = parts[0] + "/" + parts[1];
    }

    update(deltaTime, currentTime)
    {
        let imgui = this.framework.imgui;

        // Add main menu bar.
        imgui.mainMenuBar();
        if( imgui.menu( "Guides" ) )
        {
            for( let key1 in this.guides )
            {
                if( imgui.submenu( key1 ) )
                {
                    for( let key2 in this.guides[key1] )
                    {
                        if( imgui.menuItem( key2 ) )
                        {
                            window.location.hash = "#" + key1 + "/" + key2;

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
                this.currentGuide.initWindows( true );
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

        this.currentGuide.update( deltaTime )
    }

    draw()
    {
        //let imgui = this.framework.imgui;
        //imgui.window( "Debug" );
        //imgui.text( "" + imgui.windowBeingResized?.name );
        //for( let key in imgui.activeMenus )
        //    imgui.text( key );

        this.currentGuide.draw();
    }

    onBeforeUnload()
    {
        this.saveState();
    }

    onHashChange(newHash)
    {
        if( newHash.length <= 1 )
            newHash = this.defaultPath;

        this.switchToGuide( newHash );
        this.framework.refresh();
    }

    onMouseMove(x, y)
    {
        this.currentGuide.onMouseMove( x, y );

        this.framework.refresh();
    }

    onMouseDown(buttonID, x, y)
    {
        this.currentGuide.onMouseDown( buttonID, x, y );

        this.framework.refresh();
    }

    onMouseUp(buttonID, x, y)
    {
        this.currentGuide.onMouseUp( buttonID, x, y );

        this.framework.refresh();
    }

    onMouseWheel(direction)
    {
        this.currentGuide.onMouseWheel( direction );

        this.framework.refresh();
    }

    onKeyDown(key, keyCode, modifierKeyStates)
    {
        if( this.currentGuide.onKeyDown )
            this.currentGuide.onKeyDown( key, keyCode, modifierKeyStates );

        this.framework.refresh();
    }

    onKeyUp(key, keyCode, modifierKeyStates)
    {
        if( this.currentGuide.onKeyUp )
            this.currentGuide.onKeyUp( key, keyCode, modifierKeyStates );

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
