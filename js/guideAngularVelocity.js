﻿function CreateGuide_AngularVelocity(mainProject, framework)
{
    MasterGuideList["Physics"]["AngularVelocity"].guide = new GuideAngularVelocity( mainProject, framework );
}

function RegisterGuide_AngularVelocity()
{
    if( MasterGuideList["Physics"] === undefined )
        MasterGuideList["Physics"] = [];

    MasterGuideList["Physics"]["AngularVelocity"] = {};
    MasterGuideList["Physics"]["AngularVelocity"].createFunc = CreateGuide_AngularVelocity;
    MasterGuideList["Physics"]["AngularVelocity"].guide = null;
}

class GuideAngularVelocity extends Guide
{
    constructor(mainProject, framework)
    {
        let numPages = 6;
        super( mainProject, framework, numPages );

        this.vertexRadius = 0.5;
        
        this.dragging = false;

        this.centerPosition = new vec2(0);
        this.startPosition = new vec2(1, 1);
        this.endPosition = new vec2(-1, 1);
        this.radius = 0.8;

        this.currentPosition = new vec2(0);
        this.currentPosition.set( this.startPosition );

        // Settings.
        this.showDegrees = false;

        this.playing = false;
        this.totalPlayTime = 2.0;
        this.timePassed = 0.0;
        this.startRadians = 0.0;
        this.endRadians = 0.0;
        this.angularVelocity = 0.0;

        // Init imgui window positions and sizes.
        this.initWindows( false );
    }

    initWindows(force)
    {
        super.initWindows( "Angular Velocity", force );
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

        // Calculate some values.
        let startPos = new vec2();
        startPos.set( this.startPosition.minus( this.centerPosition ) );
        startPos.normalize();
        startPos.multiplyBy( this.radius );
        let startRadians = Math.atan2( startPos.y, startPos.x );
        if( startRadians < 0 ) startRadians += Math.PI * 2;

        let endPos = new vec2();
        endPos.set( this.endPosition.minus( this.centerPosition ) );
        endPos.normalize();
        endPos.multiplyBy( this.radius );
        let endRadians = Math.atan2( endPos.y, endPos.x );
        if( endRadians < 0 ) endRadians += Math.PI * 2;

        let angleDiff = endRadians - startRadians;
        if( angleDiff < 0 ) angleDiff += Math.PI * 2;

        let currentPos = new vec2();
        currentPos.set( this.currentPosition.minus( this.centerPosition ) );
        currentPos.normalize();
        currentPos.multiplyBy( this.radius );
        let currentRadians = Math.atan2( currentPos.y, currentPos.x );
        if( currentRadians < 0 ) currentRadians += Math.PI * 2;

        let angularVelocity = angleDiff / this.totalPlayTime;

        // Menu.
        let imgui = this.framework.imgui;
        imgui.window( "Angular Velocity" );

        // Add page selector.
        let switchedPage = this.switchPage( this.renderer.addPageSelector( this.framework, this.page, this.numPages ) );

        if( imgui.checkbox( "Degrees", this.showDegrees ) )
        {
            this.showDegrees = !this.showDegrees;
        }

        let multiplier = 1.0;
        if( this.showDegrees )
            multiplier = 180.0 / Math.PI;

        if( this.page === 1 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Math operations require angles in radians.");
            imgui.text( "Angles are often denoted with a theta (θ) symbol.");
            imgui.window( "Angular Velocity" );

            imgui.text( "Start angle:   " + (startRadians * multiplier).toFixed(decimals) );
            imgui.text( "End angle:     " + (endRadians * multiplier).toFixed(decimals) );
            imgui.text( "Delta angle:   " + (angleDiff * multiplier).toFixed(decimals) );

            imgui.text( "Current angle: " + (currentRadians * multiplier).toFixed(decimals) );
        }

        if( this.page === 2 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Angular velocity is the change in angle over time.");
            imgui.text( "Usually denoted with an omega (ω) symbol.");
            imgui.window( "Angular Velocity" );

            imgui.text( "Delta angle: " + (angleDiff * multiplier).toFixed(decimals) );
            imgui.text( "Delta time:  " + (this.totalPlayTime).toFixed(decimals) );
            imgui.text( "ω = Δangle / Δtime");
            imgui.text( "ω = " + (angularVelocity * multiplier).toFixed(decimals) ); imgui.sameLine();
            if( this.showDegrees )
                imgui.text( " deg/sec" );
            else
                imgui.text( " rad/sec" );
        }

        if( this.page === 3 )
        {
            imgui.window( "Definitions" );
            imgui.text( "The speed of the ball is related to ω.");
            imgui.text( "The distance travelled is Δangle (in radians) times the radius.");
            imgui.window( "Angular Velocity" );

            imgui.text( "Delta angle:      " + (angleDiff * multiplier).toFixed(decimals) );
            [this.radius] = imgui.dragNumber( "Radius", this.radius, 0.01, 2, 0.01, 5 );
            imgui.text( "Displacement:     " + (angleDiff * this.radius).toFixed(decimals) );
            imgui.text( "" );
        }

        if( this.page === 4 )
        {
            imgui.window( "Definitions" );
            imgui.text( "The linear velocity is the displacement (distance travelled) over time.");
            imgui.text( "Linear velocity = (Δangle * radius) / Δtime" );
            imgui.window( "Angular Velocity" );

            imgui.text( "Delta angle:      " + (angleDiff * multiplier).toFixed(decimals) );
            [this.radius] = imgui.dragNumber( "Radius", this.radius, 0.01, 2, 0.01, 5 );
            imgui.text( "Displacement:     " + (angleDiff * this.radius).toFixed(decimals) );
            imgui.text( "Linear Velocity:  " + (angleDiff * this.radius / this.totalPlayTime).toFixed(decimals) );
        }

        if( this.page === 5 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Linear velocity = (Δangle * radius) / Δtime");
            imgui.text( "Linear velocity = Angular velocity * radius" );
            imgui.window( "Angular Velocity" );

            imgui.text( "Linear Velocity:  " + (angleDiff * this.radius / this.totalPlayTime).toFixed(decimals) );
            imgui.text( "Angular Velocity: " + (angularVelocity * multiplier).toFixed(decimals) );
            [this.radius] = imgui.dragNumber( "Radius", this.radius, 0.01, 2, 0.01, 5 );
            imgui.text( "" );
        }

        if( this.page === 6 )
        {
            imgui.window( "Definitions" );
            imgui.text( "Linear velocity = Angular velocity * radius" );
            imgui.text( "Angular velocity = Linear velocity / radius");
            imgui.window( "Angular Velocity" );

            imgui.text( "Linear Velocity:  " + (angleDiff * this.radius / this.totalPlayTime).toFixed(decimals) );
            imgui.text( "Angular Velocity: " + (angularVelocity * multiplier).toFixed(decimals) );
            [this.radius] = imgui.dragNumber( "Radius", this.radius, 0.01, 2, 0.01, 5 );
            imgui.text( "" );
        }

        imgui.text( "" );
        [this.totalPlayTime] = imgui.dragNumber( "Time: ", this.totalPlayTime, 0.01, 2, 0.01, 60 );

        if( this.playing === false )
        {
            if( imgui.button( "Play" ) )
            {
                this.playing = true;
                this.framework.autoRefresh = true;

                this.timePassed = 0.0;
                this.startRadians = startRadians;
                this.endRadians = endRadians;
                if( startRadians > endRadians )
                    this.startRadians -= Math.PI * 2;
                this.angularVelocity = angularVelocity;
            }
        }
        else
        {
            if( imgui.button( "Stop" ) )
            {
                this.playing = false;
                this.framework.autoRefresh = false;
            }
        }

        // Colors.
        let startColor = this.framework.resources.materials["white"];
        let endColor = this.framework.resources.materials["red"];
        let movingColor = this.framework.resources.materials["green"];
        let centerColor = this.framework.resources.materials["white"];
        let circleColor = this.framework.resources.materials["lightGray"];

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
            //p1 = this.startPosition;
            //p2 = new vec2( this.endPosition.x, p1.y );
            //midPos = p1.plus( p2 ).dividedBy( 2 );
            //str = "" + p1.minus( p2 ).length().toFixed(decimals);
            //[x,y] = this.camera.convertWorldToScreen( this.framework.canvas, midPos.x, midPos.y );
            //if( this.startPosition.y < this.endPosition.y )
            //    imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale );
            //else
            //    imgui.activeWindow.cursor.setF32( x / this.framework.imgui.scale - str.length * 8 / 2, y / this.framework.imgui.scale - 12 );
            //imgui.text( str );
        }

        // Shapes.
        this.renderer.drawCircle( this.radius, this.centerPosition, circleColor );
        this.renderer.drawVector( this.centerPosition, endPos, endColor );
        this.renderer.drawVector( this.centerPosition, startPos, startColor );
        this.renderer.drawVector( this.centerPosition, currentPos, movingColor );
        this.renderer.drawPoint( this.centerPosition, centerColor );
        this.renderer.drawPoint( currentPos, movingColor );
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

RegisterGuide_AngularVelocity();
