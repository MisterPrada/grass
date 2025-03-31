import * as THREE from 'three/webgpu'
import * as Helpers from '@experience/Utils/Helpers.js'
import Experience from '../Experience.js'

import normalizeWheel from 'normalize-wheel'
import Sizes from "./Sizes.js";
import { MathUtils } from "three";

export default class Input {
    static _instance = null

    static getInstance() {
        return Input._instance || new Input()
    }

    constructor( parameters = {} ) {
        if ( Input._instance ) {
            return Input._instance
        }
        Input._instance = this

        this.experience = Experience.getInstance()
        this.sizes = Sizes.getInstance()
        this.time = this.experience.time
        this.camera = parameters.camera

        this.cursor = { x: 0, y: 0, side: 'left' }
        this.previosClient = { x: 0, y: 0 }
        this.previosCursor = { x: 0, y: 0 }
        this.cursor3D = new THREE.Vector3()
        this.cursorDirection = new THREE.Vector3()

        this.cursorVelocityCurrent = new THREE.Vector2( 0, 0 )
        this.cursorVelocity = new THREE.Vector2( 0, 0 )

        this.velocityMin = new THREE.Vector2( -1, -1 )
        this.velocityMax = new THREE.Vector2( 1, 1 )

        this.clientX = 0
        this.clientY = 0

        this.raycaster = new THREE.Raycaster()

        this.init()
    }

    init() {
        window.addEventListener( 'mousemove', this._onMouseMoved )
        window.addEventListener( 'touchstart', this._onTouchStart )
        window.addEventListener( 'touchmove', this._onTouchMoved )
    }

    postInit() {

    }

    getNDCFrom3d( x, y, z ) {
        const vector = new THREE.Vector3( x, y, z );
        vector.project( this.camera );
        return vector;
    }

    _onMouseMoved = ( event ) => {

        this.previosClient.x = this.clientX || event.clientX
        this.previosClient.y = this.clientY || event.clientY


        this.clientX = event.clientX / this.sizes.width
        this.clientY = event.clientY / this.sizes.height

        this.previosCursor.x = this.cursor.x
        this.previosCursor.y = this.cursor.y

        this.cursor.x = event.clientX / this.sizes.width * 2 - 1
        this.cursor.y = -( event.clientY / this.sizes.height ) * 2 + 1
        this.cursor.side = event.clientX > this.sizes.width / 2 ? 'right' : 'left'

        this.previosCursor3D = this.cursor3D.clone()
        this.cursor3D = Helpers.projectNDCTo3D( this.cursor.x, this.cursor.y, this.camera )
        this.cursorDirection = this.cursor3D.clone().sub( this.previosCursor3D ).normalize()


        const deltaX = this.clientX - this.previosClient.x
        const deltaY = this.clientY - this.previosClient.y
        this.cursorVelocity.set( deltaX, deltaY ).divideScalar( this.time.delta )
        this.cursorVelocity.clamp( this.velocityMin, this.velocityMax )

        // const deltaX = this.cursor.x - this.previosCursor.x
        // const deltaY = this.cursor.y - this.previosCursor.y
        // this.cursorVelocity.set(deltaX, deltaY).divideScalar(this.time.delta)
        // this.cursorVelocity.clamp(new THREE.Vector2(-1), new THREE.Vector2(1))
    }

    _onTouchStart = ( event ) => {
        this._onTouchMoved( event )
    }

    _onTouchMoved = ( event ) => {
        this.previosClient.x = this.clientX || event.touches[ 0 ].clientX
        this.previosClient.y = this.clientY || event.touches[ 0 ].clientY

        this.clientX = event.touches[ 0 ].clientX
        this.clientY = event.touches[ 0 ].clientY

        this.cursor.x = event.touches[ 0 ].clientX / this.sizes.width * 2 - 1
        this.cursor.y = -( event.touches[ 0 ].clientY / this.sizes.height ) * 2 + 1
        this.cursor.side = event.touches[ 0 ].clientX > this.sizes.width / 2 ? 'right' : 'left'

        this.previosCursor3D = this.cursor3D.clone()
        this.cursor3D = Helpers.projectNDCTo3D( this.cursor.x, this.cursor.y, this.camera )
        this.cursorDirection = this.cursor3D.clone().sub( this.previosCursor3D ).normalize()

        const deltaX = this.clientX - this.previosClient.x
        const deltaY = this.clientY - this.previosClient.y
        this.cursorVelocity.set( deltaX, deltaY ).divideScalar( this.time.delta )
        this.cursorVelocity.clamp( this.velocityMin, this.velocityMax )
    }

    update() {
        this.cursorVelocity.x = MathUtils.damp(
            this.cursorVelocity.x,
            0,
            3,
            this.time.delta
        );

        this.cursorVelocity.y = MathUtils.damp(
            this.cursorVelocity.y,
            0,
            3,
            this.time.delta
        );
    }
}
