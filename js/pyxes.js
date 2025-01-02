function isCollide(a, b) {
    return !(
        ((a.y + a.height) < (b.y)) ||
        (a.y > (b.y + b.height)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width))
    )
}

function isInside(a, b){
    return (
        (a.x > b.x && a.x < b.x + b.width) &&
        (a.y > b.y && a.y < b.y + b.height)
    )
}

const positionsMatch = (a, b) => a.x === b.x && a.y === b.y

function getDistance(a, b){
    let y = b.x - a.x;
    let x = b.y - a.y;
    return Math.sqrt(x * x + y * y)
}

const getDifference = (a, b) => Math.abs(a - b)

function getSignWithOne(number) {
    if (number === 0) return 0;

    return Math.abs(number) / number;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

const randomFloatInInterval = inter => Math.random() * (inter - (-inter)) + inter

const randomIntInInterval = inter => Math.floor(Math.random() * (inter - (-inter) + 1) + inter)

const randomFloatFromInterval = (min, max) => Math.random() * (max - min) + min

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const randomItemFromArray = array => array[Math.floor(Math.random() * array.length)]

const cloneObject = obj => Object.assign({}, obj)

const defaultGameObjectImageProps = {
    src: '',
    x: 0,
    y: 0,
    z: 0,
    width: 0,
    height: 0,
    flipX: false,
    flipY: false,
    pattern: false,
}

const defaultGameObjectTextProps = {
    value: '',
    x: 0,
    y: 0,
    bold: false,
    italic: false,
    font: 'Arial',
    fontSize: 16,
    align: 'left',
    baseline: 'top',
    color: '#fff',
    stroke: false,
    strokeColor: '#000',
    lineWidth: 1,
    offsetX: 0,
    offsetY: 0,
}

const defaultGameObjectProps = {
    name: null,
    scene: null,
    x: 0,
    y: 0,
    z: 0,
    width: 10,
    height: 10,
    color: "#fff",
    alpha: 255,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    tags: [],
    gui: false,
    ignorePause: false,
    active: true,
    visible: true,
    dontRenderIfNotVisible: true,
    dontUpdateIfNotVisible: false,
    checkCollision: true,
    checkInside: true,
    checkPositionsMatch: true,
    mouseOver: false,
    image: defaultGameObjectImageProps,
    imageCache: null,
    text: defaultGameObjectTextProps,
}

const imagesCache = {}

function loadImageCache(src) {
    const image = new Image()
    image.src = src
    imagesCache[src] = image
    imagesCache[src].onload = function() {
        imagesCache[src] = this
    }
}

class GameObject {
    constructor(props) {
        this.id = crypto.randomUUID()

        props = {
            ...defaultGameObjectProps,
            ...props
        }

        props.image = {
            ...defaultGameObjectImageProps,
            ...props.image
        }

        props.text = {
            ...defaultGameObjectTextProps,
            ...props.text
        }

        Object.entries(props).forEach(([key, value]) => {
            this[key] = value
        })

        if (!this.imageCache && this.image && this.image.src && this.image.src != '') {
            this.loadImageCache()
        }

        if (this.text && this.text.value != undefined && this.text.value != '') {
            this.scene.game.ctx.font = `${this.text.bold ? 'bold ' : ''}${this.text.italic ? 'italic ' : ''}${this.text.fontSize}px ${this.text.font}`;

            this.text.width = this.scene.game.ctx.measureText(this.text.value).width
        }
    }

    loadImageCache() {
        const gameObject = this
        if (imagesCache[this.image.src]) {
            gameObject.imageCache = imagesCache[this.image.src]
        } else {
            const image = new Image()
            image.src = this.image.src
            imagesCache[gameObject.image.src] = image
            image.onload = function() {
                gameObject.imageCache = image
            }
        }
    }

    render() {
        if (this.dontRenderIfNotVisible && !this.isVisible()) return

        if (this.color != 'transparent' && this.color != null && this.color != false) {
            this.scene.game.ctx.fillStyle = this.color

            this.scene.game.ctx.fillRect(this.x, this.y, this.width, this.height)
        }

        if (this.imageCache) {
            this.scene.game.ctx.save()
            if (this.image.flipX) {
                this.scene.game.ctx.translate((this.x * 2) + this.width, 0)
                this.scene.game.ctx.scale(-1, 1)
            }
            if (this.image.flipY) {
                this.scene.game.ctx.translate(0, (this.y * 2) + this.height)
                this.scene.game.ctx.scale(1, -1)
            }
            if (this.image.pattern) {
                if (!this.imagePattern) this.imagePattern = this.scene.game.ctx.createPattern(this.imageCache, "repeat");
                this.scene.game.ctx.fillStyle = this.imagePattern;
                this.scene.game.ctx.fillRect(this.x + this.image.x, this.y + this.image.y, this.width + this.image.width, this.height + this.image.height);
            } else {
                this.scene.game.ctx.drawImage(this.imageCache, this.x + this.image.x, this.y + this.image.y, this.width + this.image.width, this.height + this.image.height)
            }
            this.scene.game.ctx.restore()
        } else if (this.image.src && this.image.src != '') {
            this.loadImageCache()
        }

        if (this.text && this.text.value != undefined && this.text.value != '') {
            if (this.text.color != 'transparent' && this.text.color != null && this.text.color != false) {
                this.scene.game.ctx.font = `${this.text.bold ? 'bold ' : ''}${this.text.italic ? 'italic ' : ''}${this.text.fontSize}px ${this.text.font}`;
                this.scene.game.ctx.fillStyle = this.text.color;
                this.scene.game.ctx.fillText(this.text.value, this.x + this.text.x + this.text.offsetX, this.y + this.text.y + this.text.fontSize + this.text.offsetY);
                this.text.width = this.scene.game.ctx.measureText(this.text.value).width

                if (this.text.stroke && this.text.strokeColor != 'transparent' && this.text.strokeColor != null && this.text.strokeColor != false) {
                    this.scene.game.ctx.strokeStyle = this.text.strokeColor;
                    this.scene.game.ctx.lineWidth = this.text.lineWidth;
                    this.scene.game.ctx.strokeText(this.text.value, this.x + this.text.x, this.y + this.text.y + this.text.fontSize);
                }
            }
        }
    }

    setImageSource(src) {
        this.imageCache = null
        this.image.src = src
        this.loadImageCache()
    }

    addTag(tag) {
        this.tags.push(tag)    }

    removeTag(tag) {
        this.tags.splice(this.tags.indexOf(tag), 1)
    }

    hasTag(tag) {
        return this.tag.includes(tag)
    }

    getTags() {
        return this.tags
    }

    setZ(z) {
        this.z = z
        this.scene.sort_game_objects_by_z()
    }

    setSize(width, height) {
        this.width = width
        this.height = height
    }

    setVisible(visible = true) {
        this.visible = visible
    }

    setInvisible() {
        this.visible = false
    }

    setActive(active = true) {
        this.active = active
    }

    setInactive() {
        this.active = false
    }

    isVisible() {
        return (
            (this.x + this.width) > (this.scene.game.camera.x - this.scene.game.width/2) &&
            (this.x) < (this.scene.game.camera.x + this.scene.game.width/2) &&
            (this.y + this.height) > (this.scene.game.camera.y - this.scene.game.height/2) &&
            (this.y) < (this.scene.game.camera.y + this.scene.game.height/2)
        )
    }

    calcTextWidth() {
        if (!this.text && this.text.value == undefined && this.text.value == '') {
            this.text.width = 0
            return
        }

        this.scene.game.ctx.font = `${this.text.bold ? 'bold ' : ''}${this.text.italic ? 'italic ' : ''}${this.text.fontSize}px ${this.text.font}`
        this.text.width = this.scene.game.ctx.measureText(this.text.value).width
    }
}

const defaultCameraProps = {
    game: null,
    x: 0,
    y: 0,
    delay: 1,
    zoom: 1.0,
    minZoom: 0.1,
    maxZoom: 3.0
}

class Camera {
    constructor(props) {
        props = {
            ...defaultCameraProps,
            ...props
        }

        Object.entries(props).forEach(([key, value]) => {
            this[key] = value
        })
    }

    setTarget(target, delay = null) {
        if (!delay) {
            delay = this.delay
        }

        this.x += ((target.x + target.width/2) - this.x) / delay
        this.y += ((target.y + target.height/2) - this.y) / delay
    }

    setPosition(x, y) {
        this.x = x
        this.y = y
    }

    setZoom(zoom) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom))
    }
}

const defaultSceneProps = {
    game: null,
    name: null,
    ignorePause: false,
    gameObjects: {},
    tileMaps: {},
}

const defaultSceneTileMapProps = {
    x: 0,
    y: 0,
    size: 25,
    tiles: {},
    map: []
}

class Scene {
    constructor(props) {
        props = {
            ...defaultSceneProps,
            ...props
        }

        Object.entries(props).forEach(([key, value]) => {
            this[key] = value
        })

        this.gameObjectsProps = props.gameObjects
        this.gameObjects = {}
        Object.entries(props.gameObjects).forEach(([name, gameObject]) => {
            this.addGameObject(name, gameObject)
        })

        Object.entries(props.tileMaps).forEach(([name, tileMap]) => {
            props.tileMaps[name] = {
                ...defaultSceneTileMapProps,
                ...tileMap
            }
        })

        Object.entries(props.tileMaps).forEach(([name, tileMap]) => {
            this.addTileMap(name, tileMap)
        })

        this.tileMapsProps = props.tileMaps
        this.tileMaps = []
        Object.entries(props.tileMaps).forEach(([name, tileMap]) => {
            this.addTileMap(name, tileMap)
        })

    }

    sortGameObjectsByZ() {
        const sortedGameObjects = Object.values(this.gameObjects).sort((a, b) => {
            if (a.z < b.z) return -1
            if (a.z > b.z) return 1
            return 0
        })

        const indexedSortedGameObjects = sortedGameObjects.reduce((obj, gameObject) => {
            obj[gameObject.name] = gameObject;
            return obj;
        }, {});

        this.gameObjects = indexedSortedGameObjects
    }

    addTileMap(name, tileMap) {
        const gameObjects = []

        tileMap.map.forEach((row, y) => {
            row.forEach((_, x) => {
                const tile = tileMap.tiles[tileMap.map[y][x]]

                if (tile) {
                    const gameObject = this.instantGameObject({
                        ...tile,
                        x: tileMap.x + x * tileMap.size,
                        y: tileMap.y + y * tileMap.size,
                        width: tileMap.size,
                        height: tileMap.size,
                        tileMap: name
                    })

                    gameObjects.push(gameObject)
                }

            })
        })

        return gameObjects
    }

    instantTileMap(tileMap) {
        return this.addTileMap(crypto.randomUUID(), tileMap)
    }

    addGameObject(name , gameObject) {
        const newGameObject = new GameObject({
            ...gameObject,
            name: name,
            scene: this
        })

        Object.entries(gameObject).forEach(([key, value]) => {
            if (!(key in newGameObject)) newGameObject[key] = value
        })

        this.gameObjects[name] = newGameObject

        if (newGameObject['onLoad'] && typeof newGameObject['onLoad'] === 'function') newGameObject.onLoad(newGameObject)

        this.sortGameObjectsByZ()

        return newGameObject
    }

    instantGameObject(gameObject) {
        return this.addGameObject(crypto.randomUUID(), gameObject)
    }

    getGameObjectByName(name) {
        return this.gameObjects[name]
    }

    getGameObjectByID(id) {
        return Object.values(this.gameObjects).find(gameObject => gameObject.id === id)
    }

    getGameObjectsByTag(tag) {
        return Object.values(this.gameObjects).filter(gameObject => gameObject.tags.includes(tag))
    }

    getGameObjectByPosition(x, y) {
        return Object.values(this.gameObjects).find(gameObject => gameObject.x === x && gameObject.y === y)
    }

    getGameObjectsByPosition(x, y) {
        return Object.values(this.gameObjects).filter(gameObject => gameObject.x === x && gameObject.y === y)
    }

    getGameObjects(){
        return this.gameObjects
    }

    removeGameObjectByName(name) {
        delete this.gameObjects[name]
    }

    removeGameObjectByID(id) {
        delete this.removeGameObjectByName(this.getGameObjectByID(id).name)
    }
}

const defaultGameProps = {
    width: 500,
    height: 500,
    canvas: null,
    id: 'game',
    class: '',
    title: 'Title',
    backgroundColor: '#fff',
    cursor: true,
    cursorStyle: 'default',
    fps: 60,
    limitFPS: false,
    events: ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseenter', 'mouseleave', 'mouseout', 'mouseover', 'change', 'focus', 'blur', 'select', 'keydown', 'keyup'],
    imageSmoothingEnabled: true,
    contextMenu: false,
    running: false,
    fullScreen: false,
    scenes: {
        main: {...defaultSceneProps}
    },
    activeScene: 'main',
    camera: {...defaultCameraProps}
}

class Game {
    constructor(props) {
        props = {
            ...defaultGameProps,
            ...props
        }

        Object.entries(props).forEach(([key, value]) => {
            this[key] = value
        })

        this.camera = new Camera({
            ...props.camera,
            game: this,
            x: this.width/2,
            y: this.height/2
        })

        this.cv = props.canvas
        if(!this.cv) {
            this.cv = document.createElement("canvas")
            this.cv.setAttribute('id', props.id);
            this.cv.setAttribute('class', props.class);
        }
        this.ctx = this.cv.getContext("2d");

        this.ctx.imageSmoothingEnabled = props.imageSmoothingEnabled;

        if(!document.body.contains(this.cv)) document.body.appendChild(this.cv)

        this.setTitle(props.title)
        this.setSize(props.width, props.height)
        this.setBackgroundColor(props.backgroundColor)
        this.setCursorStyle(props.cursorStyle)
        this.setCursorVisibility(props.cursor)

        this.fullScreen = props.fullScreen
        if (this.fullScreen === true) this.setFullscreen(this.fullScreen)

        this.mousePosition = {x: 0, y: 0}
        this.mouseFixedPosition = {x: 0, y: 0}

        window.addEventListener('mousemove', event => {
            this.mousePosition = this.getMousePosition(event)
            this.mouseFixedPosition = this.getMouseFixedPosition(event)

            const activeScene = this.getActiveScene()
            const gameObjects = activeScene.getGameObjects()

            Object.values(gameObjects).forEach((gameObject) => {
                const inside = isInside({x: this.mousePosition.x, y: this.mousePosition.y, width: gameObject.width, height: gameObject.height}, gameObject)

                if (inside) {
                    if (gameObject.mouseOver == false) {
                        gameObject.mouseOver = true
                        if (gameObject.onCurrentMouseEnter && typeof gameObject.onCurrentMouseEnter === 'function') gameObject.onCurrentMouseEnter({event, current: gameObject})
                    }
                } else if (gameObject.mouseOver == true) {
                    gameObject.mouseOver = false
                    if (gameObject.onCurrentMouseLeave && typeof gameObject.onCurrentMouseLeave === 'function') gameObject.onCurrentMouseLeave({event, current: gameObject})
                }
            })
        })

        window.addEventListener('click', event => {
            this.mousePosition = this.getMousePosition(event)
            this.mouseFixedPosition = this.getMouseFixedPosition(event)

            const activeScene = this.getActiveScene()
            const gameObjects = activeScene.getGameObjects()

            Object.values(gameObjects).forEach((gameObject) => {
                if (gameObject.onCurrentClick && typeof gameObject.onCurrentClick === 'function'&& isInside({x: this.mousePosition.x, y: this.mousePosition.y, width: 1, height: 1}, gameObject)) gameObject.onCurrentClick({event, current: gameObject})
            })
        })

        window.addEventListener('mousedown', event => {
            this.mousePosition = this.getMousePosition(event)
            this.mouseFixedPosition = this.getMouseFixedPosition(event)

            const activeScene = this.getActiveScene()
            const gameObjects = activeScene.getGameObjects()

            Object.values(gameObjects).forEach((gameObject) => {
                if (gameObject.onCurrentMousedown && typeof gameObject.onCurrentMousedown === 'function' && isInside({x: this.mousePosition.x, y: this.mousePosition.y, width: 1, height: 1}, gameObject)) gameObject.onCurrentMousedown({event, current: gameObject})
            })
        })

        window.addEventListener('mouseup', event => {
            this.mousePosition = this.getMousePosition(event)
            this.mouseFixedPosition = this.getMouseFixedPosition(event)

            const activeScene = this.getActiveScene()
            const gameObjects = activeScene.getGameObjects()

            Object.values(gameObjects).forEach((gameObject) => {
                if (gameObject.onCurrentMouseup && typeof gameObject.onCurrentMouseup === 'function' && isInside({x: this.mousePosition.x, y: this.mousePosition.y, width: 1, height: 1}, gameObject)) gameObject.onCurrentMouseup({event, current: gameObject})
            })
        })

        this.events = props.events
        this.events.forEach(eventName => {
            window.addEventListener(eventName, event => {
                const methodEventName = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1).toLowerCase()}`

                if (this[methodEventName] && typeof this[methodEventName] === 'function') this[methodEventName]({event, current: this})

                const activeScene = this.getActiveScene()
                if (activeScene && activeScene[methodEventName] && typeof activeScene[methodEventName] === 'function') activeScene[methodEventName]({event, current: activeScene})

                const gameObjects = activeScene.getGameObjects()
                Object.values(gameObjects).forEach((gameObject) => {
                    if (gameObject[methodEventName] && typeof gameObject[methodEventName] === 'function') gameObject[methodEventName]({event, current: gameObject})
                })
            })
        })

        this.fps = props.fps

        this.contextMenu = props.contextMenu
        if (!this.contextMenu) this.cv.addEventListener('contextmenu', this.disableContextMenu)

        this.pause = false
        this.running = props.running

        this.activeScene = props.activeScene
        this.scenesProps = props.scenes
        this.scenes = {}

        Object.entries(props.scenes).forEach(([name, scene]) => {
            this.addScene(name, scene)
        })

        if (this['onLoad'] && typeof this['onLoad'] === 'function') this.onLoad(this)
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    run() {
        this.lastTick = Date.now()
        this.deltaTime = 0
        this.currentFPS = 0;
        this.minFrameTime = 1000 / this.fps;

        this.ctx.imageSmoothingEnabled = this.imageSmoothingEnabled

        const update = () => {
            const now = Date.now();
            this.deltaTime = (now - this.lastTick) / 1000;
            this.currentFPS = 1000 / (now - this.lastTick)
            this.lastTick = now

            this.ctx.save()
            this.clear()

            this.ctx.translate(this.width/2, this.height/2)
            this.ctx.scale(this.camera.zoom, this.camera.zoom);
            this.ctx.translate(-(this.camera.x), -(this.camera.y))

            if (this.onUpdate && typeof this.onUpdate === 'function' && !this.pause) this.onUpdate(this)
            if (this.onRender && typeof this.onRender === 'function') this.onRender(this)

            const activeScene = this.getActiveScene()
            if (activeScene.onUpdate && typeof activeScene.onUpdate === 'function' && !this.pause) activeScene.onUpdate(activeScene)
            if (activeScene.onRender && typeof activeScene.onRender === 'function') activeScene.onRender(activeScene)

            const gameObjects = activeScene.getGameObjects()
            Object.values(gameObjects).forEach((gameObject) => {
                if (gameObject.onUpdate && typeof gameObject.onUpdate === 'function' && !this.pause && gameObject.active) gameObject.onUpdate(gameObject)
                if (gameObject.onRender && typeof gameObject.onRender === 'function' && gameObject.active && gameObject.visible) gameObject.onRender(gameObject)
                if (gameObject.render && typeof gameObject.render === 'function' && gameObject.active && gameObject.visible) gameObject.render()

                Object.values(gameObjects).forEach((checkGameObject) => {
                    if (gameObject.id !== checkGameObject.id) {
                        if (gameObject.onCollide && typeof gameObject.onCollide === 'function' && isCollide(gameObject, checkGameObject)) {
                            gameObject.onCollide({current: gameObject, target: checkGameObject})
                        }

                        if (gameObject.onPositionMatch && typeof gameObject.onPositionMatch === 'function' && positionsMatch(gameObject, checkGameObject)) {
                            gameObject.onPositionMatch({current: gameObject, target: checkGameObject})
                        }

                        if (gameObject.onInside && typeof gameObject.onInside === 'function' && isInside(gameObject, checkGameObject)) {
                            gameObject.onInside({current: gameObject, target: checkGameObject})
                        }
                    }
                })
            })

            this.ctx.restore()

            if (!this.limitFPS) return requestAnimationFrame(update);

            const elapsedTime = now - this.lastTick;

            const nextTick = Math.max(this.minFrameTime - elapsedTime, 0);

            setTimeout(() => {
                requestAnimationFrame(update);
            }, nextTick);
        }

        requestAnimationFrame(update);
    }

    stop() {
        clearInterval(this.updateInterval)
    }

    addScene(name, scene) {
        const sceneProps = {
            ...scene,
            name: name,
            game: this
        }

        const newScene = new Scene(sceneProps)

        this.scenes[name] = newScene

        if (newScene['onLoad'] && typeof newScene['onLoad'] === 'function') newScene.onLoad(newScene)

        return newScene
    }

    changeScene(name) {
        this.activeScene = name
    }

    setScene(name, scene) {
        this.addScene(name, scene)
        this.changeScene(name)
    }

    getActiveScene() {
        return this.scenes[this.activeScene]
    }

    removeScene(name) {
        delete this.scenes[name]
    }

    resetScene() {
        this.setScene(this.activeScene, this.scenesProps[this.activeScene])
    }

    setPause(pause) {
        this.pause = pause

        if (this.pause) {
            this.customEvent('pause')
        } else {
            this.customEvent('resume')
        }
    }

    togglePause() {
        this.setPause(!this.pause)
    }

    setTitle(title) {
        this.title = title
        document.title = this.title
    }

    setWidth(width) {
        this.width = width
        this.cv.width = width
        this.cv.style.width = `${width}px`
        this.ctx.canvas.width = width
        this.ctx.width = width
    }

    setHeight(height) {
        this.height = height
        this.cv.height = height
        this.cv.style.height = `${height}px`
        this.ctx.canvas.height = height
        this.ctx.height = height
    }

    setSize(width, height){
        this.setWidth(width)
        this.setHeight(height)
    }

    setBackgroundColor(backgroundColor){
        this.backgroundColor = backgroundColor
        this.cv.style.backgroundColor = backgroundColor
    }

    setCursorStyle(cursor = "default") {
        this.cursorStyle = cursor
        this.cv.style.cursor = cursor
    }

    setCursorVisibility(cursor = true) {
        this.cursor = cursor
        cursor ? this.cv.style.cursor = 'default' : this.cv.style.cursor = 'none'
    }

    toggleCursorVisibility() {
        this.setCursorVisibility(!this.cursor)
    }

    hideCursor() {
        this.setCursorVisibility(false)
    }

    showCursor() {
        this.setCursorVisibility(true)
    }

    disableContextMenu(event) {
        event.preventDefault()
    }

    enableContextMenu() {
        this.contextMenu = true
        this.cv.removeEventListener('contextmenu', this.disableContextMenu)
    }

    screenshot() {
        return this.cv.toDataURL('image/png')
    }

    downloadScreenshot(){
        const a = document.createElement("a")
        a.href = this.screenshot()
        a.download = `${document.title} - screenshot.png`;
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    setFPS(fps) {
        clearInterval(this.updateInterval)
        this.fps = fps
        this.updateListener()
    }

    getMousePosition(event) {
        const rect = this.cv.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) - (-this.camera.x + this.width/2),
            y: (event.clientY - rect.top) - (-this.camera.y + this.height/2)
        }
    }

    getMouseFixedPosition(event) {
        const rect = this.cv.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * this.cv.width,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * this.cv.height
        };
    }

    async setFullscreen(fullscreen = true){
        this.fullScreen = fullscreen
        if (fullscreen){
            try {
                if (this.cv.requestFullscreen) {
                    await this.cv.requestFullscreen()
                } else if (this.cv.webkitRequestFullscreen) {
                    await this.cv.webkitRequestFullscreen()
                } else if (this.cv.msRequestFullscreen) {
                    await this.cv.msRequestFullscreen()
                }
            } catch (error) {}
        }else{
            try {
                await document.exitFullscreen()
            } catch (error) {}
        }
    }

    toggleFullscreen() {
        this.setFullscreen(!this.fullScreen)
    }

    customEvent(eventName) {
        const eventMethodName = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1).toLowerCase()}`

        if (this[eventMethodName] && typeof this[eventMethodName] === 'function') this[eventMethodName](this)

        const activeScene = this.getActiveScene()
        if (activeScene[eventMethodName] && typeof activeScene[eventMethodName] === 'function') activeScene[eventMethodName](activeScene)

        const gameObjects = activeScene.getGameObjects()
        Object.values(gameObjects).forEach(gameObject => {
            if (gameObject[eventMethodName] && typeof gameObject[eventMethodName] === 'function') gameObject[eventMethodName](gameObject)
        })
    }
}