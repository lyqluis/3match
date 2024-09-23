import {
	_decorator,
	Color,
	Component,
	Node,
	Sprite,
	tween,
	UITransform,
	Vec3,
} from "cc"
import { Block } from "./Block"
import { setParentInPosition } from "./utils"
const { ccclass, property } = _decorator

@ccclass("MatchBoard")
export class MatchBoard extends Component {
	@property({ type: Node })
	slotList: Node[] = []

	blockList: Block[] = []

	start() {
		// make slots' opacity to 0
		const wrapper = this.node.getChildByName("wrapper")
		const slots = wrapper.children
		slots.forEach((slot) => {
			const sprite = slot.getComponent(Sprite)
			sprite.color = new Color(255, 255, 255, 0)
		})
	}
	addNode(node: Node) {
		// get node's world position, then convert to local position
		const position = this.node
			.getComponent(UITransform)
			.convertToNodeSpaceAR(node.getWorldPosition())
		node.setParent(this.node)
		node.setPosition(position)
	}

	// get block's slot world position
	getSlotPosition(block: Block): Vec3 {
		const newBlockList = []
		let findFirst = false
		let inserted = false
		// insert block to the last index of block with same img in block list
		for (const oldBlock of this.blockList) {
			if (oldBlock.data.name == block.data.name) {
				findFirst = true
			} else if (findFirst && !inserted) {
				newBlockList.push(block)
				inserted = true
			}
			newBlockList.push(oldBlock)
		}
		if (!inserted) newBlockList.push(block)

		this.blockList = newBlockList
		this.moveToResetOrder() // animate old blocks to new order, set slot local position in block

		// slot's world position
		return this.node
			.getComponent(UITransform)
			.convertToWorldSpaceAR(block.getPosition())
	}

	removeMatchedBlocks(n = 3): Block {
		let lastBlock
		let count = 0
		let index = -1
		for (const block of this.blockList) {
			index++
			if (lastBlock?.data?.name == block.data.name) {
				count++
			} else {
				lastBlock = block
				count = 1
			}
			if (count >= n) break
		}
		if (count >= n) {
			const removedBlocks = this.blockList.splice(index - n + 1, n)
			const removedBlock = removedBlocks[0]
			removedBlocks.map((block) => {
				block.node.removeFromParent()
				block.origin.node.removeFromParent()
			})
			this.scheduleOnce(() => {
				this.moveToResetOrder()
			}, 0.2)
			return removedBlock
		}
	}

	clearAll() {
		this.blockList.map((block) => block.node.removeFromParent())
		this.blockList = []
	}

	getHoldingBlocks(n: number = 3): Block[] {
		if (!this.blockList.length) return
		const blockList = this.blockList
		this.blockList = blockList.slice(n)
		return blockList.slice(0, n)
	}

	isFull(){
		return this.blockList.length >= this.slotList.length
	}

	/**
	 * animation
	 */
	moveToResetOrder() {
		// 1. iterate the new block list
		this.blockList.forEach((block, i) => {
			// 2. set the block to the same index slot's position in the slot list
			block.setPosition(this.slotList[i].getPosition()) // local position in MatchBoard
			// 3. move old blocks to the new slot position
			if (block.node.getParent() === this.node) {
				tween(block.node).to(0.1, { position: block.getPosition() }).start()
			}
		})
	}

	moveToHoldingArea(blockNode: Node, holdingSlot: Node) {
		// get slot local positionin in this node
		const holdingSlotPosition = holdingSlot.getWorldPosition()
		const slotLocalPostionInBoard = this.node
			.getComponent(UITransform)
			.convertToNodeSpaceAR(holdingSlotPosition)

		tween(blockNode)
			.to(0.3, { position: slotLocalPostionInBoard }, { easing: "smooth" })
			.call(() => {
				setParentInPosition(blockNode, holdingSlot)
			})
			.start()
	}
}
