import {
	_decorator,
	Component,
	Input,
	Label,
	Node,
	Rect,
	tween,
	UITransform,
	Vec3,
} from "cc"
const { ccclass, property } = _decorator

const MAX = 80 // width or height

@ccclass("Item")
export class Item extends Component {
	count: number = 1
	data: any = null

	start() {
		// this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
		// this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
		// // this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
	}

	init(data) {
		this.data = data
		this.hideCount()
		this.changeSize()
	}

	changeSize(max = 80) {
		// find the small one in width or height
		const uiTransform = this.node.getComponent(UITransform)
		const { width, height } = uiTransform
		const min = Math.min(width, height)
		const k = MAX / min

		uiTransform.width = width * k
		uiTransform.height = height * k
	}

	showCount() {
		if (this.count < 2) return
		this.node.getChildByName("count").active = true
		this.node
			.getChildByName("count")
			.getChildByName("num")
			.getComponent(Label).string = this.count + ""
	}
	hideCount() {
		this.node.getChildByName("count").active = false
	}

	getBoundingBox(): Rect {
		return this.node.getComponent(UITransform).getBoundingBox()
	}

	// ? why only called on the first time ?
	onTouchStart(e) {
		console.log("on touch start")
		// this.playScale(true)
		this.node.setScale(new Vec3(1.2, 1.2))
	}

	onTouchEnd(e) {
		console.log("on touch end")
		// this.playScale()
		this.node.setScale(new Vec3(1, 1))
	}

	onTouchCancel(e) {
		console.log("on touch cancel")
		// this.playScale()
	}

	/**
	 * animation
	 */
	playScale(needExpanding?: boolean) {
		tween(this.node)
			.to(0.1, { scale: needExpanding ? new Vec3(1.2, 1.2) : new Vec3(1, 1) })
			.start()
	}
}
