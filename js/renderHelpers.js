const align =
{
    x: {
        left: 0,
        center: -0.5,
        right: -1.0,
    },
    y: {
        top: 0,
        center: -0.5,
        bottom: -1.0,
    },
};

class RenderHelpers
{
    constructor(framework, camera)
    {
        this.framework = framework;
        this.camera = camera;
    }

    addPageSelector(framework, page, maxPage)
    {
        let imgui = framework.imgui;

        if( page < 1 )
            page = 1;

        imgui.activeWindow.cursor.x = imgui.activeWindow.position.x + 46;
        if( page == 1 )
        {
            imgui.activeWindow.cursor.x = imgui.activeWindow.position.x + 60;
        }
        else
        {
            if( imgui.button( "<" ) )
            {
                page--;
                this.framework.refresh();
            }
            imgui.sameLine();
        }
        imgui.text( " Page " + page + " " );
        if( page < maxPage )
        {
            imgui.sameLine();
            if( imgui.button( ">" ) )
            {
                this.framework.refresh();
                page++;
            }
        }

        return page;
    }

    drawString(str, x, y, alignX, alignY)
    {
        let imgui = this.framework.imgui;

        let strW = str.length * 8;
        let strH = 14;

        let screenPos = this.camera.convertWorldToScreen( this.framework.canvas, x, y );
        imgui.activeWindow.cursor.setF32( screenPos.x, screenPos.y );
        imgui.activeWindow.cursor.divideBy( this.framework.imgui.scale );
        imgui.activeWindow.cursor.x += alignX * strW;
        imgui.activeWindow.cursor.y += alignY * strH;
        imgui.activeWindow.cursor.x = Math.round( imgui.activeWindow.cursor.x );
        imgui.activeWindow.cursor.y = Math.round( imgui.activeWindow.cursor.y );

        imgui.text( str );
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

    drawMesh(mesh, position, rotZ, material)
    {
        let matWorld = new mat4;

        matWorld.createSRT( vec3.getTemp(1,1,1), vec3.getTemp(0,0,rotZ), vec3.getTemp(position.x, position.y, 0) );
        mesh.draw( this.camera, matWorld, material );
    }

    drawPoint(pos, color, depth = 0)
    {
        let matWorld = new mat4;

        let mesh = this.framework.resources.meshes["vertex"];

        matWorld.createSRT( new vec3(1), new vec3(0), new vec3(pos.x, pos.y, depth) );
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
