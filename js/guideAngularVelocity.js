class GuideAngularVelocity
{
    constructor(mainProject, framework, vertexMesh, vertexMaterial)
    {
        this.mainProject = mainProject;
        this.framework = framework;
        this.vertexMesh = vertexMesh;
        this.vertexMaterial = vertexMaterial;
        this.vertexRadius = 0.5;
        
        // Assign the camera.
        this.camera = mainProject.camera;

        // Init imgui window positions and sizes.
        let w = this.framework.canvas.width / this.framework.imgui.scale;
        let h = this.framework.canvas.height / this.framework.imgui.scale;

        this.framework.imgui.initWindow( "Guides", true, new vec2(2,2), new vec2(110,115) );
    }

    free()
    {
        this.vertexMesh = null;
        this.vertexMaterial = null;
    }

    update(deltaTime)
    {
    }

    draw()
    {
        {
            let pos3 = new vec3( 0, 0, 0 );

            // Draw a vertex.
            let matWorld = new mat4;
            matWorld.createSRT( new vec3(1), new vec3(0), pos3 );

            let material = this.vertexMaterial;

            this.vertexMesh.draw( this.camera, matWorld, material );
        }
    }

    onMouseMove(x, y, orthoX, orthoY)
    {
        if( this.framework.imgui.isHoveringWindow )
            return;
    }

    onMouseDown(buttonID, x, y, orthoX, orthoY)
    {
        if( this.framework.imgui.isHoveringWindow )
            return;
    }

    onMouseUp(buttonID, x, y, orthoX, orthoY)
    {
        if( this.framework.imgui.isHoveringWindow )
            return;
    }

    onMouseWheel(direction)
    {
    }

    onKeyDown(keyCode)
    {
    }
}
