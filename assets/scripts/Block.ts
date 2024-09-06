import {
	_decorator,
	Component,
	instantiate,
	Node,
	Prefab,
	Rect,
	Sprite,
	SpriteFrame,
	tween,
	UITransform,
	Vec3,
} from "cc"
import { Config } from "./state"
import { BlockMap } from "./BlockMap"
const { ccclass, property } = _decorator

@ccclass("Block")
export class Block extends Component {
	public rect: Rect = null
	public innerRect: Rect = null
	public img: SpriteFrame = null // img
	public imgIndex: number = null // img index
	public data: any = null // from Block Map
	public position: Vec3 = null // local position, not same with node.getPosition()
	public origin: Block = null

	setPosition(localPos: Vec3) {
		this.position = localPos
	}

	getPosition(): Vec3 {
		return this.position
	}

	// ? is it necessary to store in this.rect?
	getBoundingBox(): Rect {
		return this.node.getComponent(UITransform).getBoundingBox()
	}
	getInnerBoundingBox(): Rect {
		const rect = this.getBoundingBox()
		const offset = Config.blockBoundingOffset
		return new Rect(
			rect.x + offset,
			rect.y + offset,
			rect.width - offset * 2,
			rect.height - offset * 2
		)
	}

	setShadow(needShadow?: boolean) {
		if (needShadow) {
			this.node.getChildByName("shadow-layer").active = true
		} else {
			this.node.getChildByName("shadow-layer").active = false
		}
	}

	setImg(img: SpriteFrame) {
		this.img = img
		const node = this.node.getChildByName("item")
		node.getComponent(Sprite).spriteFrame = img
		// change image size
		// node.getComponent(UITransform).setContentSize()
	}

	init(img: SpriteFrame, imgIndex: number, needAnimation?: boolean) {
		const name = img.name
		this.data = BlockMap[name]
		this.position = this.node.getPosition() // local position: Vec3
		this.imgIndex = imgIndex
		if (needAnimation) {
			this.moveToCenterAndBack(() => this.setImg(img))
		} else {
			this.setImg(img)
		}
		// console.log("block init", this.data, this.imgIndex)
	}

	getImgIndex() {
		return this.imgIndex
	}
	getData() {
		return this.data
	}

	canTouch() {
		return !this.node.getChildByName("shadow-layer").active
	}

	// ? is this necessary?
	// use in the move block clicked from layout area to holding area
	clone(parent: Node, preBlock: Prefab) {
		const blockNode: Node = instantiate(preBlock)
		// set block node
		blockNode.setParent(parent)
		const position = this.node.getPosition() // local position in parent
		blockNode.setPosition(position)
		// set block
		const block = blockNode.getComponent(Block)
		block.setShadow(false)
		block.init(this.img, this.imgIndex)
		block.origin = this

		this.node.active = false
		return block
	}

	/**
	 * animation
	 */
	moveToCenterAndBack(callback) {
		tween(this.node)
			.to(0.2, { position: new Vec3(0, 0) })
			.call(callback)
			.to(0.2, { position: this.position })
			.start()
	}
	playScale(needExpanding?: boolean) {
		tween(this.node)
			.to(0.1, { scale: needExpanding ? new Vec3(1.2, 1.2) : new Vec3(1, 1) })
			.start()
	}
}
