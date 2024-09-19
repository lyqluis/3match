import {
	_decorator,
	Component,
	EventTouch,
	Input,
	instantiate,
	Node,
	Prefab,
	Size,
	UITransform,
	Vec2,
	Vec3,
} from "cc"
import { Config } from "./state"
import { MatchLayout } from "./MatchLayout"
import { EventDispatcher } from "./EventDispatcher"
const { ccclass, property } = _decorator

@ccclass("editorLayout")
export class EditorLayout extends Component {
	@property({ type: Prefab })
	grid: Prefab = null
	@property({ type: MatchLayout })
	matchLayout: MatchLayout = null

	// current grid while generating blocks in case duplicate blocks on the same grid
	currentGrid: Node = null
	width: number = null
	height: number = null
	blockWidth: number = null
	blockHeight: number = null

	protected onLoad(): void {
		this.blockWidth = Config.blockWidth
		this.blockHeight = Config.blockHeight
		// set same world position with match lyaout node
		const position = this.matchLayout.node.getWorldPosition()
		this.node.setWorldPosition(position)
		// set same size with match layout node
		const { width, height } = this.matchLayout.node.getComponent(UITransform)
		this.node.getComponent(UITransform).setContentSize(width, height)
		this.width = width
		this.height = height
	}

	start() {}

	update(deltaTime: number) {}

	startEditor() {
		this.initGrid()
		this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
		this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
	}

	private initGrid() {
		this.node.destroyAllChildren()

		// auto calculate row, col number, offsetX, offsetY instead of config
		const offset = 5
		const rowGridN =
			Math.floor((this.width - offset * 2) / (this.blockWidth / 2)) - 1
		const colGridN =
			Math.floor((this.height - offset * 2) / (this.blockHeight / 2)) - 1
		const offsetX = (this.width - (rowGridN + 1) * (this.blockWidth / 2)) / 2
		const offsetY = (this.height - (colGridN + 1) * (this.blockHeight / 2)) / 2

		const initX = (this.width / 2) * -1 + offsetX
		const initY = this.height / 2 - offsetY

		console.log(
			"init grid",
			this.width,
			this.height,
			rowGridN,
			colGridN,
			initX,
			initY,
			offsetX,
			offsetY
		)

		for (let i = 0; i < rowGridN; i++) {
			// get prefab block's width / 2 and height / 2
			const x = initX + (this.blockWidth / 2) * (i + 1)
			for (let j = 0; j < colGridN; j++) {
				const y = initY + (this.blockHeight / 2) * (j + 1) * -1
				this.addGrid(x, y)
			}
		}
	}
	private addGrid(x: number, y: number, size?: Size) {
		const grid = instantiate(this.grid)
		grid.setPosition(x, y)
		grid.setParent(this.node)
		if (size) {
			grid.getComponent(UITransform).setContentSize(size)
		}
		this.node.addChild(grid)
	}

	private onTouchMove(e: EventTouch) {
		// get current touch position
		const touch = e.getUILocation()
		// convert touch position to position in node space
		const position = this.node
			.getComponent(UITransform)
			.convertToNodeSpaceAR(new Vec3(touch.x, touch.y))
		switch (Config.editorMode) {
			case 1: // add block
				this.addBlockByTouchPosition(position)
				break
			case 2: // delete block
				this.removeBlockByTouchPosition(touch)
				break
		}
	}
	private onTouchEnd(e: EventTouch) {
		// get current touch position
		const touch = e.getUILocation()
		// convert touch position to position in node space
		const position = this.node
			.getComponent(UITransform)
			.convertToNodeSpaceAR(new Vec3(touch.x, touch.y))
		switch (Config.editorMode) {
			case 1: // add block
				this.addBlockByTouchPosition(position)
				break
			case 2: // delete block
				this.removeBlockByTouchPosition(touch)
				break
		}
	}

	private addBlockByTouchPosition(position) {
		// 遍历当前节点的所有子节点 (grid)，找到与触摸位置最近的子节点 (grid)
		for (let i = 0; i < this.node.children.length; i++) {
			const grid = this.node.children[i]
			// current position is within last position 's grid's bounding box
			if (this.currentGrid === grid) continue
			const isWithinPos = grid
				.getComponent(UITransform)
				.getBoundingBox()
				.contains(new Vec2(position.x, position.y))
			if (isWithinPos) {
				// instantiate a block in main layer node, not in this editor layer node
				this.matchLayout.addBlockByWorldPosition(grid.getWorldPosition())
				this.matchLayout.refreshShadow()
				this.currentGrid = grid
				break
			}
		}
		EventDispatcher.getTarget().emit(EventDispatcher.UPDATE_BLOCK_COUNT)
	}
	private removeBlockByTouchPosition(touch) {
		this.matchLayout.removeBlockByWorldPosition(new Vec3(touch.x, touch.y))
		this.matchLayout.refreshShadow()
		EventDispatcher.getTarget().emit(EventDispatcher.UPDATE_BLOCK_COUNT)
	}
}
