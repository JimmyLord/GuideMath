function CreateGuide_CollisionSAT(mainProject, framework)
{
    MasterGuideList["Collision"]["Separating Axis Theorem"].guide = new GuideCollisionSAT( mainProject, framework );
}

function RegisterGuide_CollisionSAT()
{
    if( MasterGuideList["Collision"] === undefined )
        MasterGuideList["Collision"] = [];

    MasterGuideList["Collision"]["Separating Axis Theorem"] = {};
    MasterGuideList["Collision"]["Separating Axis Theorem"].createFunc = CreateGuide_CollisionSAT;
    MasterGuideList["Collision"]["Separating Axis Theorem"].guide = null;
}

class GuideCollisionSAT extends Guide
{
    constructor(mainProject, framework)
    {
        let numPages = 2;
        super( mainProject, framework, numPages );

        this.mesh = new Array(2);
        this.pos = new Array(2);
        this.rot = new Array(2);
        this.color = new Array(2);

        this.meshSelected = -1;
        this.meshSelectionOffset = new vec2();
        this.meshSelectionOffsetAngle = 0;

        // Temp value when switching meshes, to avoid issues with number of edges, etc.
        this.meshNextFrame = null;

        // Define some meshes for selection.
        {
            this.meshBox = new Mesh( this.framework.gl );
            this.meshBox.createBox( 0.5, 0.5, true );

            this.meshRectangle = new Mesh( this.framework.gl );
            this.meshRectangle.createBox( 0.8, 0.3, true );

            this.mesh5Sided = new Mesh( this.framework.gl );
            this.mesh5Sided.startShape( this.framework.gl.TRIANGLE_FAN, 5, 9 );
            this.mesh5Sided.addVertexF( -0.4,-0.1,0,  0,0,  0,0,-1,  255,255,255,255 );
            this.mesh5Sided.addVertexF( -0.4, 0.1,0,  0,0,  0,0,-1,  255,255,255,255 );
            this.mesh5Sided.addVertexF(  0.4, 0.1,0,  0,0,  0,0,-1,  255,255,255,255 );
            this.mesh5Sided.addVertexF(  0.5,-0.2,0,  0,0,  0,0,-1,  255,255,255,255 );
            this.mesh5Sided.addVertexF(  0.2,-0.3,0,  0,0,  0,0,-1,  255,255,255,255 );
            this.mesh5Sided.addIndex( 0 );
            this.mesh5Sided.addIndex( 1 );
            this.mesh5Sided.addIndex( 2 );
            this.mesh5Sided.addIndex( 0 );
            this.mesh5Sided.addIndex( 2 );
            this.mesh5Sided.addIndex( 3 );
            this.mesh5Sided.addIndex( 0 );
            this.mesh5Sided.addIndex( 3 );
            this.mesh5Sided.addIndex( 4 );
            this.mesh5Sided.addEdge( 0,1 );
            this.mesh5Sided.addEdge( 1,2 );
            this.mesh5Sided.addEdge( 2,3 );
            this.mesh5Sided.addEdge( 3,4 );
            this.mesh5Sided.addEdge( 4,0 );
            this.mesh5Sided.endShape();
        }

        this.mesh[0] = this.meshBox;
        this.pos[0] = new vec2( 0, 0 );
        this.rot[0] = 0;
        this.color[0] = this.framework.resources.materials["green"];

        this.mesh[1] = this.mesh5Sided;
        this.pos[1] = new vec2( 0.8, 0.3 );
        this.rot[1] = 0;
        this.color[1] = this.framework.resources.materials["blue"];

        this.showAllAxes = true;
        this.currentAxis = 0;
        this.alwaysPushApart = false;

        // Init imgui window positions and sizes.
        this.initWindows( false );
    }

    initWindows(force)
    {
        super.initWindows( "Separating Axis Theorem", force );
    }

    free()
    {
    }

    update(deltaTime)
    {
        super.update( deltaTime );

        if( this.playing === true )
        {
            this.timePassed += deltaTime;
            let currentRadians = this.startRadians + this.angularVelocity * this.timePassed;

            if( currentRadians > this.endRadians )
            {
                this.playing = false;
                this.framework.autoRefresh = false;

                currentRadians = this.endRadians;
            }

            this.currentPosition = new vec2( Math.cos( currentRadians ), Math.sin( currentRadians ) );
        }

        if( this.meshNextFrame !== null )
        {
            this.mesh[1] = this.meshNextFrame;
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

    draw()
    {
        let decimals = 2;

        let uniqueEdges = [];

        // Some precomputed values.
        let totalEdges = this.mesh[0].edgeList.length + this.mesh[1].edgeList.length;

        // Find edge indices facing unique directions.
        for( let edge1=0; edge1<totalEdges; edge1++ )
        {
            let v1 = vec3.getTemp();
            let v2 = vec3.getTemp();
                    
            let currentEdge = edge1;
            let currentMesh = 0;
            if( currentEdge >= this.mesh[0].edgeList.length )
            {
                currentEdge = currentEdge - this.mesh[0].edgeList.length;
                currentMesh = 1;
            }
            this.mesh[currentMesh].getVertexPositionsAtEdge( currentEdge, v1, v2 );
            v1 = this.rotatePoint( v1, this.rot[currentMesh] );
            v2 = this.rotatePoint( v2, this.rot[currentMesh] );
            let dir1 = v2.minus( v1 );
            dir1.normalize();

            let found = false;

            for( let edge2=0; edge2<uniqueEdges.length; edge2++ )
            {
                if( edge1 === edge2 )
                    continue;
                
                currentEdge = uniqueEdges[edge2];
                currentMesh = 0;
                if( currentEdge >= this.mesh[0].edgeList.length )
                {
                    currentEdge = currentEdge - this.mesh[0].edgeList.length;
                    currentMesh = 1;
                }
                this.mesh[currentMesh].getVertexPositionsAtEdge( currentEdge, v1, v2 );
                v1 = this.rotatePoint( v1, this.rot[currentMesh] );
                v2 = this.rotatePoint( v2, this.rot[currentMesh] );
                let dir2 = v2.minus( v1 );
                dir2.normalize();

                if( Math.abs( dir1.dot( dir2 ) ) > 0.999999 )
                {
                    found = true;
                    break;
                }
            }

            if( found === false )
            {
                uniqueEdges.push( edge1 );
            }
        }

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Separating Axis Theorem" );

        // Add page selector.
        let switchedPage = this.switchPage( this.renderer.addPageSelector( this.framework, this.page, this.numPages ) );

        // Options.
        let onlyShowAxesWithoutCollision = false;
        let drawAllAxes = false;
        let showMeshSelection = true;
        let alwaysPushApart = false;

        if( this.page === 1 )
        {
            imgui.window( "Definitions" );
            imgui.text( "The separating axis theorem is used to detect if 2 convex shapes are overlapping.");
            imgui.text( "This is achieved by projecting the shapes onto multiple axes.");
            imgui.window( "Separating Axis Theorem" );

            if( imgui.checkbox( "Show All Axes", this.showAllAxes ) )
                this.showAllAxes = !this.showAllAxes;
            if( this.showAllAxes === false )
            {
                [this.currentAxis] = imgui.dragNumber( "Axis", this.currentAxis, 1, 0, 0, uniqueEdges.length-1 );
            }

            drawAllAxes = this.showAllAxes;
        }

        if( this.page === 2 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Every axis perpendicular to each edge in the two shapes must be tested.");
            imgui.text( "If there's an axis where the 2 projections don't overlap, then there is no collision.");
            imgui.window( "Separating Axis Theorem" );

            if( imgui.checkbox( "Always Push Apart", this.alwaysPushApart ) )
                this.alwaysPushApart = !this.alwaysPushApart;

            onlyShowAxesWithoutCollision = true;
            drawAllAxes = true;
            alwaysPushApart = this.alwaysPushApart;
        }

        if( this.page === 3 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "" );
            imgui.window( "Separating Axis Theorem" );
        }

        if( showMeshSelection )
        {
            if( imgui.button( "Box v Box" ) )
            {
                this.meshNextFrame = this.meshBox;
            }
            if( imgui.button( "Box v Rect" ) )
            {
                this.meshNextFrame = this.meshRectangle;
            }
            if( imgui.button( "Box v 5 Sided Shape" ) )
            {
                this.meshNextFrame = this.mesh5Sided;
            }
        }

        // Colors.
        let axisColor = this.framework.resources.materials["white"];
        let axisCollidingColor = this.framework.resources.materials["red"];
        let axisOverlapColor = this.framework.resources.materials["gray"];

        // Grid.
        if( this.mainProject.showGrid )
        {
            this.renderer.drawGrid( -3, 3, 0.2 );
        }

        // Shapes.
        this.renderer.drawMesh( this.mesh[0], this.pos[0], this.rot[0], this.color[0] );
        this.renderer.drawMesh( this.mesh[1], this.pos[1], this.rot[1], this.color[1] );
        
        // Grab the edge from the mesh.
        // Extend and offset the edge away from the shape for visuals.
        let minAxis = 0;
        let maxAxis = uniqueEdges.length - 1;
        let collidingAxisCount = 0;

        if( drawAllAxes === false )
        {
            minAxis = this.currentAxis;
            maxAxis = this.currentAxis;
        }

        // Display the test axes, the projected vertices and the overlap.
        let minimumTranslationAmount = Number.MAX_VALUE;
        let overlapAxis = -1;
        for( let currentAxisIndex = minAxis; currentAxisIndex <= maxAxis; currentAxisIndex++ )
        {
            let v1 = vec3.getTemp();
            let v2 = vec3.getTemp();
            let currentAxis = uniqueEdges[currentAxisIndex];
            let currentMesh = 0;
            if( currentAxis >= this.mesh[0].edgeList.length )
            {
                currentAxis = currentAxis - this.mesh[0].edgeList.length;
                currentMesh = 1;
            }
        
            this.mesh[currentMesh].getVertexPositionsAtEdge( currentAxis, v1, v2 );
            v1 = this.rotatePoint( v1, this.rot[currentMesh] );
            v2 = this.rotatePoint( v2, this.rot[currentMesh] );
            v1.add( this.pos[currentMesh] );
            v2.add( this.pos[currentMesh] );

            // Get the axis perpendicular to the edge.
            let dir = v2.minus( v1 );
            dir.setF32( -dir.y, dir.x );

            // Push it out a bit before drawing.
            dir.normalize();
            v1.subtract( dir.times( 0.5 ) );
            dir.multiplyBy( 1.5 );
            v2 = v1.plus( dir );
            let normal = vec2.getTemp( -dir.y, dir.x );
            v1.x += normal.x * 0.25;
            v1.y += normal.y * 0.25;
            v2.x += normal.x * 0.25;
            v2.y += normal.y * 0.25;

            let axisStart = vec2.getTemp( v1.x, v1.y );
            let axisEnd = vec2.getTemp( v2.x, v2.y );

            let axisDirection = axisEnd.minus( axisStart );
            axisDirection.normalize();
        
            // Grab the vertex positions from the mesh and project them onto the chosen axis.
            let minPerc = [999999,999999];
            let maxPerc = [-999999,-999999];
            let minPoint = [vec2.getTemp(), vec2.getTemp()];
            let maxPoint = [vec2.getTemp(), vec2.getTemp()];
            for( let m=0; m<2; m++ )
            {
                for( let i=0; i<this.mesh[m].numVerts; i++ )
                {
                    let pos = this.mesh[m].getVertexPosition( i );
                    pos = this.rotatePoint( pos, this.rot[m] );
                    let relativePoint = this.pos[m].plus( vec2.getTemp( pos.x, pos.y ) ).minus( axisStart );

                    let projectedPerc = axisDirection.dot( relativePoint );

                    let projectedPos = axisStart.plus( axisDirection.times( projectedPerc ) );

                    if( projectedPerc < minPerc[m] ) { minPerc[m] = projectedPerc; minPoint[m].set( projectedPos ); }
                    if( projectedPerc > maxPerc[m] ) { maxPerc[m] = projectedPerc; maxPoint[m].set( projectedPos ); }
                }
            }

            let drawAxis = true;
            let collidingOnAxis = false;
            if( minPerc[1] < maxPerc[0] && maxPerc[1] > minPerc[0] )
            {
                // Determine the minimum translation amount to eliminate the overlap.
                {
                    // TODO: Find a better way to handle this... if possible.
                    let minRight = Math.min( maxPerc[0], maxPerc[1] );
                    let maxLeft = Math.max( minPerc[0], minPerc[1] );
                    let overlapAmount = minRight - maxLeft;
                    // If object 1 is larger than 0 and straddles it.
                    if( minPerc[1] < minPerc[0] && maxPerc[1] > maxPerc[0] )
                    {
                        let largerNonOverlappedPart = Math.min( minPerc[0] - minPerc[1], maxPerc[1] - maxPerc[0] );
                        overlapAmount += largerNonOverlappedPart;
                    }
                    // If object 0 is larger than 1 and straddles it.
                    if( minPerc[0] < minPerc[1] && maxPerc[0] > maxPerc[1] )
                    {
                        let largerNonOverlappedPart = Math.min( minPerc[1] - minPerc[0], maxPerc[0] - maxPerc[1] );
                        overlapAmount += largerNonOverlappedPart;
                    }

                    // Store the smallest overlap.
                    if( overlapAmount < minimumTranslationAmount )
                    {
                        minimumTranslationAmount = overlapAmount;
                        overlapAxis = currentAxisIndex;
                    }
                }

                collidingAxisCount++;
                collidingOnAxis = true;

                if( onlyShowAxesWithoutCollision )
                {
                    drawAxis = false;
                }
            }

            if( drawAxis )
            {
                if( collidingOnAxis )
                    this.renderer.drawVector( axisStart, axisEnd, axisCollidingColor );
                else
                    this.renderer.drawVector( axisStart, axisEnd, axisColor );

                for( let m=0; m<2; m++ )
                {
                    for( let i=0; i<this.mesh[m].numVerts; i++ )
                    {
                        let pos = this.mesh[m].getVertexPosition( i );
                        pos = this.rotatePoint( pos, this.rot[m] );
                        let relativePoint = this.pos[m].plus( vec2.getTemp( pos.x, pos.y ) ).minus( axisStart );

                        let projectedPerc = axisDirection.dot( relativePoint );

                        let projectedPos = axisStart.plus( axisDirection.times( projectedPerc ) );
                        this.renderer.drawPoint( projectedPos, this.color[m], -1*m );
                    }
                }

                this.renderer.drawVector( minPoint[0], maxPoint[0], this.color[0] );
                this.renderer.drawVector( minPoint[1], maxPoint[1], this.color[1] );
            }
        }

        if( drawAllAxes === false )
        {
            if( collidingAxisCount > 0 )
                imgui.text( "Colliding on this axis" );
        }
        else
        {
            if( collidingAxisCount === 0 )
                imgui.text( "Not Colliding on any axis" );
            else
                imgui.text( "Colliding on " + collidingAxisCount + " axes" );

            if( collidingAxisCount === uniqueEdges.length )
                imgui.text( "Objects are overlapping" );
            else
                imgui.text( "No overlap" );
        }

        if( collidingAxisCount === uniqueEdges.length && overlapAxis !== -1 )
        {
            imgui.text( "MinTranslation: " + minimumTranslationAmount.toFixed( 2 ) );
            imgui.text( "overlapAxis: " + overlapAxis );

            // Display axis of separation.
            let currentAxis = overlapAxis;
            let currentMesh = 0;
            let otherMesh = 1;
            if( currentAxis >= this.mesh[0].edgeList.length )
            {
                currentAxis = currentAxis - this.mesh[0].edgeList.length;
                currentMesh = 1;
                otherMesh = 0;
            }
            let v1 = vec3.getTemp();
            let v2 = vec3.getTemp();
            this.mesh[currentMesh].getVertexPositionsAtEdge( currentAxis, v1, v2 );
            v1 = this.rotatePoint( v1, this.rot[currentMesh] );
            v2 = this.rotatePoint( v2, this.rot[currentMesh] );
            let dir = v2.minus( v1 );
            v1.set( this.pos[currentMesh] );
            v2 = v1.plus( dir );
            this.renderer.drawVector( v1, v2, axisOverlapColor );
            v1.set( this.pos[otherMesh] );
            v2 = v1.minus( dir );
            this.renderer.drawVector( v1, v2, axisOverlapColor );

            // If no mesh is selected, push them apart.
            if( alwaysPushApart || this.meshSelected === -1 )
            {
                let meshToPush = currentMesh;
                if( alwaysPushApart && this.meshSelected === currentMesh )
                {
                    meshToPush = otherMesh;
                }

                this.pos[meshToPush].subtract( dir.times( minimumTranslationAmount ) );
                this.framework.refresh( true );
            }
        }

        //let isHovering0 = this.isPositionInsideMesh( this.mousePosition, 0 );
        //let isHovering1 = this.isPositionInsideMesh( this.mousePosition, 1 );
        //
        //imgui.text( "Mouse " + this.mousePosition.x.toFixed(2) + " " + this.mousePosition.y.toFixed(2) );
        //if( isHovering0 )
        //    imgui.text( "Mouse is over mesh 0" );
        //if( isHovering1 )
        //    imgui.text( "Mouse is over mesh 1" );
    }

    isPositionInsideMesh(testPos, meshIndex)
    {
        // Currently only supports convex meshes.
        // Arbitrary shapes would need to be broken into convex parts or another approach would need to be taken.

        // Loop through edges.
        for( let edgeIndex=0; edgeIndex<this.mesh[meshIndex].edgeList.length; edgeIndex++ )
        {
            // TODO: Transform the vertices in the mesh once rather than for each edge.
            let v1 = vec3.getTemp();
            let v2 = vec3.getTemp();
            this.mesh[meshIndex].getVertexPositionsAtEdge( edgeIndex, v1, v2 );
            v1 = this.rotatePoint( v1, this.rot[meshIndex] );
            v2 = this.rotatePoint( v2, this.rot[meshIndex] );
            v1.add( this.pos[meshIndex] );
            v2.add( this.pos[meshIndex] );

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
            if( this.meshSelectionOffset.length() < 0.2 )
            {
                this.pos[this.meshSelected].set( this.mousePosition.plus( this.meshSelectionOffset ) );
            }
            else
            {
                let offset = this.pos[this.meshSelected].minus( this.mousePosition );
                this.rot[this.meshSelected] += -Math.atan2( offset.y, offset.x ) / Math.PI * 180 - this.meshSelectionOffsetAngle;
                this.meshSelectionOffsetAngle = -Math.atan2( offset.y, offset.x ) / Math.PI * 180;
            }
        }
    }

    onMouseDown(buttonID, x, y)
    {
        let orthoPos = super.onMouseDown( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID === 0 )
        {
            if( this.isPositionInsideMesh( this.mousePosition, 1 ) )
                this.meshSelected = 1;
            else if( this.isPositionInsideMesh( this.mousePosition, 0 ) )
                this.meshSelected = 0;

            //let d0 = this.pos[0].minus( this.mousePosition ).length();
            //let d1 = this.pos[1].minus( this.mousePosition ).length();
            //if( d0 < d1 )
            //    this.meshSelected = 0;
            //else
            //    this.meshSelected = 1;
            this.meshSelectionOffset.set( this.pos[this.meshSelected].minus( this.mousePosition ) );
            this.meshSelectionOffsetAngle = -Math.atan2( this.meshSelectionOffset.y, this.meshSelectionOffset.x ) / Math.PI * 180;
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
        }
    }
}

RegisterGuide_CollisionSAT();
