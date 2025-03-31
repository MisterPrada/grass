import * as THREE from 'three/webgpu'
import * as Helpers from '@experience/Utils/Helpers.js'
import Model from '@experience/Worlds/Abstracts/Model.js'
import Experience from '@experience/Experience.js'
import Debug from '@experience/Utils/Debug.js'
import State from "@experience/State.js";

import {
    sin, positionLocal, time, vec2, vec3, vec4, uv, uniform, color, fog, rangeFogFactor,
    texture, If, min, range, instanceIndex, timerDelta, step, timerGlobal,
    mix, max, uint, cond, varying, Fn, struct, output, emissive, diffuseColor, PI, PI2,
    oneMinus, cos, atan, float, pass, mrt, viewportDepthTexture, screenUV, linearDepth, depth, viewportLinearDepth
} from 'three/tsl'

export default class ExampleClass extends Model {
    experience = Experience.getInstance()
    debug = Debug.getInstance()
    state = State.getInstance()
    input = experience.input
    time = experience.time
    renderer = experience.renderer.instance
    resources = experience.resources
    container = new THREE.Group();

    constructor( parameters = {} ) {
        super()

        this.world = parameters.world
        this.camera = this.world.camera.instance
        this.scene = this.world.scene
        this.transformControls = this.world.camera.transformControls

        this.init()
        this._setDebug()
    }

    init() {
        this.setModel()
    }

    postInit() {

    }

    setModel() {
        /**
         * Fox Model
         */
        this.foxModel = this.resources.items.foxModel.scene
        this.foxModel.scale.setScalar( 0.03 )
        //this.container.add( this.foxModel )

        this.damagedHelmet = this.resources.items.damagedHelmetModel.scene
        this.damagedHelmet.position.set( 0, 0, 2 )
        this.container.add( this.damagedHelmet )

        this.transformControls.attach( this.damagedHelmet )


        /**
         * Dummy
         */
            // Material
        const material = new THREE.MeshBasicNodeMaterial()

        // Uniforms
        const timeFrequency = uniform( 0.5 )
        const positionFrequency = uniform( 2 )
        const intensityFrequency = uniform( 0.5 )

        // Position
        const oscillation = sin( time.mul( timeFrequency ).add( positionLocal.y.mul( positionFrequency ) ) ).mul( intensityFrequency )
        material.positionNode = vec3(
            positionLocal.x.add( oscillation ),
            positionLocal.y,
            positionLocal.z
        )

        // Color
        material.colorNode = vec4( uv().mul( vec2( 32, 8 ) ).fract(), 1, 1 )

        // Mesh
        const mesh = new THREE.Mesh( new THREE.TorusKnotGeometry( 1, 0.35, 128, 32 ), material )
        this.container.add( mesh )
        this.scene.add( this.container )
    }

    animationPipeline() {

    }

    resize() {

    }

    _setDebug() {
        if ( !this.debug.active ) return


        const test = uniform(0)

        const exampleFolder = this.world.debugFolder.addFolder( {
            title: 'depth',
            expanded: true
        } )

        exampleFolder.addBinding( test, 'value', {
            label: 'TEST',
        } )


        //this.debug.createDebugNode( viewportDepthTexture( uv().flipY() ).step(test), this.world )
        //this.debug.createDebugNode( viewportLinearDepth, this.world )
        //this.debug.createDebugNode( uv().step(0.1), this.world )

        // const exampleFolder = this.world.debugFolder.addFolder( {
        //     title: 'Smoke',
        //     expanded: false
        // } )
        //
        // exampleFolder.addBinding( this.uniforms.exampleColor, 'value', {
        //     label: 'Smoke Color',
        //     color: { type: 'float' }
        // } )
        //
        // exampleFolder.addBinding( this.uniforms.size, 'value', {
        //     label: 'Size',
        //     min: 0,
        //     max: 10,
        //     step: 0.01
        // } )
    }

    update( deltaTime ) {
        //this.cube2.rotation.y += deltaTime * 20
        //this.cube.rotation.y += deltaTime * 30
    }

}
