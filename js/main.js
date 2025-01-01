const TITLE = 'Sudoku - Pyxes'
const GRID_SIZE = 50
const FPS = 30
const BG_COLOR = '#fff'

const FONT = 'monospace'
const FONT_COLOR = '#000'

const DIFFICULTIES = {
    NOVICE: 0.9,
    EASY: 0.7,
    NORMAL: 0.5,
    HARD: 0.3,
    EXPERT: 0.2,
}
let DIFFICULTY = DIFFICULTIES.NORMAL

const CELL_COLOR = '#fff'
const REVELATED_CELL_COLOR = '#e5e5e5'
const SELECTED_CELL_COLOR = '#4ade80'
const SELECTED_REVELATED_CELL_COLOR = '#38bdf8'
const SELECTED_INFO_CELL_COLOR = '#67e8f9'

const playerBoard = Array(9).fill().map(() => Array(9).fill(0))
const board = Array(9).fill().map(() => Array(9).fill(0))

function isValid(board, row, col, num) {
    // Verifica fila
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }

    // Verifica columna
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }

    // Verifica subcuadro 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }

    return true;
}

function fillBoard(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Mezcla los números
                for (let num of numbers) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) {
                            return true; // Avanza si es posible completar el tablero
                        }
                        board[row][col] = 0; // Retrocede si no es posible
                    }
                }
                return false; // No es posible llenar esta celda
            }
        }
    }
    return true;
}

function genBoard() {
    fillBoard(board);
}

function areBoardsIdentical(board1, board2) {
    if (board1.length !== 9 || board2.length !== 9) return false;

    for (let i = 0; i < 9; i++) {
        if (board1[i].length !== 9 || board2[i].length !== 9) return false;
        for (let j = 0; j < 9; j++) {
            if (board1[i][j] !== board2[i][j]) return false;
        }
    }

    return true;
}

const Cell = {
    color: CELL_COLOR,
    visible: false,
    tags: ['cell'],
    width: GRID_SIZE,
    height: GRID_SIZE,
    text: {
        value: '0',
        color: FONT_COLOR,
        fontSize: GRID_SIZE/2,
        font: FONT,
        offsetX: GRID_SIZE/3,
        offsetY: GRID_SIZE/6,
    },

    value: 0,
    revelated: false,
    selected: false,
    info: false,
    setted: false,

    onCurrentClick: ({current}) => {
        current.select(current)
    },

    setRevelated: current => {
        playerBoard[Math.floor(current.y/GRID_SIZE)][Math.floor(current.x/GRID_SIZE)] = board[Math.floor(current.y/GRID_SIZE)][Math.floor(current.x/GRID_SIZE)]
        current.revelated = true
        current.visible = true
        current.color = REVELATED_CELL_COLOR
    },

    selectInfo: current => {
        current.info = true

        if (current.revelated) {
            current.color = SELECTED_REVELATED_CELL_COLOR
            return
        }

        if (current.selected) {
            current.color = SELECTED_CELL_COLOR
            return
        }

        current.color = SELECTED_INFO_CELL_COLOR
    },

    unselectInfo: current => {
        current.info = false

        if (current.revelated) {
            current.color = REVELATED_CELL_COLOR
            return
        }

        if (current.selected) {
            current.color = SELECTED_CELL_COLOR
            return
        }

        current.color = CELL_COLOR
    },

    select: current => {
        if (current.info && !current.selected) {
            current.scene.hideInfo(current.scene)
            current.scene.selectedCell.unselect(current.scene.selectedCell)

            if (current.revelated) return
        }

        current.scene.hideInfo(current.scene)

        if (current == current.scene.selectedCell) {
            current.unselect(current)
            return
        }

        if (current.scene.selectedCell) current.scene.selectedCell.unselect(current.scene.selectedCell)

        current.selected = true
        current.scene.selectedCell = current

        if (current.revelated || current.setted) {
            current.scene.showInfo(current.scene)
            return
        }

        current.color = SELECTED_CELL_COLOR

        current.text.value = ''
        current.visible = true
    },

    unselect: current => {
        current.selected = false
        current.scene.selectedCell = null

        if (current.revelated) {
            current.color = REVELATED_CELL_COLOR
            return
        }

        current.color = CELL_COLOR

        if (current.setted) return

        current.text.value = current.value.toString()
        current.visible = false
    },

    setValue: (current, value) => {
        current.setted = true
        current.value = value
        current.text.value = value.toString()

        playerBoard[Math.floor(current.y/GRID_SIZE)][Math.floor(current.x/GRID_SIZE)] = value
    },

    clear: current => {
        current.setted = false
        current.value = 0
        current.text.value = ''

        playerBoard[Math.floor(current.y/GRID_SIZE)][Math.floor(current.x/GRID_SIZE)] = 0
    }
}

const Board = {
    color: 'transparent',
    z: 100,

    onRender: current => {
        current.scene.game.ctx.lineWidth = 1

        for (let i = 0; i <= 9; i++) {
            current.scene.game.ctx.strokeStyle = '#bbb'

            current.scene.game.ctx.beginPath()
            current.scene.game.ctx.moveTo(GRID_SIZE * i, 0)
            current.scene.game.ctx.lineTo(GRID_SIZE * i, current.scene.game.height)
            current.scene.game.ctx.stroke()
            current.scene.game.ctx.beginPath()
            current.scene.game.ctx.moveTo(0, GRID_SIZE * i)
            current.scene.game.ctx.lineTo(current.scene.game.width, GRID_SIZE * i)
            current.scene.game.ctx.stroke()

            if (i % 3 == 0) {
                current.scene.game.ctx.strokeStyle = '#000'

                current.scene.game.ctx.beginPath()
                current.scene.game.ctx.moveTo(GRID_SIZE * i, 0)
                current.scene.game.ctx.lineTo(GRID_SIZE * i, current.scene.game.height)
                current.scene.game.ctx.stroke()
                current.scene.game.ctx.beginPath()
                current.scene.game.ctx.moveTo(0, GRID_SIZE * i)
                current.scene.game.ctx.lineTo(current.scene.game.width, GRID_SIZE * i)
                current.scene.game.ctx.stroke()
            }
        }
    },
}

const MainScene = {
    gameObjects: {
        board: Board,
    },

    selectedfCell: null,
    cells: null,

    onLoad: current => {
        genBoard()

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = current.instantGameObject(Cell)

                if (Math.random() < DIFFICULTY) cell.setRevelated(cell)

                cell.text.value = board[row][col].toString()
                cell.value = board[row][col]
                cell.x = (col * GRID_SIZE)
                cell.y = (row * GRID_SIZE)
            }
        }

        current.cells = current.getGameObjectsByTag('cell')
    },

    onKeydown: ({event, current}) => {
        if (!current.selectedCell) return

        if (current.selectedCell.revelated) return

        let key = event.key

        if (!isNumeric(key)) return

        key = parseInt(key)

        if (key === 0) {
            current.selectedCell.clear(current.selectedCell)
            current.hideInfo(current)
            return
        }

        current.selectedCell.setValue(current.selectedCell, key)

        current.showInfo(current)

        if (areBoardsIdentical(playerBoard, board)) current.win(current)
    },

    showInfo: current => {
        if (!current.selectedCell) return

        current.hideInfo(current)

        current.cells.forEach(cell => {
            if (cell.value == current.selectedCell.value) cell.selectInfo(cell)
        })
    },

    hideInfo: current => {
        current.cells.forEach(cell => {
            if (cell.info) cell.unselectInfo(cell)
        })
    },

    win: current => {
        alert('¡Congratulations! You won!')
    },
}

const game = new Game({
    backgroundColor: BG_COLOR,
    fps: FPS,
    limitFPS: true,
    title: TITLE,

    width: GRID_SIZE * 9,
    height: GRID_SIZE * 9,

    scenes: {
        main: MainScene
    },

    onKeydown: ({event, current}) => {
        if (event.key == 'r') current.resetScene()
        else if (event.key == 'f') current.toggleFullscreen()
    },
})

game.run()