class GuideNormalization extends Guide
{
    constructor(mainProject, framework)
    {
        super( mainProject, framework );

        this.vertexRadius = 0.5;

        this.startPosition = new vec2( 0, 0 );
        this.endPosition = new vec2( 1.5, 0.5 );

        this.dragging = false;

        // Settings.
        this.page = 1;
        this.showPositions = false;
        
        // Init imgui window positions and sizes.
        this.initWindows( false );
    }

    initWindows(force)
    {
        let w = this.framework.canvas.width / this.framework.imgui.scale;
        let h = this.framework.canvas.height / this.framework.imgui.scale;

        this.framework.imgui.initWindow( "FullFrame", !force, new vec2(0,0), new vec2(w,h), false, false );
        this.framework.imgui.initWindow( "Definitions", !force, new vec2(2,12), new vec2(600,40) );
        this.framework.imgui.initWindow( "Normalization", !force, new vec2(2,55), new vec2(205,110) );
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
        let direction = this.endPosition.minus( this.startPosition );
        let normalizedDir = direction.getNormalized();

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Normalization" );

        //if( this.startPosition.distanceFrom( this.endPosition ) == 0 )
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
            imgui.text( "Point 1:    " + this.startPosition.x.toFixed(decimals) + ", " + this.startPosition.y.toFixed(decimals) );
            imgui.text( "Point 2:    " + this.endPosition.x.toFixed(decimals) + ", " + this.endPosition.y.toFixed(decimals) );
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

        // Colors.
        let startColor = this.framework.resources.materials["blue"];
        let endColor = this.framework.resources.materials["blue"];
        let xAxisColor = this.framework.resources.materials["red"];
        let yAxisColor = this.framework.resources.materials["green"];
        let normalizedColor = this.framework.resources.materials["white"];

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
            p1 = this.startPosition;
            p2 = new vec2( this.endPosition.x, p1.y );
            midPos = p1.plus( p2 ).dividedBy( 2 );
            str = "" + p1.minus( p2 ).length().toFixed(decimals);
            [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.startPosition.y < this.endPosition.y )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale - 12 );
            imgui.text( str );

            if( this.showPositions )
            {
                str = "" + this.startPosition.x.toFixed(decimals) + "," + this.startPosition.y.toFixed(decimals);
                [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, this.startPosition.x, this.startPosition.y );
                if( p1.x < p2.x )
                    imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8, y / this.framework.imgui.scale );
                else
                    imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale );
                imgui.text( str );
            }

            // Y length.
            p2 = this.endPosition;
            p1 = new vec2( p2.x, this.startPosition.y );
            midPos = p1.plus( p2 ).dividedBy( 2 );
            str = "" + p1.minus( p2 ).length().toFixed(decimals);
            [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.startPosition.x < this.endPosition.x )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale - 8 / 2 );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 - 8, y / this.framework.imgui.scale - 8 / 2 );
            imgui.text( str );

            if( this.showPositions )
            {
                str = "" + this.endPosition.x.toFixed(decimals) + "," + this.endPosition.y.toFixed(decimals);
                [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, this.endPosition.x, this.endPosition.y );
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale );
                imgui.text( str );
            }

            // Hypotenuse.
            p1 = this.startPosition;
            p2 = this.endPosition;
            midPos = p1.plus( p2 ).dividedBy( 2 );
            str = "" + p1.minus( p2 ).length().toFixed(decimals);
            [x,y] = this.camera.convertWorldToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.startPosition.x < this.endPosition.x )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 - 8, y / this.framework.imgui.scale - 8 );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale - 8 );
            imgui.text( str );
        }

        // Axes.
        this.renderer.drawVector( this.startPosition, new vec2( this.endPosition.x, this.startPosition.y ), xAxisColor );
        this.renderer.drawVector( new vec2( this.endPosition.x, this.startPosition.y ), this.endPosition, yAxisColor );

        // Hypotenuse.
        this.renderer.drawVector( this.startPosition, this.endPosition, endColor );

        // Hypotenuse normalized.
        this.renderer.drawVector( this.startPosition, this.startPosition.plus( this.endPosition.minus( this.startPosition ).getNormalized() ), normalizedColor );

        // Start vertex position.
        this.renderer.drawPoint( new vec3( this.startPosition.x, this.startPosition.y, 0 ), startColor );

        // End vertex position.
        this.renderer.drawPoint( new vec3( this.endPosition.x, this.endPosition.y, 0 ), endColor );
    }

    onMouseMove(x, y)
    {
        let [orthoX, orthoY] = super.onMouseMove( x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( this.dragging )
        {
            this.endPosition.set( this.mousePosition );
        }
    }

    onMouseDown(buttonID, x, y)
    {
        let [orthoX, orthoY] = super.onMouseDown( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID == 0 )
        {
            this.startPosition.setF32( orthoX, orthoY );
            this.endPosition.setF32( orthoX, orthoY );
            this.dragging = true;
        }
    }

    onMouseUp(buttonID, x, y)
    {
        let [orthoX, orthoY] = super.onMouseUp( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID == 0 && this.dragging == true )
        {
            this.endPosition.setF32( orthoX, orthoY );
            this.dragging = false;
        }
    }
}
