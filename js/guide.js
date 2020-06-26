class Guide
{
    constructor(mainProject, framework)
    {
        this.mainProject = mainProject;
        this.framework = framework;

        // Common vars.
        this.mousePosition = new vec2( 0, 0 );

        // Create a camera.
        this.camera = new Camera( new vec3(0, 0, -3), true, 3, this.framework.canvas.width / this.framework.canvas.height );

        this.renderer = new RenderHelpers( this.framework, this.camera );
    }

    initWindows(force)
    {
        if( force )
        {
            this.camera.position.setF32( 0, 0, -3 );
            this.camera.zoom = 1;
            //this.camera.isOrtho = true;
            //this.camera.desiredHeight = 3;
            //this.camera.aspectRatio = this.framework.canvas.width / this.framework.canvas.height;
        }
    }

    update(deltaTime)
    {
        this.camera.update();
    }

    onMouseMove(x, y)
    {
        this.camera.onMouseMove( x, y );
        let [worldX, worldY] = this.camera.convertScreenToWorld( this.framework.canvas, x, y );

        // Store mouse position in world space.
        this.mousePosition.setF32( worldX, worldY );

        return [worldX, worldY];
    }

    onMouseDown(buttonID, x, y)
    {
        this.camera.onMouseDown( buttonID, x, y );
        let [worldX, worldY] = this.camera.convertScreenToWorld( this.framework.canvas, x, y );
        return [worldX, worldY];
    }

    onMouseUp(buttonID, x, y)
    {
        this.camera.onMouseUp( buttonID, x, y );
        let [worldX, worldY] = this.camera.convertScreenToWorld( this.framework.canvas, x, y );
        return [worldX, worldY];
    }

    onMouseWheel(direction)
    {
        this.camera.onMouseWheel( direction );
    }

    onKeyDown(keyCode)
    {
    }
}
