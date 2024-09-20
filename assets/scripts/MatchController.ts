import {
	_decorator,
	Component,
	Node,
	Prefab,
	tween,
	UITransform,
	Vec3,
} from "cc"
import { MatchLayout } from "./MatchLayout"
import { MatchHolding } from "./MatchHolding"
import { MatchBoard } from "./MatchBoard"
import { State } from "./state"
import { Block } from "./Block"
import { FoodStorage } from "./FoodStorage"
import { CookingTool } from "./CookingTool"
import { Notify } from "./Notification"

const { ccclass, property } = _decorator

@ccclass("MatchController")
export class MatchController extends Component {
	@property({ type: MatchLayout })
	matchLayout: MatchLayout = null
	@property({ type: MatchHolding })
	matchHolding: MatchHolding = null
	@property({ type: MatchBoard })
	matchBoard: MatchBoard = null
	@property({ type: FoodStorage })
	foodStorage: FoodStorage = null
	@property({ type: CookingTool })
	cookingTools: CookingTool[] = []

	UITransform: UITransform = null

	protected onLoad() {
		this.UITransform = this.node.getComponent(UITransform)
	}

	startGame() {
		// clear all blocks in childs
		this.matchLayout.removeAllBlocks()
		this.matchHolding.clearAll()
		this.matchBoard.clearAll()
		this.matchLayout.renderGame(State.currentLevel ?? 1)
	}

	activateCookingTool(data) {
		const tools = ["pan", "drinkmachine", "pot"]
		const i = tools.findIndex((name) => data.name === name)
		const tool = this.cookingTools[i]
		tool.activate(data)
	}

	/**
	 * remove button
	 */
	remove() {
		// get empty slots in holding area
		const emptySlots = this.matchHolding.getEmptySlots()
		if (!emptySlots.length) return
		// get first n blocks in match board
		const blocks = this.matchBoard.getHoldingBlocks(emptySlots.length)
		if (blocks) {
			// remove blocks
			blocks.forEach((block, i) => {
				this.matchBoard.moveToHoldingArea(block.node, emptySlots[i])
				this.matchHolding.addBlock(block)
			})
			this.matchBoard.moveToResetOrder()
		} else {
			Notify("no blocks to remove")
		}
	}

	/**
	 * animation
	 */
	// after block clicked, the block will be moved from layout area to march board area
	// 1. copy the block, set origin block inactive
	// 2. move the copy block to match board's position in controller area
	// 3. set the copy block into match board area
	// ? is it possible to move the origin block to holding area directly?
	moveBlockToMatchBoardArea(block: Block, preBlock?: Prefab) {
		const clonedBlock = preBlock ? block.clone(this.node, preBlock) : block
		// refresh shadow
		preBlock && this.matchLayout.refreshShadow()

		const slotPosition = this.matchBoard.getSlotPosition(clonedBlock)
		const localPos = this.UITransform.convertToNodeSpaceAR(slotPosition)

		// move
		tween(clonedBlock.node)
			.to(0.2, { position: localPos })
			.call(() => {
				// set block into match board area
				this.matchBoard.addNode(clonedBlock.node)
				// remove matched 3 blocks
				const deletedBlock = this.matchBoard.removeMatchedBlocks()
				if (deletedBlock) {
					// todo play sound
					if (deletedBlock.data.type === "food") {
						// call food storage controller to create block's food
						this.foodStorage.addFood(deletedBlock)
					} else if (deletedBlock.data.type === "tool") {
						// add tool to the tools controller
						this.activateCookingTool(deletedBlock.data)
					}
				}
			})
			.start()
	}
}
