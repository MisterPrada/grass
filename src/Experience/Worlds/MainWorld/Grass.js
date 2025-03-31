import * as THREE from 'three/webgpu'
import * as Helpers from '@experience/Utils/Helpers.js'
import Model from '@experience/Worlds/Abstracts/Model.js'
import Experience from '@experience/Experience.js'
import Debug from '@experience/Utils/Debug.js'
import State from "@experience/State.js";

import {
    noise, bezier, bezierGrad, rotateY,
    rotateAxis, _hash, easeOut, hemiLight, phongSpecular, lambertLight
} from '@experience/Utils/TSL-utils.js'

import {
    sin, time, vec2, vec3, vec4, uv, uniform, color, texture, If,
    instanceIndex, mix, varying, Fn, cos, float, normalize, pow, smoothstep,
    distance, instancedArray, select, abs, modelViewMatrix, Discard, vertexIndex, int,
    cameraProjectionMatrix, modelWorldMatrix, saturate, remap, sub, mat2, mat3, cameraPosition,
    dot, cross

} from 'three/tsl'

import { TextureAtlas } from '@experience/Utils/Helpers/TextureAtlas.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

const NUM_GRASS = 128 * 1024;
const GRASS_SEGMENTS = 6;
const GRASS_VERTICES = ( GRASS_SEGMENTS + 1 ) * 2;
const GRASS_PATCH_SIZE = 10;
const GRASS_WIDTH = 0.25;
const GRASS_HEIGHT = 1.5;

export default class Grass extends Model {
    experience = Experience.getInstance()
    debug = Debug.getInstance()
    state = State.getInstance()
    sizes = experience.sizes
    input = experience.input


    time = experience.time

    renderer = experience.renderer.instance
    resources = experience.resources
    container = new THREE.Group();

    isMobile = this.experience.isMobile

    uniforms = {
        color: uniform( color( 1, 1, 1 ) ),
        cursorGroundPoint: uniform( vec3( 0, 0, 0 ) ),
        grassHeightMultiplier: uniform( float( 1 ) )
    }

    varyings = {
        vColour: varying( vec3( 0 ) ),
        vNormal: varying( vec3( 0 ) ),
        vWorldPosition: varying( vec3( 0 ) ),
        vGrassData: varying( vec2( 0 ) ),

        vGrassType: varying( int( 0 ) ),
        vGrassSide: varying( float( 0 ) ),
    }

    constructor( parameters = {} ) {
        super()

        this.world = parameters.world
        this.camera = this.world.camera.instance
        this.cameraClass = this.world.camera
        this.scene = this.world.scene
        this.logo = this.world.logo
        this.postProcess = this.experience.postProcess
        this.input = this.world.input
        this.raycaster = this.input.raycaster

        this.setModel()
        //this.setGround()
        this.setListeners()
        this.setDebug()
    }

    _createGrassGeometry( segments ) {
        const VERTICES = ( segments + 1 ) * 2;
        const indices = [];

        for ( let i = 0; i < segments; ++i ) {
            const vi = i * 2;
            indices[ i * 12 + 0 ] = vi + 0;
            indices[ i * 12 + 1 ] = vi + 1;
            indices[ i * 12 + 2 ] = vi + 2;

            indices[ i * 12 + 3 ] = vi + 2;
            indices[ i * 12 + 4 ] = vi + 1;
            indices[ i * 12 + 5 ] = vi + 3;

            // const fi = VERTICES + vi;
            // indices[ i * 12 + 6 ] = fi + 2;
            // indices[ i * 12 + 7 ] = fi + 1;
            // indices[ i * 12 + 8 ] = fi + 0;
            //
            // indices[ i * 12 + 9 ] = fi + 3;
            // indices[ i * 12 + 10 ] = fi + 1;
            // indices[ i * 12 + 11 ] = fi + 2;
        }

        const geo = new THREE.InstancedBufferGeometry();
        geo.instanceCount = NUM_GRASS;
        geo.setIndex( indices );
        geo.boundingSphere = new THREE.Sphere(
            new THREE.Vector3( 0, 0, 0 ),
            1 + GRASS_PATCH_SIZE * 2
        );

        return geo;
    }

    postInit() {

    }

    setModel() {
        const torusGeometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
        const torusMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        const baseMesh = this.baseMesh = new THREE.Mesh( torusGeometry, torusMaterial );


        // Create a sampler for a Mesh surface.
        const sampler = new MeshSurfaceSampler( baseMesh )
            //.setWeightAttribute( null )
            .build();


        const positionsArray = new Float32Array( NUM_GRASS * 3 )
        const normalsArray = new Float32Array( NUM_GRASS * 3 )

        const tempPosition = new THREE.Vector3();
        const tempNormal = new THREE.Vector3();

        for ( let i = 0; i < NUM_GRASS; i++ ) {
            sampler.sample( tempPosition, tempNormal );
            positionsArray[ i * 3 + 0 ] = tempPosition.x;
            positionsArray[ i * 3 + 1 ] = tempPosition.y;
            positionsArray[ i * 3 + 2 ] = tempPosition.z;

            normalsArray[ i * 3 + 0 ] = tempNormal.x;
            normalsArray[ i * 3 + 1 ] = tempNormal.y;
            normalsArray[ i * 3 + 2 ] = tempNormal.z;
        }

        const positionBuffer = instancedArray( positionsArray, 'vec3' );
        const normalBuffer = instancedArray( normalsArray, 'vec3' );

        //////////////////////////////////////////////////////////////////////

        const grass1Texture = this.resources.items.grass1Texture
        const grass2Texture = this.resources.items.grass2Texture

        const diffuse = new TextureAtlas();

        diffuse.Load( 'diffuse', [
            grass1Texture,
            grass2Texture,
        ] );

        const grassAtlasTexture = diffuse.Info[ 'diffuse' ].atlas

        const material = new THREE.MeshBasicNodeMaterial( {
            //color: 0x000000,
            side: THREE.DoubleSide,
            //transparent: true,
        } );

        const BASE_COLOUR = vec3( 0.1, 0.4, 0.04 );
        const TIP_COLOUR = vec3( 0.5, 0.7, 0.3 );

        material.vertexNode = Fn( () => {
            const cursorPoint = this.uniforms.cursorGroundPoint.toVar()
            const position = positionBuffer.element( instanceIndex ).toVar();
            const normal = normalBuffer.element( instanceIndex ).toVar();

            const grass_segments = int( GRASS_SEGMENTS )
            const grass_vertices = int( GRASS_VERTICES )
            const grass_height = float( GRASS_HEIGHT ).mul( this.uniforms.grassHeightMultiplier ).toVar()

            const width = float( GRASS_WIDTH )
            //const height = float( GRASS_HEIGHT )

            const grass_patch_size = int( GRASS_PATCH_SIZE )

            // Figure out grass offset
            // const hashedInstanceID = hash21( float( instanceIndex ) ).mul( 2 ).sub( 1 );
            // const grassOffset = vec3( hashedInstanceID.x, 0.0, hashedInstanceID.y ).mul( grass_patch_size ).toVar();

            //grassOffset.assign( terrainHeight( grassOffset ) )

            const grassOffset = position


            const grassBladeWorldPos = vec3( modelWorldMatrix.mul( vec4( grassOffset, 1.0 ) ).xyz ).toVar();
            const hashVal = vec3( _hash( grassBladeWorldPos ) ).toVar();

            const grassType = float( select( saturate( hashVal.z ).greaterThan( 0.75 ), 1.0, 0.0 ) ).toVar();

            const PI = float( 3.14159 );
            const angle = float( remap( hashVal.x, float( -1.0 ), 1.0, PI.negate(), PI ) ).toVar();

            // Stiffness
            const stiffness = float( 1.0 ).toVar();

            // Debug
            // grassOffset.assign( vec3( float( instanceIndex ).mul( 0.5 ).sub( 8.0 ), 0.0, 0.0 ) );
            // angle.assign( float( instanceIndex ).mul( 0.2 ) );

            const height = float( grass_height ).toVar()
            // const height = float( grass_height / 4 ).toVar()
            //
            const cursorRadius = float( 3 )
            // cursorPoint.y.addAssign( grassOffset.y )

            const dist = grassOffset.distance( cursorPoint )

            If( dist.lessThan( cursorRadius ), () => {
                height.assign( float( grass_height ).mul( dist.remap( 0, cursorRadius, grass_height.mul( 1.5 ), 1 ).pow( 2 ) ) );
            } )


            // Figure out vertex id, > GRASS_VERTICES is other side
            const vertFB_ID = int( vertexIndex ).mod( grass_vertices.mul( 2 ) );
            const vertID = vertFB_ID.mod( grass_vertices );

            const xTest = int( vertID.bitAnd( int( 0x1 ) ) ).toVar();
            const zTest = int( select( vertFB_ID.greaterThanEqual( grass_vertices ), int( 1 ), int( -1 ) ) ).toVar();

            const xSide = float( xTest );
            const zSide = float( zTest );

            const heightPercent = float( float( vertID.sub( xTest ) ).div( float( grass_segments ).mul( 2.0 ) ) ).toVar();

            // Calculate the vertex position
            const x = float( xSide.sub( 0.5 ).mul( width ) ).toVar();
            const y = float( heightPercent.mul( height ) ).toVar();
            const z = float( 0.0 ).toVar();

            // Grass lean factor
            const windStrength = float( noise( vec3( grassBladeWorldPos.xz.mul( 0.05 ), 0.0 ).add( time ) ) ).toVar();
            const windAngle = float( 0.0 ).toVar();
            const windAxis = vec3( cos( windAngle ), 0.0, sin( windAngle ) ).toVar();
            const windLeanAngle = float( windStrength.mul( 1.5 ).mul( heightPercent ).mul( stiffness ) ).toVar();

            // const randomLeanAnimation = float( sin( time.mul( 2.0 ).add( hashVal.y ) ).mul( 0.025 ) ).toVar();
            const randomLeanAnimation = float( noise( vec3( grassBladeWorldPos.xz, time.mul( 4.0 ) ) ).mul( windStrength.mul( 0.5 ).add( 0.125 ) ) ).toVar();
            // randomLeanAnimation.assign( 0.0 );
            // windStrength.assign( 0.0 );
            // windLeanAngle.assign( 0.0 );
            const leanFactor = float( remap( hashVal.y, float( -1.0 ), 1.0, float( -0.5 ), 0.5 ).add( randomLeanAnimation ) ).toVar();

            // Debug
            // const leanFactor = float( 1.0 );

            // Add the bezier curve for bend
            const p1 = vec3( 0.0 ).toVar();
            const p2 = vec3( 0.0, 0.33, 0.0 ).toVar();
            const p3 = vec3( 0.0, 0.66, 0.0 ).toVar();
            const p4 = vec3( 0.0, cos( leanFactor ), sin( leanFactor ) ).toVar();
            const curve = vec3( bezier( p1, p2, p3, p4, heightPercent ) ).toVar();

            // Calculate normal
            const curveGrad = vec3( bezierGrad( p1, p2, p3, p4, heightPercent ) ).toVar();
            const curveRot90 = mat2( mat2( 0.0, 1.0, float( -1.0 ), 0.0 ).sub( mat2( zSide, zSide, zSide, zSide ) ) ).toVar();
            y.assign( curve.y.mul( height ) );
            z.assign( curve.z.mul( height ) );


            const n = normalize( normal );
            const up1 = vec3( 0.0, 1.0, 0.0 );
            const up2 = vec3( 1.0, 0.0, 0.0 );
            const useUp1 = abs( dot( n, up1 ) ).lessThan( 0.99 );
            const ref = vec3( select( useUp1, up1, up2 ) ); // if normal is close to up1, use up2 as reference

            const tangent = normalize( cross( ref, n ) );
            const bitangent = normalize( cross( n, tangent ) );
            const alignToNormal = mat3( tangent, n, bitangent );

            const grassMat = mat3(
                alignToNormal
                    .mul( rotateAxis( windAxis, windLeanAngle ) )
                    .mul( rotateY( angle ) )
            );

            // Generate grass matrix
            //const grassMat = mat3( rotateAxis( windAxis, windLeanAngle ).mul( rotateY( angle ) ) ).toVar();
            const grassLocalPosition = vec3( grassMat.mul( vec3( x, y, z ) ).add( grassOffset ) ).toVar();
            const grassLocalNormal = vec3( grassMat.mul( vec3( 0.0, curveRot90.mul( curveGrad.yz ) ) ) ).toVar();

            // Blend normal
            const distanceBlend = float( smoothstep( 0.0, 10.0, distance( cameraPosition, grassBladeWorldPos ) ) ).toVar();
            grassLocalNormal.assign( mix( grassLocalNormal, vec3( 0.0, 1.0, 0.0 ), distanceBlend.mul( 0.5 ) ) );
            grassLocalNormal.assign( normalize( grassLocalNormal ) );

            // Viewspace thicken
            const mvPosition = modelViewMatrix.mul( vec4( grassLocalPosition, 1.0 ) ).toVar();
            const viewDir = vec3( normalize( cameraPosition.sub( grassBladeWorldPos ) ) ).toVar();
            const grassFaceNormal = vec3( grassMat.mul( vec3( 0.0, 0.0, zSide.negate() ) ) ).toVar();
            const viewDotNormal = float( saturate( dot( grassFaceNormal, viewDir ) ) ).toVar();
            const viewSpaceThickenFactor = float( easeOut( sub( 1.0, viewDotNormal ), 4.0 ).mul( smoothstep( 0.0, 0.2, viewDotNormal ) ) ).toVar();

            mvPosition.x.addAssign( viewSpaceThickenFactor.mul( xSide.sub( 0.5 ) ).mul( width ).mul( 0.5 ).sub( zSide ) );
            const finalPosition = cameraProjectionMatrix.mul( mvPosition );
            //finalPosition.w.assign( select( tileGrassHeight.lessThan( 0.25 ), 0.0, finalPosition.w ) );
            //finalPosition.w.assign( select( dist.greaterThan( cursorRadius ), 0.0, finalPosition.w ) );

            this.varyings.vColour.assign( mix( BASE_COLOUR, TIP_COLOUR, heightPercent ) );
            this.varyings.vColour.assign( mix( vec3( 1.0, 0.0, 0.0 ), this.varyings.vColour, stiffness ) );
            this.varyings.vNormal.assign( normalize( modelWorldMatrix.mul( vec4( grassLocalNormal, 0.0 ) ).xyz ) );
            this.varyings.vWorldPosition.assign( modelWorldMatrix.mul( vec4( grassLocalPosition, 1.0 ) ).xyz );
            this.varyings.vGrassData.assign( vec2( x, heightPercent ) );
            this.varyings.vGrassSide.assign( xSide );
            this.varyings.vGrassType.assign( grassType );

            return finalPosition
        } )()

        material.colorNode = Fn( () => {
            const grassX = float( this.varyings.vGrassData.x ).toVar();
            const grassY = float( this.varyings.vGrassData.y ).toVar();
            const grassType = this.varyings.vGrassType.toVar()
            const grassSide = this.varyings.vGrassSide.toVar()
            const normal = vec3( normalize( this.varyings.vNormal ) ).toVar();
            const viewDir = vec3( normalize( cameraPosition.sub( this.varyings.vWorldPosition ) ) ).toVar();

            // const baseColour = vec3( mix( vColour.mul( 0.75 ), vColour, smoothstep( 0.125, 0.0, abs( grassX ) ) ) ).toVar();

            const _uv = vec2( grassSide, grassY ).toVar();
            const baseColour = texture( grassAtlasTexture, _uv ).depth( grassType );

            If( baseColour.a.lessThan( 0.5 ), () => {
                Discard();
            } );

            // Hemi
            const c1 = vec3( 1.0, 1.0, 0.75 ).toVar();
            const c2 = vec3( 0.05, 0.05, 0.25 ).toVar();

            const ambientLighting = vec3( hemiLight( normal, c2, c1 ) ).toVar();

            // Directional light
            const lightDir = vec3( normalize( vec3( float( -1.0 ), 0.5, 1.0 ) ) ).toVar();
            const lightColour = vec3( 1.0 ).toVar();
            const diffuseLighting = vec3( lambertLight( normal, viewDir, lightDir, lightColour ) ).toVar();

            // Specular
            const specular = vec3( phongSpecular( normal, lightDir, viewDir ) ).toVar();

            // Fake AO
            const ao = float( remap( pow( grassY, 2.0 ), 0.0, 1.0, 0.125, 1.0 ) ).toVar();
            const lighting = vec3( diffuseLighting.mul( 0.5 ).add( ambientLighting.mul( 0.5 ) ) ).toVar();
            const colour = vec3( baseColour.xyz.mul( ambientLighting ).add( specular.mul( 0.25 ) ) ).toVar();
            colour.mulAssign( ao );

            return vec4( pow( colour, vec3( 1.0 / 2.2 ) ), 1.0 )
        } )()

        material.emissiveNode = Fn( () => {
            const grassX = float( this.varyings.vGrassData.x ).toVar();
            const grassY = float( this.varyings.vGrassData.y ).toVar();
            const grassType = this.varyings.vGrassType.toVar()
            const grassSide = this.varyings.vGrassSide.toVar()
            const normal = vec3( normalize( this.varyings.vNormal ) ).toVar();
            const viewDir = vec3( normalize( cameraPosition.sub( this.varyings.vWorldPosition ) ) ).toVar();

            // const baseColour = vec3( mix( vColour.mul( 0.75 ), vColour, smoothstep( 0.125, 0.0, abs( grassX ) ) ) ).toVar();

            const _uv = vec2( grassSide, grassY ).toVar();
            const baseColour = texture( grassAtlasTexture, _uv ).depth( grassType );

            If( baseColour.a.lessThan( 0.5 ), () => {
                Discard();
            } );

            // Hemi
            const c1 = vec3( 1.0, 1.0, 0.75 ).toVar();
            const c2 = vec3( 0.05, 0.05, 0.25 ).toVar();

            const ambientLighting = vec3( hemiLight( normal, c2, c1 ) ).toVar();

            // Directional light
            const lightDir = vec3( normalize( vec3( float( -1.0 ), 0.5, 1.0 ) ) ).toVar();
            const lightColour = vec3( 1.0 ).toVar();
            const diffuseLighting = vec3( lambertLight( normal, viewDir, lightDir, lightColour ) ).toVar();

            // Specular
            const specular = vec3( phongSpecular( normal, lightDir, viewDir ) ).toVar();

            // Fake AO
            const ao = float( remap( pow( grassY, 2.0 ), 0.0, 1.0, 0.125, 1.0 ) ).toVar();
            const lighting = vec3( diffuseLighting.mul( 0.5 ).add( ambientLighting.mul( 0.5 ) ) ).toVar();
            const colour = vec3( baseColour.xyz.mul( ambientLighting ).add( specular.mul( 0.25 ) ) ).toVar();
            colour.mulAssign( ao );

            // colour.assign( lighting );
            // colour.assign( vColour );

            If( grassType.equal( 0 ), () => {
                colour.assign( vec3( 0.0, 0.0, 0.0 ) );
            } ).Else( () => {

            } )

            colour.assign( vec4( pow( colour, vec3( 1.0 / 2.2 ) ), 1.0 ) );

            return colour
        } )()

        const geometry = this._createGrassGeometry( GRASS_SEGMENTS );

        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.set( 0, 0, 0 );

        this.container.add( mesh );
        this.scene.add( this.container )
    }

    animationPipeline() {

    }

    resize() {

    }

    setDebug() {
        if ( !this.debug.active ) return

        //this.debug.createDebugTexture( this.resources.items.displacementTexture, this.world )


        //this.debug.createDebugNode( viewportDepthTexture( uv().flipY() ), this.world )
        //this.debug.createDebugNode( viewportLinearDepth, this.world )


        const grassFolder = this.world.debugFolder.addFolder( {
            title: 'Grass',
            expanded: true
        } )


        grassFolder.addBinding( this.uniforms.grassHeightMultiplier, 'value', {
            label: 'Height Multiplier',
            min: 0,
            max: 5
        } )

    }

    _cursorUpdate() {

        this.raycaster.firstHitOnly = true;
        this.raycaster.setFromCamera( this.input.cursor, this.camera );

        const intersects = this.raycaster.intersectObject( this.baseMesh );

        // Toggle rotation bool for meshes that we clicked
        if ( intersects.length > 0 ) {

            this.uniforms.cursorGroundPoint.value = intersects[ 0 ].point;

        }
    }

    setListeners() {
        document.addEventListener( 'mousemove', ( event ) => {
            this._cursorUpdate()
        } )
    }

    async update( deltaTime ) {
        //this._cursorUpdate()
    }
}
