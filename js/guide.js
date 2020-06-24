class Guide
{
    constructor(mainProject, framework)
    {
        this.mainProject = mainProject;
        this.framework = framework;

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
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.framework.canvas, x, y );
        return [orthoX, orthoY];
    }

    onMouseDown(buttonID, x, y)
    {
        this.camera.onMouseDown( buttonID, x, y );
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.framework.canvas, x, y );
        return [orthoX, orthoY];
    }

    onMouseUp(buttonID, x, y)
    {
        this.camera.onMouseUp( buttonID, x, y );
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.framework.canvas, x, y );
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
