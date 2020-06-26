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

    update(deltaTime)
    {
        this.camera.update();
    }

    onMouseMove(x, y)
    {
        this.camera.onMouseMove( x, y );
        let [orthoX, orthoY] = this.camera.convertScreenToWorld( this.framework.canvas, x, y );

        // Store mouse position in world space.
        this.mousePosition.setF32( orthoX, orthoY );

        return [orthoX, orthoY];
    }

    onMouseDown(buttonID, x, y)
    {
        this.camera.onMouseDown( buttonID, x, y );
        let [orthoX, orthoY] = this.camera.convertScreenToWorld( this.framework.canvas, x, y );
        return [orthoX, orthoY];
    }

    onMouseUp(buttonID, x, y)
    {
        this.camera.onMouseUp( buttonID, x, y );
        let [orthoX, orthoY] = this.camera.convertScreenToWorld( this.framework.canvas, x, y );
        return [orthoX, orthoY];
    }

    onMouseWheel(direction)
    {
        this.camera.onMouseWheel( direction );
    }

    onKeyDown(keyCode)
    {
    }
}
