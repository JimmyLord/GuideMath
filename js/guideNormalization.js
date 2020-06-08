class GuideNormalization
{
    constructor(mainProject, framework, vertexMesh, vertexMaterial)
    {
        this.mainProject = mainProject;
        this.framework = framework;
        this.vertexMesh = vertexMesh;
        this.vertexMaterial = vertexMaterial;
        this.vertexRadius = 0.5;

        this.mousePosition = new vec2( 0, 0 );
        this.startPosition = new vec2( 0, 0 );
        this.endPosition = new vec2( 0, 0 );

        this.dragging = false;

        // Settings.
        this.showPositions = false;
        
        // Assign the camera.
        this.camera = mainProject.camera;

        // Init imgui window positions and sizes.
        let w = this.framework.canvas.width / this.framework.imgui.scale;
        let h = this.framework.canvas.height / this.framework.imgui.scale;

        this.framework.imgui.initWindow( "Normalization", true, new vec2(2,2), new vec2(270,45) );
        this.framework.imgui.initWindow( "FullFrame", true, new vec2(0,0), new vec2(w,h), false, false );
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
        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Normalization" );

        if( this.startPosition.distanceFrom( this.endPosition ) == 0 )
        {
            imgui.text( "Click and drag to create a vector" );
        }

        if( imgui.checkbox( "Show positions", this.showPositions ) )
        {
            this.showPositions = !this.showPositions;
        }

        //imgui.text( "Mouse: " + this.mousePosition.x + ", " + this.mousePosition.y );

        // Draw the guide.
        let vertexMesh = this.framework.resources.meshes["vertex"];
        let edgeMesh = this.framework.resources.meshes["edge"];
        let startColor = this.framework.resources.materials["blue"];
        let endColor = this.framework.resources.materials["blue"];
        let xAxisColor = this.framework.resources.materials["red"];
        let yAxisColor = this.framework.resources.materials["green"];
        let normalizedColor = this.framework.resources.materials["white"];

        let matWorld = new mat4;

        // Text.
        {
            let p1, p2, midPos, str, x, y;
            imgui.window( "FullFrame" );
            let decimals = 2;

            // X length.
            p1 = this.startPosition;
            p2 = new vec2( this.endPosition.x, p1.y );
            midPos = p1.plus( p2 ).dividedBy( 2 );
            str = "" + p1.minus( p2 ).length().toFixed(decimals);
            [x,y] = this.camera.convertOrthoToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.startPosition.y < this.endPosition.y )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale - 12 );
            imgui.text( str );

            if( this.showPositions )
            {
                str = "" + this.startPosition.x.toFixed(decimals) + "," + this.startPosition.y.toFixed(decimals);
                [x,y] = this.camera.convertOrthoToScreen( this.framework.canvas, this.startPosition.x, this.startPosition.y );
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
            [x,y] = this.camera.convertOrthoToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.startPosition.x < this.endPosition.x )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale - 8 / 2 );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 - 8, y / this.framework.imgui.scale - 8 / 2 );
            imgui.text( str );

            if( this.showPositions )
            {
                str = "" + this.endPosition.x.toFixed(decimals) + "," + this.endPosition.y.toFixed(decimals);
                [x,y] = this.camera.convertOrthoToScreen( this.framework.canvas, this.endPosition.x, this.endPosition.y );
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale );
                imgui.text( str );
            }

            // Hypotenuse.
            p1 = this.startPosition;
            p2 = this.endPosition;
            midPos = p1.plus( p2 ).dividedBy( 2 );
            str = "" + p1.minus( p2 ).length().toFixed(decimals);
            [x,y] = this.camera.convertOrthoToScreen( this.framework.canvas, midPos.x, midPos.y );
            if( this.startPosition.x < this.endPosition.x )
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 - 8, y / this.framework.imgui.scale - 8 );
            else
                imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale, y / this.framework.imgui.scale - 8 );
            imgui.text( str );
        }

        // X axis.
        {
            let p1 = this.startPosition;
            let p2 = new vec2( this.endPosition.x, p1.y );

            let midPos = p1.plus( p2 ).dividedBy( 2 );
            let distance = p1.distanceFrom( p2 );
            let d = p1.minus( p2 );
            let angle = Math.atan2( d.y, d.x ) * 180.0 / Math.PI;

            let pos3 = new vec3( midPos.x, midPos.y, 0 );
            matWorld.createSRT( new vec3(distance, 1, 0), new vec3(0,0,-angle), pos3 );
            edgeMesh.draw( this.camera, matWorld, xAxisColor );
        }

        // Y axis.
        {
            let p2 = this.endPosition;
            let p1 = new vec2( p2.x, this.startPosition.y );

            let midPos = p1.plus( p2 ).dividedBy( 2 );
            let distance = p1.distanceFrom( p2 );
            let d = p1.minus( p2 );
            let angle = Math.atan2( d.y, d.x ) * 180.0 / Math.PI;

            let pos3 = new vec3( midPos.x, midPos.y, 0 );
            matWorld.createSRT( new vec3(distance, 1, 0), new vec3(0,0,-angle), pos3 );
            edgeMesh.draw( this.camera, matWorld, yAxisColor );
        }

        // Hypotenuse. Edge between verts.
        {
            let p1 = this.startPosition;
            let p2 = this.endPosition;

            let midPos = p1.plus( p2 ).dividedBy( 2 );
            let distance = p1.distanceFrom( p2 );
            let d = p1.minus( p2 );
            let angle = Math.atan2( d.y, d.x ) * 180.0 / Math.PI;

            let pos3 = new vec3( midPos.x, midPos.y, 0 );
            matWorld.createSRT( new vec3(distance, 1, 0), new vec3(0,0,-angle), pos3 );
            edgeMesh.draw( this.camera, matWorld, endColor );
        }

        // Hypotenuse normalized.
        {
            let p1 = this.startPosition;
            let p2 = this.startPosition.plus( this.endPosition.minus( this.startPosition ).getNormalized() );

            let midPos = p1.plus( p2 ).dividedBy( 2 );
            let distance = p1.distanceFrom( p2 );
            let d = p1.minus( p2 );
            let angle = Math.atan2( d.y, d.x ) * 180.0 / Math.PI;

            let pos3 = new vec3( midPos.x, midPos.y, 0 );
            matWorld.createSRT( new vec3(distance, 1, 0), new vec3(0,0,-angle), pos3 );
            edgeMesh.draw( this.camera, matWorld, normalizedColor );
        }

        // Start vertex position.
        {
            let matWorld = new mat4;
            matWorld.createSRT( new vec3(0.5), new vec3(0), new vec3( this.startPosition.x, this.startPosition.y, 0 ) );
            vertexMesh.draw( this.camera, matWorld, startColor );
        }

        // End vertex position.
        {
            let matWorld = new mat4;
            matWorld.createSRT( new vec3(0.5), new vec3(0), new vec3( this.endPosition.x, this.endPosition.y, 0 ) );
            vertexMesh.draw( this.camera, matWorld, endColor );
        }
    }

    onMouseMove(x, y, orthoX, orthoY)
    {
        if( this.framework.imgui.isHoveringWindow )
            return;

        this.mousePosition.setF32( orthoX, orthoY );

        if( this.dragging )
        {
            this.endPosition.set( this.mousePosition );
        }
    }

    onMouseDown(buttonID, x, y, orthoX, orthoY)
    {
        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID == 0 )
        {
            this.startPosition.setF32( orthoX, orthoY );
            this.endPosition.setF32( orthoX, orthoY );
            this.dragging = true;
        }
    }

    onMouseUp(buttonID, x, y, orthoX, orthoY)
    {
        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID == 0 )
        {
            this.endPosition.setF32( orthoX, orthoY );
            this.dragging = false;
        }
    }

    onMouseWheel(direction)
    {
    }

    onKeyDown(keyCode)
    {
    }
}
