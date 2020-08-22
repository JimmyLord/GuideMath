var MasterGuideList = {};

class Guide
{
    constructor(mainProject, framework, numPages)
    {
        this.mainProject = mainProject;
        this.framework = framework;

        // Page Settings.
        this.page = 1;
        this.numPages = numPages;
        this.switchedPage = true;

        // Common vars.
        this.mousePosition = new vec2( 0, 0 );

        // Create a camera.
        this.camera = new Camera( new vec3(0, 0, -3), true, 3, this.framework );

        this.renderer = new RenderHelpers( this.framework, this.camera );
    }

    initWindows(guideName, force)
    {
        let imgui = this.framework.imgui;

        if( force )
        {
            this.camera.position.setF32( 0, 0, -3 );
            this.camera.zoom = 1;
            //this.camera.isOrtho = true;
            //this.camera.desiredHeight = 3;
            //this.camera.aspectRatio = this.framework.canvas.width / this.framework.canvas.height;
        }

        let w = this.framework.canvas.width / this.framework.imgui.scale;
        let h = this.framework.canvas.height / this.framework.imgui.scale;

        imgui.initWindow( "FullFrame", !force, new vec2(0,0), new vec2(w,h), false, false );
        imgui.initWindow( "Definitions", !force, new vec2(2,imgui.mainMenuBarHeight + 1), new vec2(600,40) );
        imgui.initWindow( guideName, !force, new vec2(2,imgui.mainMenuBarHeight + 1 + 40 + 1), new vec2(205,130) );
    }

    switchPage(page)
    {
        if( this.page === page ||
            page < 1 ||
            page > this.numPages )
        {
            return;
        }

        this.page = page;
        this.switchedPage = true;
    }

    update(deltaTime)
    {
        this.camera.update();
    }

    onMouseMove(x, y)
    {
        this.camera.onMouseMove( x, y );
        let worldPos = this.camera.convertScreenToWorld( this.framework.canvas, x, y );

        // Store mouse position in world space.
        this.mousePosition.setF32( worldPos.x, worldPos.y );

        return worldPos;
    }

    onMouseDown(buttonID, x, y)
    {
        this.camera.onMouseDown( buttonID, x, y );
        let worldPos = this.camera.convertScreenToWorld( this.framework.canvas, x, y );
        return worldPos;
    }

    onMouseUp(buttonID, x, y)
    {
        this.camera.onMouseUp( buttonID, x, y );
        let worldPos = this.camera.convertScreenToWorld( this.framework.canvas, x, y );
        return worldPos;
    }

    onMouseWheel(direction)
    {
        this.camera.onMouseWheel( direction );
    }

    onKeyDown(key, keyCode, modifierKeys)
    {
        if( modifierKeys == modifierKeyFlag.ctrl )
        {
            if( key == 'ArrowLeft' )
            {
                this.switchPage( this.page-1 );
            }

            if( key == 'ArrowRight' )
            {
                this.switchPage( this.page+1 );
            }
        }
    }
}
