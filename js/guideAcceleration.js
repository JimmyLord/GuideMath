function CreateGuide_Acceleration(mainProject, framework)
{
    MasterGuideList["Physics"]["Acceleration"].guide = new GuideAcceleration( mainProject, framework );
}

function RegisterGuide_Acceleration()
{
    if( MasterGuideList["Physics"] === undefined )
        MasterGuideList["Physics"] = [];

    MasterGuideList["Physics"]["Acceleration"] = {};
    MasterGuideList["Physics"]["Acceleration"].createFunc = CreateGuide_Acceleration;
    MasterGuideList["Physics"]["Acceleration"].guide = null;
}

class GuideAccelerationObject
{
    constructor(pos, vel, acc, color)
    {
        this.initialPos = null;
        this.initialVel = null;
        this.initialAcc = null;
        this.pos = null;
        this.vel = null;
        this.acc = null;

        this.set( pos, vel, acc );

        this.color = color;
    }

    set(pos, vel, acc)
    {
        this.initialPos = new vec2( pos.x, pos.y );
        this.initialVel = new vec2( vel.x, vel.y );
        this.initialAcc = new vec2( acc.x, acc.y );
        
        this.pos = new vec2( pos.x, pos.y );
        this.vel = new vec2( vel.x, vel.y );
        this.acc = new vec2( acc.x, acc.y );
    }

    reset()
    {
        this.pos.set( this.initialPos );
        this.vel.set( this.initialVel );
        this.acc.set( this.initialAcc );
    }
}

class GuideAcceleration extends Guide
{
    constructor(mainProject, framework)
    {
        super( mainProject, framework );

        this.vertexRadius = 0.5;

        this.startPosition = new vec2( 0, 0 );
        this.endPosition = new vec2( 1.5, 0.5 );

        this.objects = [];
        this.objects[0] = new GuideAccelerationObject( new vec2(0), new vec2(0), new vec2(0), this.framework.resources.materials["blue"] );
        this.objects[1] = new GuideAccelerationObject( new vec2(0), new vec2(0), new vec2(0), this.framework.resources.materials["red"] );
        this.objects[2] = new GuideAccelerationObject( new vec2(0), new vec2(0), new vec2(0), this.framework.resources.materials["green"] );

        this.dragging = false;

        this.playing = false;
        this.totalPlayTime = 1.0;
        this.timePassed = 0.0;

        // For graph.
        this.graphMeshProper = new Mesh( this.framework.gl );
        this.graphMeshIntegrated = new Mesh( this.framework.gl );
        this.rebuildGraph = true;

        // For page 5.
        this.acceleration = 1.0;
        this.fps = 60;

        // Settings.
        this.page = -1;
        this.oldPage = null;
        this.showPositions = false;
        
        // Init imgui window positions and sizes.
        this.initWindows( false );
    }

    initWindows(force)
    {
        super.initWindows( "Acceleration", force );
    }

    free()
    {
    }

    update(deltaTime)
    {
        super.update( deltaTime );

        if( this.playing === true )
        {
            this.step( deltaTime );
        }
    }

    reset()
    {
        for( let i=0; i<this.objects.length; i++ )
        {
            this.objects[i].reset();
        }
        this.pause();
        this.timePassed = 0.0;
        this.framework.refresh();
    }

    play()
    {
        this.playing = true;
        this.framework.autoRefresh = true;
    }

    step(timeStep)
    {
        let timeLeft = this.totalPlayTime - this.timePassed;

        if( timeStep > timeLeft )
        {
            timeStep = timeLeft;
            this.pause();
        }

        this.timePassed += timeStep;

        for( let i=0; i<this.objects.length; i++ )
        {
            this.objects[i].vel.add( this.objects[i].acc.times( timeStep ) );
            this.objects[i].pos.add( this.objects[i].vel.times( timeStep ) );
        }

        this.framework.refresh();
    }

    pause()
    {
        this.playing = false;
        this.framework.autoRefresh = false;
        this.framework.refresh();
    }

    draw()
    {
        let decimals = 2;

        // Calculate some values.
        let direction = this.endPosition.minus( this.startPosition );
        let normalizedDir = direction.getNormalized();

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Acceleration" );

        //if( this.startPosition.distanceFrom( this.endPosition ) == 0 )
        //{
        //    imgui.text( "Click and drag to create a vector" );
        //}

        // Add page selector.
        let numPages = 5;
        let switchedPage = false;
        this.oldPage = this.page;
        this.page = this.renderer.addPageSelector( this.framework, this.page, numPages );
        if( this.oldPage != this.page )
            switchedPage = true;

        //if( imgui.checkbox( "Show positions", this.showPositions ) )
        //{
        //    this.showPositions = !this.showPositions;
        //}

        // Grid.
        if( this.mainProject.showGrid )
        {
            this.renderer.drawGrid( -3, 3, 0.2 );
        }

        let needsReset = false;
        let showVelocityAdjuster = false;
        let showAccelerationAdjuster = false;
        let showBasicControls = false;
        let showTimeStepControls = false;
        let showObjects = false;
        let showGraph = false;

        if( this.page == 1 )
        {
            if( switchedPage )
            {
                let oldVel = this.objects[0].vel.x;
                this.objects[0].set( new vec2( 0,  0.3 ), new vec2( 0.10, 0 ), new vec2( 0, 0 ) );
                this.objects[1].set( new vec2( 0,  0.0 ), new vec2( 0.50, 0 ), new vec2( 0, 0 ) );
                this.objects[2].set( new vec2( 0, -0.3 ), new vec2( 1.00, 0 ), new vec2( 0, 0 ) );
                this.objects[0].vel.x = oldVel;
                needsReset = true;
            }

            imgui.window( "Definitions" );
            imgui.text( "Velocity is the change in position over time.");
            imgui.text( "final position = initial position + velocity * Δtime");

            // Text.
            imgui.window( "FullFrame" );
            for( let i=0; i<this.objects.length; i++ )
            {
                this.renderer.drawString( "Vel: " + this.objects[i].vel.x.toFixed( 2 ), -0.1, this.objects[i].pos.y, align.x.right, align.y.center );
                this.renderer.drawString( "Pos: " + this.objects[i].pos.x.toFixed( 4 ), this.objects[i].pos.x + 0.1, this.objects[i].pos.y, align.x.left, align.y.center );
            }

            imgui.window( "Acceleration" );
            showVelocityAdjuster = true;
            showAccelerationAdjuster = false;
            showBasicControls = true;
            showTimeStepControls = false;
            showObjects = true;
            showGraph = false;
        }

        if( this.page == 2 )
        {
            if( switchedPage )
            {
                let oldAcc = this.objects[0].acc.x;
                this.objects[0].set( new vec2( 0,  0.3 ), new vec2( 0, 0 ), new vec2( 0.5, 0 ) );
                this.objects[1].set( new vec2( 0,  0.0 ), new vec2( 0, 0 ), new vec2( 1.0, 0 ) );
                this.objects[2].set( new vec2( 0, -0.3 ), new vec2( 0, 0 ), new vec2( 1.5, 0 ) );
                this.objects[0].acc.x = oldAcc;
                needsReset = true;
            }

            imgui.window( "Definitions" );
            imgui.text( "Acceleration is the change in velocity over time.");
            imgui.text( "final velocity = initial velocity + acceleration * Δtime");

            // Text.
            imgui.window( "FullFrame" );
            for( let i=0; i<this.objects.length; i++ )
            {
                this.renderer.drawString( "Acc: " + this.objects[i].acc.x.toFixed( 2 ), -0.1, this.objects[i].pos.y, align.x.right, align.y.center );
                this.renderer.drawString( "Vel: " + this.objects[i].vel.x.toFixed( 4 ), this.objects[i].pos.x + 0.1, this.objects[i].pos.y, align.x.left, align.y.center );
                this.renderer.drawString( "Pos: " + this.objects[i].pos.x.toFixed( 4 ), this.objects[i].pos.x + 0.1, this.objects[i].pos.y + 0.1, align.x.left, align.y.center );
            }

            imgui.window( "Acceleration" );
            showVelocityAdjuster = false;
            showAccelerationAdjuster = true;
            showBasicControls = true;
            showTimeStepControls = false;
            showObjects = true;
            showGraph = false;
        }

        if( this.page == 3 )
        {
            if( switchedPage )
            {
                let oldAcc = this.objects[0].acc.x;
                this.objects[0].set( new vec2( 0,  0.3 ), new vec2( 0, 0 ), new vec2( 0.25, 0 ) );
                this.objects[1].set( new vec2( 0,  0.0 ), new vec2( 0, 0 ), new vec2( 0.50, 0 ) );
                this.objects[2].set( new vec2( 0, -0.3 ), new vec2( 0, 0 ), new vec2( 0.75, 0 ) );
                this.objects[0].acc.x = oldAcc;
                needsReset = true;
            }

            imgui.window( "Definitions" );
            imgui.text( "Adding the results for each time chunk is called integration.");
            imgui.text( "Integration will cause drift in your numbers depending on the step size.");

            // Text.
            imgui.window( "FullFrame" );
            for( let i=0; i<this.objects.length; i++ )
            {
                this.renderer.drawString( "Acc: " + this.objects[i].acc.x.toFixed( 2 ), -0.1, this.objects[i].pos.y, align.x.right, align.y.center );
                this.renderer.drawString( "Vel: " + this.objects[i].vel.x.toFixed( 4 ), this.objects[i].pos.x + 0.1, this.objects[i].pos.y, align.x.left, align.y.center );
                this.renderer.drawString( "Pos: " + this.objects[i].pos.x.toFixed( 4 ), this.objects[i].pos.x + 0.1, this.objects[i].pos.y + 0.1, align.x.left, align.y.center );
            }

            imgui.window( "Acceleration" );
            showVelocityAdjuster = false;
            showAccelerationAdjuster = true;
            showBasicControls = true;
            showTimeStepControls = true;
            showObjects = true;
            showGraph = false;
        }

        if( this.page == 4 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Integration error comes from estimating the area beneath the acceleration");
            imgui.text( "   curve. The larger the step size, the further off the estimate.");

            imgui.window( "FullFrame" );
            //this.renderer.drawString( "or maybe here...", 0, 0, align.x.center, align.y.center );

            imgui.window( "Acceleration" );
            showVelocityAdjuster = false;
            showAccelerationAdjuster = false;
            showBasicControls = false;
            showTimeStepControls = false;
            showObjects = false;
            showGraph = true;

            imgui.text( "" );
            //imgui.text( "TODO" );
            //imgui.text( "Imagine a nice graph here..." );

            let changed = false;
            [this.totalPlayTime, changed] = imgui.dragNumber( "Time: ", this.totalPlayTime, 0.01, 2, 0.01, 60 );
            if( changed ) this.rebuildGraph = true;
            [this.acceleration, changed] = imgui.dragNumber( "Acceleration: ", this.acceleration, 0.01, 2 );
            if( changed ) this.rebuildGraph = true;
            [this.fps, changed] = imgui.dragNumber( "FPS: ", this.fps, 1, 0, 1, 120 );
            if( changed ) this.rebuildGraph = true;

            if( this.rebuildGraph )
            {
                this.rebuildGraph = false;

                let timeStep = 1 / this.fps;
                let pos = 0;
                let vel = 0;

                let numVerts = Math.trunc( 60 * this.totalPlayTime );
                this.graphMeshProper.startShape( this.framework.gl.LINE_STRIP, numVerts+1 );
                this.graphMeshProper.addVertex( new vec3(0,0,0), new vec2(0,0), new vec3(0,0,-1), new color(255,255,255,255) );
                for( let i=0; i<numVerts; i++ )
                {
                    let properX = 0 * this.totalPlayTime + 0.5 * this.acceleration * (i+1)/60 * (i+1)/60;
                    this.graphMeshProper.addVertex( new vec3((i+1)/60,properX,0), new vec2(0,0), new vec3(0,0,-1), new color(255,255,255,255) );
                }
                this.graphMeshProper.endShape();

                numVerts = Math.trunc( this.fps * this.totalPlayTime );
                this.graphMeshIntegrated.startShape( this.framework.gl.LINE_STRIP, numVerts+1 );
                this.graphMeshIntegrated.addVertex( new vec3(0,0,0), new vec2(0,0), new vec3(0,0,-1), new color(255,255,255,255) );
                for( let i=0; i<numVerts; i++ )
                {
                    vel += this.acceleration * timeStep;
                    pos += vel * timeStep;

                    this.graphMeshIntegrated.addVertex( new vec3((i+1)/this.fps,pos,0), new vec2(0,0), new vec3(0,0,-1), new color(255,255,255,255) );
                }
                this.graphMeshIntegrated.endShape();
            }

            //imgui.text( "Proper X: " + properX.toFixed(4) );
            //imgui.text( "Integrated X: " + pos.toFixed(4) );
        }

        if( this.page == 5 )
        {
            imgui.window( "Definitions" );
            imgui.text( "The proper equation for distance travelled under constant acceleration is:");
            imgui.text( "d = v * t + 0.5 * a * t*t");

            imgui.window( "FullFrame" );

            imgui.window( "Acceleration" );
            showVelocityAdjuster = false;
            showAccelerationAdjuster = false;
            showBasicControls = false;
            showTimeStepControls = false;
            showObjects = false;
            showGraph = true;

            imgui.text( "" );

            [this.totalPlayTime] = imgui.dragNumber( "Time: ", this.totalPlayTime, 0.01, 2, 0.01, 60 );
            [this.acceleration] = imgui.dragNumber( "Acceleration: ", this.acceleration, 0.01, 2 );
            [this.fps] = imgui.dragNumber( "FPS: ", this.fps, 1, 0, 1, 120 );

            let properX = 0 * this.totalPlayTime + 0.5 * this.acceleration * this.totalPlayTime * this.totalPlayTime;
            imgui.text( "Proper X: " + properX.toFixed(4) );

            let timeStep = 1 / this.fps;
            let pos = 0;
            let vel = 0;
            for( let i=0; i<this.fps * this.totalPlayTime; i++ )
            {
                vel += this.acceleration * timeStep;
                pos += vel * timeStep;
            }
            imgui.text( "Integrated X: " + pos.toFixed(4) );
        }

        imgui.text( "" );

        if( showVelocityAdjuster )
            [this.objects[0].initialVel.x, needsReset] = imgui.dragNumber( "Vel: ", this.objects[0].initialVel.x, 0.01, 2 );

        if( showAccelerationAdjuster )
            [this.objects[0].initialAcc.x, needsReset] = imgui.dragNumber( "Acc: ", this.objects[0].initialAcc.x, 0.01, 2 );

        if( needsReset )
            this.reset();

        if( showBasicControls )
        {
            [this.totalPlayTime] = imgui.dragNumber( "Time: ", this.totalPlayTime, 0.01, 2, 0.01, 60 );

            if( imgui.button( "Reset" ) )
            {
                this.reset();
            }
        
            if( this.playing === false )
            {
                if( imgui.button( "Play" ) )
                {
                    this.play();
                }
            }
            else
            {
                if( imgui.button( "Pause" ) )
                {
                    this.pause();
                }
            }
        }

        if( showTimeStepControls )
        {
            if( imgui.button( "Step 1/60" ) )
            {
                this.pause();
                this.step( 1/60 );
            }

            if( imgui.button( "Step 1/10" ) )
            {
                this.pause();
                this.step( 1/10 );
            }

            if( imgui.button( "Step 1" ) )
            {
                this.pause();
                this.step( 1 );
            }
        }

        if( showObjects )
        {
            for( let i=0; i<this.objects.length; i++ )
            {
                this.renderer.drawPoint( new vec3( this.objects[i].pos.x, this.objects[i].pos.y, 0 ), this.objects[i].color );
            }
        }

        if( showGraph )
        {
            this.renderer.drawMesh( this.graphMeshProper, new vec3( 0, 0, 0 ), this.framework.resources.materials["green"] );
            this.renderer.drawMesh( this.graphMeshIntegrated, new vec3( 0, 0, 0 ), this.framework.resources.materials["white"] );
        }

        //// Axes.
        //this.renderer.drawVector( this.startPosition, new vec2( this.endPosition.x, this.startPosition.y ), xAxisColor );
        //this.renderer.drawVector( new vec2( this.endPosition.x, this.startPosition.y ), this.endPosition, yAxisColor );
        //
        //// Hypotenuse.
        //this.renderer.drawVector( this.startPosition, this.endPosition, endColor );
        //
        //// Hypotenuse normalized.
        //this.renderer.drawVector( this.startPosition, this.startPosition.plus( this.endPosition.minus( this.startPosition ).getNormalized() ), normalizedColor );
        //
        //// Start vertex position.
        //this.renderer.drawPoint( new vec3( this.startPosition.x, this.startPosition.y, 0 ), startColor );
        //
        //// End vertex position.
        //this.renderer.drawPoint( new vec3( this.endPosition.x, this.endPosition.y, 0 ), endColor );
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

RegisterGuide_Acceleration();
