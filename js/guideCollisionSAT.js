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
        let numPages = 6;
        super( mainProject, framework, numPages );

        this.mesh = new Array(2);
        this.pos = new Array(2);
        this.rot = new Array(2);
        this.color = new Array(2);

        this.meshSelected = -1;
        this.meshSelectionOffset = new vec2();

        this.mesh[0] = new Mesh( this.framework.gl );
        this.mesh[0].createBox( 0.5, 0.5, true );
        this.pos[0] = new vec2( 0, 0 );
        this.rot[0] = 0;
        this.color[0] = this.framework.resources.materials["green"];

        this.mesh[1] = new Mesh( this.framework.gl );
        this.mesh[1].createBox( 0.8, 0.3, true );
        this.pos[1] = new vec2( 0.8, 0.3 );
        this.rot[1] = 0;
        this.color[1] = this.framework.resources.materials["blue"];

        this.showAllAxes = false;
        this.currentAxis = 0;

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

        // Some precomputed values.
        let totalEdges = this.mesh[0].edgeList.length + this.mesh[1].edgeList.length;

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Separating Axis Theorem" );

        // Add page selector.
        let switchedPage = this.switchPage( this.renderer.addPageSelector( this.framework, this.page, this.numPages ) );

        // Options.
        let onlyShowAxesWithoutCollision = false;
        let drawAllAxes = false;

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
                [this.currentAxis] = imgui.dragNumber( "Axis", this.currentAxis, 1, 0, 0, totalEdges-1 );
            }

            drawAllAxes = this.showAllAxes;
        }

        if( this.page === 2 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Every axis perpendicular to each edge in the two shapes must be tested.");
            imgui.text( "If there's an axis where the 2 projections don't overlap, then there is no collision.");
            imgui.window( "Separating Axis Theorem" );

            onlyShowAxesWithoutCollision = true;
            drawAllAxes = true;
        }

        if( this.page === 3 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "" );
            imgui.window( "Separating Axis Theorem" );
        }

        if( this.page === 4 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "" );
            imgui.window( "Separating Axis Theorem" );
        }

        if( this.page === 5 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "" );
            imgui.window( "Separating Axis Theorem" );
        }

        if( this.page === 6 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "" );
            imgui.window( "Separating Axis Theorem" );
        }

        // Colors.
        let axisColor = this.framework.resources.materials["white"];

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
        let maxAxis = totalEdges - 1;
        let collidingAxisCount = 0;

        if( drawAllAxes === false )
        {
            minAxis = this.currentAxis;
            maxAxis = this.currentAxis;
        }

        for( let currentAxisIndex = minAxis; currentAxisIndex <= maxAxis; currentAxisIndex++ )
        {
            let v1 = vec3.getTemp();
            let v2 = vec3.getTemp();
            let currentAxis = currentAxisIndex;
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

            let dir = v2.minus( v1 );
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
                for( let i=0; i<4; i++ )
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
            if( minPerc[1] < maxPerc[0] && maxPerc[1] > minPerc[0] )
            {
                collidingAxisCount++;

                if( onlyShowAxesWithoutCollision )
                {
                    drawAxis = false;
                }
            }

            if( drawAxis )
            {
                this.renderer.drawVector( axisStart, axisEnd, axisColor );

                for( let m=0; m<2; m++ )
                {
                    for( let i=0; i<4; i++ )
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

            if( collidingAxisCount === 8 )
                imgui.text( "Objects are overlapping" );
            else
                imgui.text( "No overlap" );
        }
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
                let offset = this.mousePosition.minus( this.pos[this.meshSelected] );
                this.rot[this.meshSelected] = -Math.atan2( offset.y, offset.x ) / Math.PI * 180;
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
            this.meshSelected = 1;
            this.meshSelectionOffset.set( this.pos[this.meshSelected].minus( this.mousePosition ) );
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
