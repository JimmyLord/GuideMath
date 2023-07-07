function CreateGuide_CrossProduct(mainProject, framework)
{
    MasterGuideList["Math"]["CrossProduct"].guide = new GuideCrossProduct( mainProject, framework );
}

function RegisterGuide_CrossProduct()
{
    if( MasterGuideList["Math"] === undefined )
        MasterGuideList["Math"] = [];

    MasterGuideList["Math"]["CrossProduct"] = {};
    MasterGuideList["Math"]["CrossProduct"].createFunc = CreateGuide_CrossProduct;
    MasterGuideList["Math"]["CrossProduct"].guide = null;
}

class GuideCrossProduct extends Guide
{
    constructor(mainProject, framework)
    {
        let numPages = 4;
        super( mainProject, framework, numPages );

        this.vertexOrigin = new vec2( 0, 0 );
        this.vertex1 = new vec2( 2.0, 0.0 );
        this.vertex2 = new vec2( 1.0, 1.0 );
        this.vertexMoving = null;

        this.dragging = false;

        // To show the current angle.
        this.meshAngle = new MeshDynamic( this.framework.gl );
        this.numVerts = 90; //Math.round( thetaRadians * 20 );
        this.meshAngle.startShape( this.framework.gl.LINE_STRIP, this.numVerts+1 );

        // Settings.
        this.showPositions = false;
        this.normalizeVector1 = true;
        
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
        let v1 = new vec2();
        v1.set( this.vertex1.minus( this.vertexOrigin ) );
        let v2 = new vec2();
        v2.set( this.vertex2.minus( this.vertexOrigin ) );
        let crossProduct = v1.cross( v2 );

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Cross Product" );

        //if( this.vertexOrigin.distanceFrom( this.vertex1 ) == 0 )
        //{
        //    imgui.text( "Click and drag to create a vector" );
        //}

        // Add page selector.
        let switchedPage = this.switchPage( this.renderer.addPageSelector( this.framework, this.page, this.numPages ) );

        //if( imgui.checkbox( "Show positions", this.showPositions ) )
        //{
        //    this.showPositions = !this.showPositions;
        //}

        let showAbsoluteCoords = false;
        let showRelativeCoords = false;
        let showVectorForPoint = false;
        let showCrossProduct = false;
        let showLeftRightText = false;

        if( this.page === 1 )
        {
            imgui.window( "Definitions" );
            imgui.text( "One use of the cross product is to determine which side of a line a point is on." );
            imgui.window( "Cross Product" );

            showAbsoluteCoords = true;
            showLeftRightText = true;
        }

        if( this.page === 2 )
        {
            imgui.window( "Definitions" );
            imgui.text( "To simplify the calculation, subtract the origin from both points" );
            imgui.text( "   to make them both relative to (0,0)" );
            imgui.window( "Cross Product" );

            showVectorForPoint = true;
            showRelativeCoords = true;
        }

        if( this.page === 3 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Once the two points are relative to 0, the cross product can be calculated using:" );
            imgui.text( "   crossProduct = A.x*B.y - A.y*B.x" );
            imgui.window( "Cross Product" );

            showRelativeCoords = true;
            showCrossProduct = true;
        }

        if( this.page === 4 )
        {
            imgui.window( "Definitions" );
            imgui.text( "If the resulting value is positive its on the left of the line," );
            imgui.text( "   otherwise its on the right." );
            imgui.window( "Cross Product" );

            showRelativeCoords = true;
            showCrossProduct = true;
            showLeftRightText = true;
        }

        if( showAbsoluteCoords )
        {
            imgui.text( "Origin: " + this.vertexOrigin.x.toFixed(decimals) + ", " + this.vertexOrigin.y.toFixed(decimals) );
            imgui.text( "A:      " + this.vertex1.x.toFixed(decimals) + ", " + this.vertex1.y.toFixed(decimals) );
            imgui.text( "B:      " + this.vertex2.x.toFixed(decimals) + ", " + this.vertex2.y.toFixed(decimals) );
            if( showCrossProduct )
                imgui.text( "cross: " + crossProduct.toFixed(decimals) );
        }

        if( showRelativeCoords )
        {
            imgui.text( "Origin: " + (0.0).toFixed(decimals) + ", " + (0.0).toFixed(decimals) );
            imgui.text( "A:      " + v1.x.toFixed(decimals) + ", " + v1.y.toFixed(decimals) );
            imgui.text( "B:      " + v2.x.toFixed(decimals) + ", " + v2.y.toFixed(decimals) );
            if( showCrossProduct )
                imgui.text( "cross: " + crossProduct.toFixed(decimals) );
        }

        // Grid.
        if( this.mainProject.showGrid )
        {
            this.renderer.drawGrid( -3, 3, 0.2 );
        }

        // Text.
        imgui.window( "FullFrame" );
        
        if( showLeftRightText )
        {            
            // Print left or right.
            let p1 = this.vertex2;
            if( crossProduct > 0 )
                this.renderer.drawString( "Left", p1.x, p1.y - 0.05, align.x.center, align.y.top );
            else
                this.renderer.drawString( "Right", p1.x, p1.y - 0.05, align.x.center, align.y.top );
        }

        // Colors.
        let colorV0 = this.framework.resources.materials["white"];
        if( showAbsoluteCoords )
        {
            colorV0 = this.framework.resources.materials["blue"];
        }
        let colorV1 = this.framework.resources.materials["blue"];
        let colorV2 = this.framework.resources.materials["green"];

        // 2 Vectors.
        this.renderer.drawVector( this.vertexOrigin, this.vertex1, colorV1 );
        if( showVectorForPoint )
        {
            this.renderer.drawVector( this.vertexOrigin, this.vertex2, colorV2 );
        }

        // Vertices.
        this.renderer.drawPoint( new vec3( this.vertexOrigin.x, this.vertexOrigin.y, 0 ), colorV0 );
        this.renderer.drawPoint( new vec3( this.vertex1.x, this.vertex1.y, 0 ), colorV1 );
        this.renderer.drawPoint( new vec3( this.vertex2.x, this.vertex2.y, 0 ), colorV2 );
    }

    onMouseMove(x, y)
    {
        let worldPos = super.onMouseMove( x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( this.dragging )
        {
            this.vertexMoving.set( this.mousePosition );
        }
    }

    onMouseDown(buttonID, x, y)
    {
        let worldPos = super.onMouseDown( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID === 0 )
        {
            //this.vertexOrigin.setF32( worldPos.x, worldPos.y );
            if( this.vertex1.distanceFrom( new vec2( worldPos.x, worldPos.y ) ) < 0.15 )
            {
                this.vertexMoving = this.vertex1;
            }
            if( this.vertex2.distanceFrom( new vec2( worldPos.x, worldPos.y ) ) < 0.15 )
            {
                this.vertexMoving = this.vertex2;
            }
            else if( this.vertexOrigin.distanceFrom( new vec2( worldPos.x, worldPos.y ) ) < 0.15 )
            {
                this.vertexMoving = this.vertexOrigin;
            }

            if( this.vertexMoving != null )
            {
                this.vertexMoving.setF32( worldPos.x, worldPos.y );
                this.dragging = true;
            }
        }
    }

    onMouseUp(buttonID, x, y)
    {
        let worldPos = super.onMouseUp( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID === 0 && this.dragging === true )
        {
            this.vertexMoving.setF32( worldPos.x, worldPos.y );
            this.vertexMoving = null;
            this.dragging = false;
        }
    }
}

RegisterGuide_CrossProduct();
