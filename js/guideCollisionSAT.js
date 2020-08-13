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
        this.color = new Array(2);

        this.mesh[0] = new Mesh( this.framework.gl );
        this.mesh[0].createBox( 0.5, 0.5 );
        this.pos[0] = new vec2( 0, 0 );
        this.color[0] = this.framework.resources.materials["green"];

        this.mesh[1] = new Mesh( this.framework.gl );
        this.mesh[1].createBox( 0.5, 0.5 );
        this.pos[1] = new vec2( 0.8, 0.3 );
        this.color[1] = this.framework.resources.materials["blue"];

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

    draw()
    {
        let decimals = 2;

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Separating Axis Theorem" );

        // Add page selector.
        let switchedPage = this.switchPage( this.renderer.addPageSelector( this.framework, this.page, this.numPages ) );

        if( this.page === 1 )
        {
            imgui.window( "Definitions" );
            imgui.text( "The separating axis theorem is used to detect if 2 convex shapes are overlapping.");
            imgui.text( "This is achieved by projecting the shapes onto multiple axes.");
            imgui.window( "Separating Axis Theorem" );

            //this.currentAxis
            [this.currentAxis] = imgui.dragNumber( "Axis", this.currentAxis, 1, 0, 0, 1 );
            //imgui.text( "Overlap" );
        }

        if( this.page === 2 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Every axis perpendicular to each edge in the two shapes must be tested.");
            imgui.text( "If there's an axis where the 2 projections don't overlap, then there is no collision.");
            imgui.window( "Separating Axis Theorem" );
        }

        if( this.page === 3 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "");
            imgui.window( "Separating Axis Theorem" );
        }

        if( this.page === 4 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "");
            imgui.window( "Separating Axis Theorem" );
        }

        if( this.page === 5 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "");
            imgui.window( "Separating Axis Theorem" );
        }

        if( this.page === 6 )
        {
            imgui.window( "Definitions" );
            imgui.text( "More to come.");
            imgui.text( "");
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
        this.renderer.drawMesh( this.mesh[0], this.pos[0], this.color[0] );
        this.renderer.drawMesh( this.mesh[1], this.pos[1], this.color[1] );
        
        // TODO: Base these axes on the verts in the mesh.
        let axisStart = vec2.getTemp( -1, -0.5, 0 );
        let axisEnd = vec2.getTemp( 1.5, -0.5, 0 );

        if( this.currentAxis === 1 )
        {
            axisStart.setF32( -1, -0.5, 0 );
            axisEnd.setF32( -1, 1.0, 0 );
        }

        let axisDirection = axisEnd.minus( axisStart );
        axisDirection.normalize();
        this.renderer.drawVector( axisStart, axisEnd, axisColor );
        
        // TODO: Grab the verts from the mesh.
        for( let m=0; m<2; m++ )
        {
            for( let i=0; i<4; i++ )
            {
                let relativePoint = this.pos[m].plus( new vec2( -0.25, -0.25 ) ).minus( axisStart ); // bl point in shape.
                if( i === 1 )
                    relativePoint = this.pos[m].plus( new vec2( -0.25,  0.25 ) ).minus( axisStart ); // tl point in shape.
                if( i === 2 )
                    relativePoint = this.pos[m].plus( new vec2(  0.25,  0.25 ) ).minus( axisStart ); // tr point in shape.
                if( i === 3 )
                    relativePoint = this.pos[m].plus( new vec2(  0.25, -0.25 ) ).minus( axisStart ); // br point in shape.

                let projectedPerc = axisDirection.dot( relativePoint );
                let projectedPos = axisStart.plus( axisDirection.times( projectedPerc ) );
                this.renderer.drawPoint( projectedPos, this.color[m] );
            }
        }
    }

    onMouseMove(x, y)
    {
        let orthoPos = super.onMouseMove( x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( this.dragging )
        {
            this.endPosition.set( this.mousePosition );
        }
    }

    onMouseDown(buttonID, x, y)
    {
        let orthoPos = super.onMouseDown( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID === 0 )
        {
            this.startPosition.setF32( orthoPos.x, orthoPos.y );
            this.currentPosition.setF32( orthoPos.x, orthoPos.y );
            this.endPosition.setF32( orthoPos.x, orthoPos.y );
            this.dragging = true;
        }
    }

    onMouseUp(buttonID, x, y)
    {
        let orthoPos = super.onMouseUp( buttonID, x, y );

        if( this.framework.imgui.isHoveringWindow )
            return;

        if( buttonID === 0 && this.dragging === true )
        {
            this.dragging = false;
        }
    }
}

RegisterGuide_CollisionSAT();
