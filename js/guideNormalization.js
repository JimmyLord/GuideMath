class GuideNormalization extends Guide
{
    constructor(mainProject, framework)
    {
        super( mainProject, framework );

        this.vertexOrigin = new vec2( 0, 0 );
        this.vertex1 = new vec2( 1.5, 0.5 );
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
        super.initWindows( "Normalization", force );
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
        let direction = this.vertex1.minus( this.vertexOrigin );
        let normalizedDir = direction.getNormalized();

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Normalization" );

        //if( this.vertexOrigin.distanceFrom( this.vertex1 ) == 0 )
        //{
        //    imgui.text( "Click and drag to create a vector" );
        //}

        // Add page selector.
        this.page = this.renderer.addPageSelector( this.framework, this.page, 2 );

        if( imgui.checkbox( "Show positions", this.showPositions ) )
        {
            this.showPositions = !this.showPositions;
        }

        if( this.page == 1 )
        {
            imgui.text( "Origin:     " + this.vertexOrigin.x.toFixed(decimals) + ", " + this.vertexOrigin.y.toFixed(decimals) );
            imgui.text( "Point:      " + this.vertex1.x.toFixed(decimals) + ", " + this.vertex1.y.toFixed(decimals) );
            imgui.text( "Direction:  " + direction.x.toFixed(decimals) + ", " + direction.y.toFixed(decimals) );
            imgui.text( "Magnitude:  " + direction.length().toFixed(decimals) );
            imgui.text( "Normalized: " + normalizedDir.x.toFixed(decimals) + ", " + normalizedDir.y.toFixed(decimals) );

            //imgui.text( "Mouse: " + this.mousePosition.x + ", " + this.mousePosition.y );

            imgui.window( "Definitions" );
            imgui.text( "Normalized vectors are direction vectors with a magnitude of 1.");
            imgui.text( "i.e. normalized dir vector = direction / magnitude");
            imgui.window( "Normalization" );
        }

        if( this.page == 2 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Calculate distance between points with pythagoras' theorem.");
            imgui.text( "i.e. magnitude squared = x*x + y*y");
            imgui.window( "Normalization" );

            imgui.text( "len = sqrt(x*x + y*y)");
            imgui.text( "Magnitude:  " + direction.length().toFixed(decimals) );
        }

        // Grid.
        if( this.mainProject.showGrid )
        {
            this.renderer.drawGrid( -3, 3, 0.2 );
        }

        // Text.
        {
            let p1, p2, midPos, str, x, y;
            imgui.window( "FullFrame" );

            // X length.
            p1 = this.vertexOrigin;
            p2 = new vec2( this.vertex1.x, p1.y );
            midPos = p1.plus( p2 ).dividedBy( 2 );
            str = "" + p1.minus( p2 ).length().toFixed(decimals);
            [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.vertexOrigin.y < this.vertex1.y )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale - 12 );
            imgui.text( str );

            if( this.showPositions )
            {
                str = "" + this.vertexOrigin.x.toFixed(decimals) + "," + this.vertexOrigin.y.toFixed(decimals);
                [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, this.vertexOrigin.x, this.vertexOrigin.y );
                if( p1.x < p2.x )
                    imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8, y / this.framework.imgui.scale );
                else
                    imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale );
                imgui.text( str );
            }

            // Y length.
            p2 = this.vertex1;
            p1 = new vec2( p2.x, this.vertexOrigin.y );
            midPos = p1.plus( p2 ).dividedBy( 2 );
            str = "" + p1.minus( p2 ).length().toFixed(decimals);
            [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.vertexOrigin.x < this.vertex1.x )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale - 8 / 2 );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 - 8, y / this.framework.imgui.scale - 8 / 2 );
            imgui.text( str );

            if( this.showPositions )
            {
                str = "" + this.vertex1.x.toFixed(decimals) + "," + this.vertex1.y.toFixed(decimals);
                [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, this.vertex1.x, this.vertex1.y );
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale );
                imgui.text( str );
            }

            // Hypotenuse.
            p1 = this.vertexOrigin;
            p2 = this.vertex1;
            midPos = p1.plus( p2 ).dividedBy( 2 );
            str = "" + p1.minus( p2 ).length().toFixed(decimals);
            [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.vertexOrigin.x < this.vertex1.x )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 - 8, y / this.framework.imgui.scale - 8 );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale - 8 );
            imgui.text( str );
        }

        // Colors.
        let startColor = this.framework.resources.materials["blue"];
        let endColor = this.framework.resources.materials["blue"];
        let xAxisColor = this.framework.resources.materials["red"];
        let yAxisColor = this.framework.resources.materials["green"];
        let normalizedColor = this.framework.resources.materials["white"];

        // Axes.
        this.renderer.drawVector( this.vertexOrigin, new vec2( this.vertex1.x, this.vertexOrigin.y ), xAxisColor );
        this.renderer.drawVector( new vec2( this.vertex1.x, this.vertexOrigin.y ), this.vertex1, yAxisColor );

        // Hypotenuse.
        this.renderer.drawVector( this.vertexOrigin, this.vertex1, endColor );

        // Hypotenuse normalized.
        this.renderer.drawVector( this.vertexOrigin, this.vertexOrigin.plus( this.vertex1.minus( this.vertexOrigin ).getNormalized() ), normalizedColor );

        // Start vertex position.
        this.renderer.drawPoint( new vec3( this.vertexOrigin.x, this.vertexOrigin.y, 0 ), startColor );

        // End vertex position.
        this.renderer.drawPoint( new vec3( this.vertex1.x, this.vertex1.y, 0 ), endColor );
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
