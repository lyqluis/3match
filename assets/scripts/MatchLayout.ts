import {
	_decorator,
	Component,
	EventTouch,
	Input,
	instantiate,
	Node,
	Prefab,
	SpriteFrame,
	UITransform,
	Vec2,
	Vec3,
} from "cc"
import { Block } from "./Block"
import { getLevelConfig, LevelConfigs, State } from "./state"
import { BlockMap } from "./BlockMap"
import { MatchController } from "./MatchController"
const { ccclass, property } = _decorator

@ccclass("matchLayout")
export class MatchLayout extends Component {
	@property({ type: Prefab })
	preBlock: Prefab = null
	@property({ type: SpriteFrame })
	foodImgs: SpriteFrame[] = []
	@property({ type: SpriteFrame })
	toolImgs: SpriteFrame[] = []
	@property({ type: SpriteFrame })
	cuisineImgs: SpriteFrame[] = []

	touchingBlock: Block = null

	start() {
		if (State.mode === 1) {
			this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
			this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
			this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
		}
	}

	addBlockByWorldPosition(position: Vec3): Block {
		// trans world pos to local pos
		position = this.node
			.getComponent(UITransform)
			.convertToNodeSpaceAR(position)
		return this.addBlockByLocalPosition(position)
	}

	addBlockByLocalPosition(position: Vec3): Block {
		const block: Node = instantiate(this.preBlock)
		block.setPosition(position)
		block.setParent(this.node)
		return block.getComponent(Block)
	}

	removeBlockByWorldPosition(position: Vec3) {
		const block = this.getTouchBlock(position, {
			active: false,
			noShadow: false,
		})
		if (block) {
			// block.node.removeFromParent()
			block.node.destroy()
		}
	}

	refreshShadow() {
		// 2 阶遍历来判断当前 block 是否和其他 block 相交，从而显示阴影
		for (let i = 0; i < this.node.children.length; i++) {
			const block = this.node.children[i].getComponent(Block)
			// console.log("refresh shadow - i", i, this.node.children[i], block)
			if (!block.node.active) continue // ? use in move layout to holding
			if (block) block.setShadow()
			for (let j = i + 1; j < this.node.children.length; j++) {
				const block2 = this.node.children[j].getComponent(Block)
				if (!block2.node.active) continue // ? use in move layout to holding
				if (block2) {
					const isIntersected = block
						.getInnerBoundingBox()
						.intersects(block2.getInnerBoundingBox())
					if (isIntersected) {
						block.setShadow(true)
						break
					}
				}
			}
		}
	}

	getChildren() {
		return this.node.children
	}

	removeAllBlocks() {
		// this.node.removeAllChildren()
		this.node.destroyAllChildren()
	}

	// 根据关卡数生成对应的 block
	renderGame(level: number) {
		this.removeAllBlocks()
		// get level config
		const levelConfig = getLevelConfig(level)
		const posList = levelConfig.value
		// get random limited images data
		let randomBlockImgData: { index: number; data: any }[] =
			this.getRandomBlockImgData(levelConfig.limit, levelConfig.includes)
		let randomBlockImgDataIndex = 0
		posList.map((pos, i) => {
			// 每个图片生成 3 个 block
			if (i !== 0 && i % 3 === 0) {
				randomBlockImgDataIndex++
				if (randomBlockImgDataIndex >= randomBlockImgData.length) {
					randomBlockImgDataIndex = 0
					// make sure 'tool' type only generate once
					randomBlockImgData = randomBlockImgData.filter(
						(item) => item.data.type !== "tool"
					)
				}
			}
			const { index: blockImgIndex, data: blockData } =
				randomBlockImgData[randomBlockImgDataIndex]
			const block = this.addBlockByLocalPosition(new Vec3(pos.x, pos.y))
			// set block's data & img
			block.init(this[blockData.type + "Imgs"][blockImgIndex], blockImgIndex)
		})
		this.refreshShadow()
		this.randomizeBlocks()
	}

	getRandomBlockImgData(
		limit: number,
		includes: string[]
	): { index: number; data: any }[] {
		// find specific item's index
		const res = includes.map((name) => {
			let includeIndex = this.toolImgs.findIndex((frame) => frame.name === name)
			if (includeIndex < 0) {
				includeIndex = this.foodImgs.findIndex((frame) => frame.name === name)
			}
			return { index: includeIndex, data: BlockMap[name] }
		})
		// random rest food items
		limit -= res.length
		while (limit) {
			const randomIndex = Math.floor(Math.random() * this.foodImgs.length)
			if (
				res.some(
					(item) => item.index === randomIndex && item.data.type === "food"
				)
			)
				continue
			res.push({
				index: randomIndex,
				data: BlockMap[this.foodImgs[randomIndex].name],
			})
			limit--
		}
		return res
	}

	randomizeBlocks() {
		// get all child node (block node)
		const blocks = this.node.children
			.filter((node) => node.active) // ? use in move layout to holding
			.map((node) => node.getComponent(Block))
		this.shuffleBlocks(blocks)
	}

	private shuffleBlocks(array) {
		for (let i = array.length - 1; i > 0; i--) {
			// 随机生成一个小于 i 的整数 j
			const j = Math.floor(Math.random() * (i + 1))
			// 交换元素 array[i] 和 array[j] 的 img
			const tempData = array[i].getData()
			const tempIndex = array[i].getImgIndex()
			const randomData = array[j].getData()
			const randomIndex = array[j].getImgIndex()
			array[i].init(
				this[randomData.type + "Imgs"][randomIndex],
				randomIndex,
				true
			)
			array[j].init(this[tempData.type + "Imgs"][tempIndex], tempIndex, true)
		}
	}

	getTouchBlock(
		position: Vec3, // world position
		options = {
			active: false,
			noShadow: false,
		}
	): Block {
		// trans touch position (world position) to node space position (local position)
		const pos = this.node
			.getComponent(UITransform)
			.convertToNodeSpaceAR(position)
		// must loop in reverse order, because when deleting the upper blocks is first deleted
		for (let i = this.node.children.length - 1; i >= 0; i--) {
			const node = this.node.children[i]
			// block node is not active or is shadowed, continue
			if (options.active && !node.active) continue
			const block = node.getComponent(Block)
			if (options.noShadow && !block.canTouch()) continue
			// if block's bounds contains localPosition, return block
			if (block.getBoundingBox().contains(new Vec2(pos.x, pos.y))) {
				return block
			}
		}
		return null
	}

	onTouchStart(e: EventTouch) {
		const touch = e.getUILocation()
		const block = (this.touchingBlock = this.getTouchBlock(
			new Vec3(touch.x, touch.y),
			{ active: true, noShadow: true }
		))
		console.log("on touch start", block)
		if (block) {
			block.playScale(true)
		}
	}
	onTouchEnd(e: EventTouch) {
		console.log("on touch end")
		if (!this.touchingBlock) return
		this.touchingBlock.playScale()
		this.node.parent
			.getComponent(MatchController)
			.moveBlockToMatchBoardArea(this.touchingBlock, this.preBlock)
		this.touchingBlock = null
	}
	onTouchCancel(e: EventTouch) {
		console.log("on touch cancel")
		if (this.touchingBlock) {
			this.touchingBlock.playScale()
			this.touchingBlock = null
		}
	}
}
