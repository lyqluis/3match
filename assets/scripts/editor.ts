import {
	_decorator,
	Color,
	Component,
	EditBox,
	EventTouch,
	instantiate,
	Label,
	Node,
	Prefab,
	Size,
	UITransform,
	Vec3,
} from "cc"
import { EDITOR_MODES, Config } from "./state"
import { EventDispatcher } from "./EventDispatcher"
import { MatchLayout } from "./MatchLayout"
const { ccclass, property } = _decorator

@ccclass("editor")
export class Editor extends Component {
	@property({ type: Label })
	modeValue: Label = null
	@property({ type: Label })
	blockCount: Label = null
	@property({ type: Label })
	postion: Label = null
	@property({ type: Label })
	message: Label = null
	@property({ type: EditBox })
	inputGridX: EditBox = null
	@property({ type: EditBox })
	inputGridY: EditBox = null
	@property({ type: EditBox })
	inputData: EditBox = null

	@property({ type: MatchLayout })
	matchLayout: MatchLayout = null

	// ?? what does start() do?
	start() {
		this.getMode()
		EventDispatcher.getTarget().on(
			EventDispatcher.UPDATE_BLOCK_COUNT,
			this.updateBlockCount,
			this
		)
	}

	update(deltaTime: number) {}

	private getMode(mode?: number) {
		this.modeValue.string = EDITOR_MODES[Config.editorMode]
	}

	private updateBlockCount() {
		// set count
		const count = this.matchLayout.getChildren().length
		this.blockCount.string = count + ""
		// set color
		let color = new Color(255, 0, 0) // 默认为红色
		if (count % 3 === 0) {
			color = new Color(255, 255, 255) // 被 3 整除为白色
		}
		this.blockCount.color = color
	}

	private successMsg(msg) {
		this.message.string = msg
		this.message.color = new Color(0, 255, 0)
	}
	private errorMsg(msg) {
		this.message.string = msg
		this.message.color = new Color(255, 0, 0)
	}

	// click
	changeMode(e: EventTouch, mode: string) {
		Config.editorMode = Number(mode)
		this.getMode()
	}
	import(e: EventTouch) {
		const dataString = this.inputData.string.trim()
		// invalid data
		if (dataString.length < 5) {
			this.errorMsg("Wrong data")
			return
		}
		this.successMsg("Import successfully!")
		// clear current blocks
		this.matchLayout.removeAllBlocks()
		// pre process data to add quotes to keys
		const formatedDataString = this.formateJSONString(dataString)
		const data = JSON.parse(formatedDataString)
		// add blocks by data
		data.map((pos) => {
			this.matchLayout.addBlockByLocalPosition(new Vec3(pos.x, pos.y))
		})
		// update shadow
		this.matchLayout.refreshShadow()
		// update block count
		EventDispatcher.getTarget().emit(EventDispatcher.UPDATE_BLOCK_COUNT)
		EventDispatcher.getTarget().emit(
			EventDispatcher.SHOW_NOTIFICATION,
			"Created blocks successfully!"
		)
	}
	export() {
		// get all blocks in MatchLayout
		const children = this.matchLayout.getChildren()
		// 只有 3 的倍数才能导出
		if (!children.length) {
			this.inputData.string = "[]"
			this.errorMsg("Can't export! There are no blocks")
		} else if (children.length % 3 !== 0) {
			this.inputData.string = "[]"
			this.errorMsg("Can't export! Blocks count is not a multiple of 3")
		} else {
			const childrenPostions = children.map((child) => {
				const pos = child.getPosition()
				return { x: Math.ceil(pos.x), y: Math.ceil(pos.y) }
			})
			const data = JSON.stringify(childrenPostions)
			this.inputData.string = data
			this.successMsg("Export successfully!")
		}
	}
	clearAllBlocks() {
		this.matchLayout.removeAllBlocks()
		this.updateBlockCount()
		EventDispatcher.getTarget().emit(
			EventDispatcher.SHOW_NOTIFICATION,
			"All blocks cleared"
		)
	}

	private formateJSONString(string: string): string {
		string = string.replace(/(\w+):/g, '"$1":') // add quotes to keys
		string = string.replace(/,(?=\n*\t*\])/g, "") // remove last comma
		return string
	}
}
