class GuideAngularVelocity
{
    constructor(mainProject, framework)
    {
        this.mainProject = mainProject;
        this.framework = framework;
        this.vertexRadius = 0.5;
        
        this.renderer = new RenderHelpers( this.framework, mainProject.camera );

        // Assign the camera.
        this.camera = mainProject.camera;

        // Init imgui window positions and sizes.
        let w = this.framework.canvas.width / this.framework.imgui.scale;
        let h = this.framework.canvas.height / this.framework.imgui.scale;

        this.framework.imgui.initWindow( "FullFrame", true, new vec2(0,0), new vec2(w,h), false, false );
        this.framework.imgui.initWindow( "Angular Velocity", true, new vec2(2,2), new vec2(205,95) );
    }

    free()
    {
    }

    update(deltaTime)
    {
    }

    draw()
    {
        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Angular Velocity" );

        //if( this.startPosition.distanceFrom( this.endPosition ) == 0 )
        //{
        //    imgui.text( "Click and drag to create a vector" );
        //}

        //if( imgui.checkbox( "Show positions", this.showPositions ) )
        //{
        //    this.showPositions = !this.showPositions;
        //}

        //imgui.text( "Point 1:    " + this.startPosition.x.toFixed(decimals) + ", " + this.startPosition.y.toFixed(decimals) );
        //imgui.text( "Point 2:    " + this.endPosition.x.toFixed(decimals) + ", " + this.endPosition.y.toFixed(decimals) );
        //let direction = this.endPosition.minus( this.startPosition );
        //imgui.text( "Direction:  " + direction.x.toFixed(decimals) + ", " + direction.y.toFixed(decimals) );
        //imgui.text( "Magnitude:  " + direction.length().toFixed(decimals) );
        //direction.normalize();
        //imgui.text( "Normalized: " + direction.x.toFixed(decimals) + ", " + direction.y.toFixed(decimals) );

        // Colors.
        let lineColor = this.framework.resources.materials["white"];
        let pointColor = this.framework.resources.materials["green"];

        // Grid.
        this.renderer.drawGrid( -3, 3, 0.2 );

        // Text.
        {
            let p1, p2, midPos, str, x, y;
            imgui.window( "FullFrame" );

            // X length.
            //p1 = this.startPosition;
            //p2 = new vec2( this.endPosition.x, p1.y );
            //midPos = p1.plus( p2 ).dividedBy( 2 );
            //str = "" + p1.minus( p2 ).length().toFixed(decimals);
            //[x,y] = this.camera.convertOrthoToScreen( this.framework.canvas, midPos.x, midPos.y );
            //if( this.startPosition.y < this.endPosition.y )
            //    imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale );
            //else
            //    imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale - 12 );
            //imgui.text( str );
        }

        let center = new vec2(0);
        let pos = new vec2(1);
        let dir = pos.minus( center );
        dir.normalize();

        // Shapes.
        this.renderer.drawPoint( center, pointColor );
        //this.renderer.drawCircle( 30, center, circleColor );
        this.renderer.drawVector( center, dir, lineColor );
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
