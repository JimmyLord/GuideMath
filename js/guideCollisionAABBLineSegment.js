function CreateGuide_CollisionAABBLineSegment(mainProject, framework)
{
    MasterGuideList["Collision"]["AABB v Line Segment"].guide = new GuideCollisionAABBLineSegment( mainProject, framework );
}

function RegisterGuide_CollisionAABBLineSegment()
{
    if( MasterGuideList["Collision"] === undefined )
        MasterGuideList["Collision"] = [];

    MasterGuideList["Collision"]["AABB v Line Segment"] = {};
    MasterGuideList["Collision"]["AABB v Line Segment"].createFunc = CreateGuide_CollisionAABBLineSegment;
    MasterGuideList["Collision"]["AABB v Line Segment"].guide = null;
}

class GuideCollisionAABBLineSegment extends Guide
{
    constructor(mainProject, framework)
    {
        let numPages = 1;
        super( mainProject, framework, numPages );

        this.vectorStart = new vec2( 0, 0 );
        this.vectorEnd = new vec2( 2.0, 0.0 );
        this.intersectPoint = new vec2( 2.0, 0.0 );
        this.vertexMoving = null;

        this.meshSelected = -1;
        this.meshSelectionOffset = new vec2();
        this.meshSelectionOffsetAngle = 0;

        this.draggingVertex = false;

        // Temp value when switching meshes, to avoid issues with number of edges, etc.
        this.meshNextFrame = null;

        // Define some meshes for selection.
        {
            this.meshBox = new Mesh( this.framework.gl );
            this.meshBox.createBox( 0.5, 0.5, true );

            this.meshRectangle = new Mesh( this.framework.gl );
            this.meshRectangle.createBox( 0.8, 0.3, true );
        }

        this.mesh = this.meshBox;
        this.meshPos = new vec2( 1, 0 );
        this.meshRot = 0;
        this.meshColor = this.framework.resources.materials["red"];

        // Init imgui window positions and sizes.
        this.initWindows( false );
    }

    initWindows(force)
    {
        super.initWindows( "AABB v Line Segment", force );
    }

    free()
    {
    }

    update(deltaTime)
    {
        super.update( deltaTime );

        if( this.meshNextFrame !== null )
        {
            this.mesh = this.meshNextFrame;
            this.meshNextFrame = null;
        }
    }

    rotatePoint(point, angle)
    {
        let matRot = new mat4();
        matRot.setIdentity();
        matRot.rotate( angle, 0, 0, 1 );
        let rotatedPoint = matRot.transformVec4( vec4.getTemp( point.x, point.y, 0, 1 ) );
        return vec2.getTemp( rotatedPoint.x, rotatedPoint.y );
    }

    // Return [hit, lowFraction, highFraction]
	clipLine(axis, aabb, start, end, lowFraction, highFraction)
	{
		let lowAxis;
		let highAxis;
		let startAxis;
		let endAxis;

		if( axis == 0 )
		{
			lowAxis = aabb.bl.x;
			highAxis = aabb.tr.x;
			startAxis = start.x;
			endAxis = end.x;
		}
		else
		{
			lowAxis = aabb.bl.y;
			highAxis = aabb.tr.y;
			startAxis = start.y;
			endAxis = end.y;
		}

		let lowFractionAxis = (lowAxis - startAxis) / (endAxis - startAxis);
		let highFractionAxis = (highAxis - startAxis) / (endAxis - startAxis);

		if( highFractionAxis < lowFractionAxis )
			[lowFractionAxis, highFractionAxis] = [highFractionAxis, lowFractionAxis];

		if( highFractionAxis < lowFraction )
			return [false];

		if( lowFractionAxis > highFraction )
			return [false];

		lowFraction = Math.max( lowFractionAxis, lowFraction );
		highFraction = Math.min( highFractionAxis, highFraction );

		if( lowFraction > highFraction )
			return [false];

		return [true, lowFraction, highFraction];
	}

    // Returns [hit, intersectPoint, fraction]
	intersectAABBLineSegment(aabb, start, end)
	{
        let hit = false;
		let lowFraction = 0;
		let highFraction = 1;

		[hit, lowFraction, highFraction] = this.clipLine( 0, aabb, start, end, lowFraction, highFraction );
        if( hit === false )
			return [false];

		[hit, lowFraction, highFraction] = this.clipLine( 1, aabb, start, end, lowFraction, highFraction );
        if( hit === false )
			return [false];

		let direction = end.minus( start );
		let point = start.plus( direction.times( lowFraction ) );
		let fraction = lowFraction;

		return [true, point, fraction];
	}

    draw()
    {
        let decimals = 2;

        // Calculate some values.
        this.intersectPoint.set( this.vectorEnd );

        let aabb = {};
        aabb.bl = this.meshPos.plus( this.mesh.getVertexPosition(0) );
        aabb.tr = this.meshPos.plus( this.mesh.getVertexPosition(2) );
        let hit = false;
        let point = null;
        let fraction = 0;
        [hit, point, fraction] = this.intersectAABBLineSegment( aabb, this.vectorStart, this.vectorEnd );
        if( hit )
        {
            this.intersectPoint.set( point );
        }

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "AABB v Line Segment" );

        // Add page selector.
        let switchedPage = this.switchPage( this.renderer.addPageSelector( this.framework, this.page, this.numPages ) );

        // Options.
        let showMeshSelection = true;

        if( this.page === 1 )
        {
            imgui.window( "Definitions" );
            imgui.text( "WIP" );
            //imgui.text( "" );
            imgui.window( "AABB v Line Segment" );
        }

        if( this.page === 2 )
        {
            imgui.window( "Definitions" );
            //imgui.text( "" );
            //imgui.text( "" );
            imgui.window( "AABB v Line Segment" );
        }

        if( this.page === 3 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "" );
            imgui.window( "AABB v Line Segment" );
        }

        if( showMeshSelection )
        {
            if( imgui.button( "Box" ) )
            {
                this.meshNextFrame = this.meshBox;
            }
            if( imgui.button( "Rect" ) )
            {
                this.meshNextFrame = this.meshRectangle;
            }
        }

        // Colors.
        let colorV1 = this.framework.resources.materials["blue"];
        let colorIntersect = this.framework.resources.materials["green"];

        // Grid.
        if( this.mainProject.showGrid )
        {
            this.renderer.drawGrid( -3, 3, 0.2 );
        }

        // Meshes.
        this.renderer.drawMesh( this.mesh, this.meshPos, this.meshRot, this.meshColor );

        // 2 Vectors.
        this.renderer.drawVector( this.vectorStart, this.vectorEnd, colorV1 );
        this.renderer.drawVector( this.vectorStart, this.intersectPoint, colorIntersect );

        // Vertices.
        this.renderer.drawPoint( new vec3( this.vectorStart.x, this.vectorStart.y, 0 ), colorV1 );
        this.renderer.drawPoint( new vec3( this.vectorEnd.x, this.vectorEnd.y, 0 ), colorV1 );
        this.renderer.drawPoint( new vec3( this.intersectPoint.x, this.intersectPoint.y, 0 ), colorIntersect );
    }

    isPositionInsideMesh(testPos, meshIndex)
    {
        // Currently only supports convex meshes.
        // Arbitrary shapes would need to be broken into convex parts or another approach would need to be taken.

        // Loop through edges.
        for( let edgeIndex=0; edgeIndex<this.mesh.edgeList.length; edgeIndex++ )
        {
            // TODO: Transform the vertices in the mesh once rather than for each edge.
            let v1 = vec3.getTemp();
            let v2 = vec3.getTemp();
            this.mesh.getVertexPositionsAtEdge( edgeIndex, v1, v2 );
            v1 = this.rotatePoint( v1, this.meshRot );
            v2 = this.rotatePoint( v2, this.meshRot );
            v1.add( this.meshPos );
            v2.add( this.meshPos );

            // Determine the normal for the edge.
            let edgeDir = v2.minus( v1 );
            let edgeNormal = vec2.getTemp( -edgeDir.y, edgeDir.x );

            // Determine the direction of the point we're testing from the edge.
            let testDir = testPos.minus( v1 );

            // Determine which side of the edge the point is on.
            let sign = edgeNormal.dot( testDir );

            // Check if the test point is on the far side of the edge from the shape.
            if( sign > 0 )
                return false;
        }

        // All edge tests say we're on the "inside" of the shape.
        return true;
    }

    onMouseMove(x, y)
    {
        let orthoPos = super.onMouseMove( x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( this.meshSelected !== -1 )
        {
            //if( this.meshSelectionOffset.length() < 0.2 )
            {
                this.meshPos.set( this.mousePosition.plus( this.meshSelectionOffset ) );
            }
            //else
            //{
            //    let offset = this.meshPos.minus( this.mousePosition );
            //    this.meshRot += -Math.atan2( offset.y, offset.x ) / Math.PI * 180 - this.meshSelectionOffsetAngle;
            //    this.meshSelectionOffsetAngle = -Math.atan2( offset.y, offset.x ) / Math.PI * 180;
            //}
        }

        if( this.draggingVertex )
        {
            this.vertexMoving.set( this.mousePosition );
        }
    }

    onMouseDown(buttonID, x, y)
    {
        let orthoPos = super.onMouseDown( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID === 0 )
        {
            // Move and rotate the mesh.
            if( this.isPositionInsideMesh( this.mousePosition, 1 ) )
                this.meshSelected = 1;
            else if( this.isPositionInsideMesh( this.mousePosition, 0 ) )
                this.meshSelected = 0;

            this.meshSelectionOffset.set( this.meshPos.minus( this.mousePosition ) );
            this.meshSelectionOffsetAngle = -Math.atan2( this.meshSelectionOffset.y, this.meshSelectionOffset.x ) / Math.PI * 180;

            // Move the line segment.
            if( this.meshSelected == -1 )
            {
                if( this.vectorEnd.distanceFrom( new vec2( orthoPos.x, orthoPos.y ) ) < 0.15 )
                {
                    this.vertexMoving = this.vectorEnd;
                }
                else if( this.vectorStart.distanceFrom( new vec2( orthoPos.x, orthoPos.y ) ) < 0.15 )
                {
                    this.vertexMoving = this.vectorStart;
                }

                if( this.vertexMoving != null )
                {
                    this.vertexMoving.setF32( orthoPos.x, orthoPos.y );
                    this.draggingVertex = true;
                }
            }
        }
    }

    onMouseUp(buttonID, x, y)
    {
        let orthoPos = super.onMouseUp( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID === 0 )
        {
            this.meshSelected = -1;

            if( this.draggingVertex === true )
            {
                this.vertexMoving.setF32( orthoPos.x, orthoPos.y );
                this.vertexMoving = null;
                this.draggingVertex = false;
            }
        }
    }
}

RegisterGuide_CollisionAABBLineSegment();
