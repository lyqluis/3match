import {
	_decorator,
	Component,
	Input,
	instantiate,
	Label,
	Node,
	Prefab,
	Rect,
	resources,
	Sprite,
	SpriteFrame,
	tween,
	UITransform,
	Vec3,
} from "cc"
import { loadImage, loadPrefab, setParentInPosition } from "./utils"
const { ccclass, property } = _decorator

const MAX = 85 // width or height

@ccclass("Item")
export class Item extends Component {
	count: number = 1
	data: any = null
	position: Vec3 = null
	origin: Item = null

	start() {
		this.node.getComponent(Sprite).spriteFrame = null
		// this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
		// this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
		// this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
	}

	async init(data) {
		this.data = data
		this.count = 1
		this.origin = null
		await this.setImg(data.type, data.name)
		this.hideCount()
		this.changeSize()
	}

	async setImg(type, name) {
		try {
			const spriteFrame: any = await loadImage(
				`imgs/${type}/${name}/spriteFrame`
			)
			this.node.getComponent(Sprite).spriteFrame = spriteFrame
		} catch (err) {
			console.error("load img error", err)
		}
	}

	changeSize(max?: number) {
		// find the bigger one in width or height
		const uiTransform = this.node.getComponent(UITransform)
		const { width, height } = uiTransform
		const longer = Math.max(width, height)
		const k = max ? max / longer : MAX / longer

		// uiTransform.setContentSize(width * k, height * k)
		uiTransform.width = width * k
		uiTransform.height = height * k
	}

	showCount() {
		if (this.count < 2) {
			this.hideCount()
			return
		}
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

	setPosition(position: Vec3) {
		this.position = position
	}

	getPosition(): Vec3 {
		return this.position
	}

	async clone(parent: Node) {
		const prefab: any = await loadPrefab("prefabs/item")
		const clonedNode = instantiate(prefab)
		// set node
		clonedNode.setParent(parent)
		const position = this.node.getWorldPosition()
		clonedNode.setWorldPosition(position)
		// set item
		const clonedItem = clonedNode.getComponent(Item)
		clonedItem.init(this.data)
		clonedItem.origin = this
		clonedItem.count = 1

		return clonedItem
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
			.to(0.1, {
				scale: needExpanding ? new Vec3(1.2, 1.2, 1.2) : new Vec3(1, 1, 1),
			})
			.start()
	}
}
