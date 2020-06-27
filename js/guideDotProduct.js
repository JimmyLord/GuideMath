class GuideDotProduct extends Guide
{
    constructor(mainProject, framework)
    {
        super( mainProject, framework );

        this.vertexOrigin = new vec2( 0, 0 );
        this.vertex1 = new vec2( 2.0, 0.0 );
        this.vertex2 = new vec2( 1.0, 1.0 );
        this.vertexMoving = null;

        this.dragging = false;

        // Settings.
        this.page = 1;
        this.showPositions = false;
        
        // Init imgui window positions and sizes.
        this.initWindows( false );
    }

    initWindows(force)
    {
        super.initWindows( force );

        let w = this.framework.canvas.width / this.framework.imgui.scale;
        let h = this.framework.canvas.height / this.framework.imgui.scale;

        this.framework.imgui.initWindow( "FullFrame", !force, new vec2(0,0), new vec2(w,h), false, false );
        this.framework.imgui.initWindow( "Definitions", !force, new vec2(2,12), new vec2(600,40) );
        this.framework.imgui.initWindow( "Dot Product", !force, new vec2(2,55), new vec2(205,110) );
    }

    free()
    {
    }

    update(deltaTime)
    {
        super.update( deltaTime );
    }

    draw()
    {
        let decimals = 2;

        // Calculate some values.
        let v1 = this.vertex1.minus( this.vertexOrigin );
        let v2 = this.vertex2.minus( this.vertexOrigin );
        v1.normalize();
        let dot = v1.dot( v2 );
        let projectedPoint = this.vertexOrigin.plus( v1.times( dot ) );

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Dot Product" );

        //if( this.vertexOrigin.distanceFrom( this.vertex1 ) == 0 )
        //{
        //    imgui.text( "Click and drag to create a vector" );
        //}

        // Add page selector.
        this.page = this.renderer.addPageSelector( this.framework, this.page, 2 );

        //if( imgui.checkbox( "Show positions", this.showPositions ) )
        //{
        //    this.showPositions = !this.showPositions;
        //}

        if( this.page == 1 )
        {
            imgui.window( "Definitions" );
            imgui.text( "dot = ||A|| * ||B|| * cos(θ)");
            imgui.text( "reordered: cos(θ) = dot / ||A|| * ||B||");
            imgui.window( "Dot Product" );

            imgui.text( "A:      " + this.vertex1.x.toFixed(decimals) + ", " + this.vertex1.y.toFixed(decimals) );
            imgui.text( "B:      " + this.vertex2.x.toFixed(decimals) + ", " + this.vertex2.y.toFixed(decimals) );
            imgui.text( "dot:    " + dot.toFixed(decimals) );
        }

        if( this.page == 2 )
        {
            imgui.window( "Definitions" );
            imgui.text( "dot = v1.x*v2.x + v1.y*v2.y");
            imgui.window( "Dot Product" );

            imgui.text( "dot:  " + dot.toFixed(decimals) );
        }

        // Grid.
        if( this.mainProject.showGrid )
        {
            this.renderer.drawGrid( -3, 3, 0.2 );
        }

        // Text.

        // Colors.
        let colorV1 = this.framework.resources.materials["blue"];
        let colorV2 = this.framework.resources.materials["green"];
        let colorProjectedVector = this.framework.resources.materials["red"];
        let colorProjectionLine = this.framework.resources.materials["white"];

        // Axes.
        //this.renderer.drawVector( this.vertexOrigin, new vec2( this.vertex1.x, this.vertexOrigin.y ), xAxisColor );
        //this.renderer.drawVector( new vec2( this.vertex1.x, this.vertexOrigin.y ), this.vertex1, yAxisColor );

        // 2 Vectors.
        this.renderer.drawVector( this.vertexOrigin, this.vertex1, colorV1 );
        this.renderer.drawVector( this.vertexOrigin, this.vertex2, colorV2 );

        // Projection line.
        this.renderer.drawVector( this.vertex2, projectedPoint, colorProjectionLine );

        // Vertices.
        this.renderer.drawPoint( new vec3( this.vertexOrigin.x, this.vertexOrigin.y, 0 ), colorV1 );
        this.renderer.drawPoint( new vec3( this.vertex1.x, this.vertex1.y, 0 ), colorV1 );
        this.renderer.drawPoint( new vec3( this.vertex2.x, this.vertex2.y, 0 ), colorV2 );

        // Projected vector.
        this.renderer.drawVector( this.vertexOrigin, projectedPoint, colorProjectedVector );

        // Hypotenuse normalized.
        //this.renderer.drawVector( this.vertexOrigin, this.vertexOrigin.plus( this.vertex1.minus( this.vertexOrigin ).getNormalized() ), normalizedColor );
    }

    onMouseMove(x, y)
    {
        let [worldX, worldY] = super.onMouseMove( x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( this.dragging )
        {
            this.vertexMoving.set( this.mousePosition );
        }
    }

    onMouseDown(buttonID, x, y)
    {
        let [worldX, worldY] = super.onMouseDown( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID == 0 )
        {
            //this.vertexOrigin.setF32( worldX, worldY );
            if( this.vertex1.distanceFrom( new vec2( worldX, worldY ) ) < 0.15 )
            {
                this.vertexMoving = this.vertex1;
            }
            if( this.vertex2.distanceFrom( new vec2( worldX, worldY ) ) < 0.15 )
            {
                this.vertexMoving = this.vertex2;
            }
            else if( this.vertexOrigin.distanceFrom( new vec2( worldX, worldY ) ) < 0.15 )
            {
                this.vertexMoving = this.vertexOrigin;
            }

            if( this.vertexMoving != null )
            {
                this.vertexMoving.setF32( worldX, worldY );
                this.dragging = true;
            }
        }
    }

    onMouseUp(buttonID, x, y)
    {
        let [worldX, worldY] = super.onMouseUp( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID == 0 && this.dragging == true )
        {
            this.vertexMoving.setF32( worldX, worldY );
            this.vertexMoving = null;
            this.dragging = false;
        }
    }
}
