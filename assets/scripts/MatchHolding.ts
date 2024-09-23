import {
	_decorator,
	Component,
	EventTouch,
	Input,
	Node,
	tween,
	UITransform,
	Vec2,
	Vec3,
} from "cc"
import { Block } from "./Block"
import { MatchController } from "./MatchController"
import { setParentInPosition } from "./utils"
const { ccclass, property } = _decorator

@ccclass("MatchHolding")
export class MatchHolding extends Component {
	@property(Node)
	slots: Node[] = []

	blocks: Block[] = []
	touchingBlock: Block = null

	protected onLoad(): void {
		this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
		this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
		this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
	}

	getEmptySlots(): Node[] {
		const n = this.blocks.length
		return this.slots.slice(n)
	}

	addBlock(block: Block) {
		this.blocks.push(block)
	}

	clearAll() {
		this.blocks.map((block) => block.node.destroy())
		this.blocks = []
	}

	isFull() {
		return this.blocks.length >= this.slots.length
	}

	private getTouchBlock(
		position: Vec3 // world position
	): Block {
		// trans touch position (world position) to node space position (local position)
		const pos = this.node
			.getComponent(UITransform)
			.convertToNodeSpaceAR(position)
		// must loop in reverse order, because when deleting the upper blocks is first deleted
		for (let i = this.node.children.length - 1; i >= 0; i--) {
			const slotNode = this.node.children[i]
			// empty slot, return
			if (!slotNode.children.length) continue
			// if slot node bound contains localPosition, return block
			if (
				slotNode
					.getComponent(UITransform)
					.getBoundingBox()
					.contains(new Vec2(pos.x, pos.y))
			) {
				return slotNode.children[0].getComponent(Block)
			}
		}
		return null
	}

	private onTouchStart(e: EventTouch) {
		const touch = e.getUILocation()
		const block = (this.touchingBlock = this.getTouchBlock(
			new Vec3(touch.x, touch.y)
		))
		console.log("on touch start", block)
		if (block) {
			block.playScale(true)
		}
	}
	private onTouchEnd(e: EventTouch) {
		console.log("on touch end")
		if (!this.touchingBlock) return
		setParentInPosition(this.touchingBlock.node, this.node.parent)
		this.touchingBlock.playScale()
		this.node.parent
			.getComponent(MatchController)
			.moveBlockToMatchBoardArea(this.touchingBlock)
		// move from blocks
		this.blocks = this.blocks.filter((b) => b !== this.touchingBlock)
		this.touchingBlock = null
		// auto reset to new order
		this.moveToResetOrder()
	}

	private onTouchCancel(e: EventTouch) {
		console.log("on touch cancel")
		if (this.touchingBlock) {
			this.touchingBlock.playScale()
			this.touchingBlock = null
		}
	}

	/**
	 * animation
	 */
	moveToResetOrder() {
		// 1. iterate the new block list
		this.blocks.forEach((block, i) => {
			// 2. set the block to the same index slot's position in the slot list
			setParentInPosition(block.node, this.slots[i])
			// 3. move old blocks to the new slot position
			tween(block.node)
				.to(0.1, { position: new Vec3(0, 0) })
				.start()
		})
	}
}
