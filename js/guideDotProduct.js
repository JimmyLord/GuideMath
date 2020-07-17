function CreateGuide_DotProduct(mainProject, framework)
{
    MasterGuideList["Math"]["DotProduct"].guide = new GuideDotProduct( mainProject, framework );
}

function RegisterGuide_DotProduct()
{
    if( MasterGuideList["Math"] === undefined )
        MasterGuideList["Math"] = [];

    MasterGuideList["Math"]["DotProduct"] = {};
    MasterGuideList["Math"]["DotProduct"].createFunc = CreateGuide_DotProduct;
    MasterGuideList["Math"]["DotProduct"].guide = null;
}

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
        this.showPositions = false;
        
        // Init imgui window positions and sizes.
        this.initWindows( false );
    }

    initWindows(force)
    {
        super.initWindows( "Dot Product", force );
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
        let dotProduct = v1.dot( v2 );
        let len1 = v1.length();
        let len2 = v2.length();
        let cosTheta = dotProduct / (len1 * len2);
        let thetaRadians = Math.acos( cosTheta );
        let thetaDegrees = Math.acos( cosTheta ) / Math.PI * 180;

        let v1normalized = v1.getNormalized();
        let dotForProjection = v1normalized.dot( v2 );
        let projectedPoint = this.vertexOrigin.plus( v1normalized.times( dotForProjection ) );

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Dot Product" );

        //if( this.vertexOrigin.distanceFrom( this.vertex1 ) == 0 )
        //{
        //    imgui.text( "Click and drag to create a vector" );
        //}

        // Add page selector.
        let numPages = 3;
        let switchedPage = this.switchPage( this.renderer.addPageSelector( this.framework, this.page, numPages ) );

        //if( imgui.checkbox( "Show positions", this.showPositions ) )
        //{
        //    this.showPositions = !this.showPositions;
        //}

        if( this.page == 1 )
        {
            imgui.window( "Definitions" );
            imgui.text( "The dot product of 2 vectors describes the relationship between those 2 vectors");
            imgui.text( "as follows: dotProduct = ||A|| * ||B|| * cos(θ)");
            imgui.window( "Dot Product" );
        }

        if( this.page == 2 )
        {
            imgui.window( "Definitions" );
            imgui.text( "dotProduct = ||A|| * ||B|| * cos(θ)");
            imgui.text( "reordered: cos(θ) = dotProduct / (||A|| * ||B||)");
            imgui.window( "Dot Product" );
        }

        if( this.page == 3 )
        {
            imgui.window( "Definitions" );
            imgui.text( "The dot product can be calculated easily:");
            imgui.text( "dotProduct = v1.x*v2.x + v1.y*v2.y");
            imgui.window( "Dot Product" );
        }

        imgui.text( "A:   " + this.vertex1.x.toFixed(decimals) + ", " + this.vertex1.y.toFixed(decimals) );
        imgui.text( "B:   " + this.vertex2.x.toFixed(decimals) + ", " + this.vertex2.y.toFixed(decimals) );
        imgui.text( "Magnitude of A: " + len1.toFixed(decimals) );
        imgui.text( "Magnitude of B: " + len2.toFixed(decimals) );
        imgui.text( "dot:    " + dotProduct.toFixed(decimals) );
        imgui.text( "cos(θ): " + cosTheta.toFixed(decimals) );
        imgui.text( "θ:      " + thetaRadians.toFixed(decimals) + " radians" );
        imgui.text( "θ:      " + thetaDegrees.toFixed(decimals) + " degrees" );

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

RegisterGuide_DotProduct();
