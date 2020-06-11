class RenderHelpers
{
    constructor(framework, camera)
    {
        this.framework = framework;
        this.camera = camera;
    }

    addStepSelector(imgui, step, maxStep)
    {
        imgui.activeWindow.cursor.x = 46;
        if( step == 1 )
        {
            imgui.activeWindow.cursor.x = 60;
        }
        else
        {
            if( imgui.button( "<" ) )
            {
                step--;
            }
            imgui.sameLine();
        }
        imgui.text( " Step " + step + " " );
        if( step < maxStep )
        {
            imgui.sameLine();
            if( imgui.button( ">" ) )
            {
                step++;
            }
        }

        return step;
    }

    drawGrid(min, max, increment)
    {
        let matWorld = new mat4;

        let mesh = this.framework.resources.meshes["edge"];

        let gridCenterAxisColor = this.framework.resources.materials["gray"];
        let gridMajorAxisColor = this.framework.resources.materials["darkGray"];
        let gridMinorAxisColor = this.framework.resources.materials["VDarkGray"];

        let size = max - min;

        for( let i=min; i<=max + 0.0001; i+=increment )
        {
            // Horizontal lines.
            matWorld.createSRT( new vec3(size, 0.2, 0), new vec3(0,0,0), new vec3(0, i, 0) );
            if( Math.abs(i) < 0.1 )
                mesh.draw( this.camera, matWorld, gridCenterAxisColor );
            else if( Math.abs(i - Math.round(i)) < 0.1 )
                mesh.draw( this.camera, matWorld, gridMajorAxisColor );
            else
                mesh.draw( this.camera, matWorld, gridMinorAxisColor );

            // Vertical lines.
            matWorld.createSRT( new vec3(size, 0.2, 0), new vec3(0,0,90), new vec3(i, 0, 0) );
            if( Math.abs(i) < 0.1 )
                mesh.draw( this.camera, matWorld, gridCenterAxisColor );
            else if( Math.abs(i - Math.round(i)) < 0.1 )
                mesh.draw( this.camera, matWorld, gridMajorAxisColor );
            else
                mesh.draw( this.camera, matWorld, gridMinorAxisColor );
        }
    }

    drawPoint(pos, color)
    {
        let matWorld = new mat4;

        let mesh = this.framework.resources.meshes["vertex"];

        matWorld.createSRT( new vec3(1), new vec3(0), new vec3(pos.x, pos.y, 0) );
        mesh.draw( this.camera, matWorld, color );
    }

    drawVector(p1, p2, color)
    {
        let matWorld = new mat4;

        let mesh = this.framework.resources.meshes["edge"];

        let midPos = p1.plus( p2 ).dividedBy( 2 );
        let distance = p1.distanceFrom( p2 );
        let d = p1.minus( p2 );
        let angle = Math.atan2( d.y, d.x ) * 180.0 / Math.PI;

        let pos3 = new vec3( midPos.x, midPos.y, 0 );
        matWorld.createSRT( new vec3(distance, 1, 0), new vec3(0,0,-angle), pos3 );
        mesh.draw( this.camera, matWorld, color );
    }

    drawCircle(scale, center, color)
    {
        let matWorld = new mat4;
        let mesh = this.framework.resources.meshes["circle"];

        matWorld.createSRT( new vec3(scale), new vec3(0), new vec3(center.x, center.y, 0) );
        mesh.draw( this.camera, matWorld, color );
    }
}
