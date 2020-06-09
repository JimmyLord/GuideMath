class RenderHelpers
{
    constructor(framework, camera)
    {
        this.framework = framework;
        this.camera = camera;
    }

    drawGrid(min, max, increment)
    {
        let matWorld = new mat4;

        let edgeMesh = this.framework.resources.meshes["edge"];

        let gridCenterAxisColor = this.framework.resources.materials["white"];
        let gridMajorAxisColor = this.framework.resources.materials["gray"];
        let gridMinorAxisColor = this.framework.resources.materials["darkGray"];

        let size = max - min;

        for( let i=min; i<=max + 0.0001; i+=increment )
        {
            // Horizontal lines.
            matWorld.createSRT( new vec3(size, 0.2, 0), new vec3(0,0,0), new vec3(0, i, 0) );
            if( Math.abs(i) < 0.1 )
                edgeMesh.draw( this.camera, matWorld, gridCenterAxisColor );
            else if( Math.abs(i - Math.round(i)) < 0.1 )
                edgeMesh.draw( this.camera, matWorld, gridMajorAxisColor );
            else
                edgeMesh.draw( this.camera, matWorld, gridMinorAxisColor );

            // Vertical lines.
            matWorld.createSRT( new vec3(size, 0.2, 0), new vec3(0,0,90), new vec3(i, 0, 0) );
            if( Math.abs(i) < 0.1 )
                edgeMesh.draw( this.camera, matWorld, gridCenterAxisColor );
            else if( Math.abs(i - Math.round(i)) < 0.1 )
                edgeMesh.draw( this.camera, matWorld, gridMajorAxisColor );
            else
                edgeMesh.draw( this.camera, matWorld, gridMinorAxisColor );
        }
    }

    drawPoint(pos, color)
    {
        let matWorld = new mat4;

        let vertexMesh = this.framework.resources.meshes["vertex"];

        matWorld.createSRT( new vec3(1), new vec3(0), new vec3(pos.x, pos.y, 0) );
        vertexMesh.draw( this.camera, matWorld, color );
    }

    drawVector(p1, p2, color)
    {
        let matWorld = new mat4;

        let edgeMesh = this.framework.resources.meshes["edge"];

        let midPos = p1.plus( p2 ).dividedBy( 2 );
        let distance = p1.distanceFrom( p2 );
        let d = p1.minus( p2 );
        let angle = Math.atan2( d.y, d.x ) * 180.0 / Math.PI;

        let pos3 = new vec3( midPos.x, midPos.y, 0 );
        matWorld.createSRT( new vec3(distance, 1, 0), new vec3(0,0,-angle), pos3 );
        edgeMesh.draw( this.camera, matWorld, color );
    }
}
