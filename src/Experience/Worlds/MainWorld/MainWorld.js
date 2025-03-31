import * as THREE from 'three'
import Experience from '@experience/Experience.js'
import DebugHelpers from "../Objects/DebugHelpers.js";
import Time from "@experience/Utils/Time.js";
import EventEmitter from '@experience/Utils/EventEmitter.js';
import Debug from '@experience/Utils/Debug.js';

import Camera from './Camera.js'
import Input from "@experience/Utils/Input.js";
import Environment from "./Environment.js";

import Grass from "@experience/Worlds/MainWorld/Grass.js";

export default class MainWorld extends EventEmitter {
    experience = Experience.getInstance()
    time = Time.getInstance()
    debug = Debug.getInstance()
    state = this.experience.state
    renderer = this.experience.renderer.instance
    scene = new THREE.Scene()
    camera = new Camera( { world: this } )
    input = new Input( { camera: this.camera.instance } )
    resources = this.experience.resources
    html = this.experience.html
    sound = this.experience.sound

    uniforms = this.state.uniforms.mainScene

    constructor() {
        super();

        this._setDebug()

        this.init()

        this.scene.add( this.camera.instance )
    }

    init() {
        this.grass = new Grass( { world: this } )

        this.environment = new Environment( { world: this } )

        this.debugHelpers = new DebugHelpers( { world: this } )
    }

    animationPipeline() {
        this.grass?.animationPipeline()
    }

    postInit() {
        this.grass?.postInit()
    }

    resize() {
        this.grass?.resize()

        this.camera?.resize()
    }

    update( deltaTime ) {
        this.debugHelpers?.update( deltaTime )
        this.grass?.update( deltaTime )

        this.camera?.update()
    }

    postUpdate( deltaTime ) {

    }

    _setDebug() {
        if ( !this.debug.active ) return

        this.debugFolder = this.debug.panel.addFolder( {
            title: 'Main World', expanded: true
        } )

        const postProcessFolder = this.debugFolder.addFolder( {
            title: 'PostProcess',
            expanded: false
        } )

        // Bloom Pass Preload
        postProcessFolder.addBinding( this.state.uniforms.mainScene.bloomPass.strength, 'value', {
            min: 0, max: 5, step: 0.001, label: 'Strength'
        } )

        postProcessFolder.addBinding( this.state.uniforms.mainScene.bloomPass.strength, 'value', {
            min: -2, max: 1, step: 0.001, label: 'Radius'
        } )

        postProcessFolder.addBinding( this.state.uniforms.mainScene.bloomPass.strength, 'value', {
            min: 0, max: 1, step: 0.001, label: 'Threshold'
        } )



        // this.debugFolder.addBinding( this.uniforms.compositionColor, 'value', {
        //     label: 'Composition Color',
        //     color: { type: 'float' }
        // } ).on( 'change', () => {
        //     this.water.rectLight1.color = this.uniforms.compositionColor.value
        // } )
        //
        // this.debugFolder.addBinding( this.uniforms.emissiveIntensity, 'value', {
        //     label: 'Emission Intensity',
        //     min: 1,
        //     max: 4
        // } )

    }
}
