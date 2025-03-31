import Experience from '@experience/Experience.js'
import EventEmitter from '@experience/Utils/EventEmitter.js';

import MainWorld from '@experience/Worlds/MainWorld/MainWorld.js'

export default class Worlds extends EventEmitter{
    constructor() {
        super();

        this.experience = Experience.getInstance()
        this.experience.worlds = this

        this.setupWorlds()
    }

    setupWorlds() {
        // Setup
        this.mainWorld = new MainWorld()

        this.experience.mainScene = this.mainWorld.scene
        this.experience.mainCamera = this.mainWorld.camera
    }

    postInit() {
        this.mainWorld?.postInit()
        this.postProcess = this.experience.postProcess
    }

    animationPipeline() {
        this.mainWorld?.animationPipeline()
    }

    resize() {
        this.mainWorld?.resize()
    }

    update( deltaTime ) {
        this.mainWorld?.update( deltaTime )
    }

    postUpdate( deltaTime ) {
        this.mainWorld?.postUpdate( deltaTime )
    }
}
