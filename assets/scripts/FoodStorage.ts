import {
	_decorator,
	Component,
	EventTouch,
	Input,
	instantiate,
	Node,
	Prefab,
	tween,
	UITransform,
	Vec2,
	Vec3,
} from "cc"
import { Block } from "./Block"
import { Item } from "./Item"
import { State } from "./state"
import { Notify } from "./Notification"
const { ccclass, property } = _decorator

@ccclass("FoodStorage")
export class FoodStorage extends Component {
	@property(Prefab)
	preFood: Prefab = null
	@property(Node)
	slots: Node[] = []

	foodList: { name: string; component: Item }[] = []
	touchingFood: Item = null

	start() {
		this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
		this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
		this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
	}

	update(deltaTime: number) {}

	createFood(block: Block): Item {
		// instantiate food node
		const foodNode = instantiate(this.preFood)
		// food component
		const food = foodNode.getComponent(Item)
		food.init(block.data)
		// add food node to the slot
		const slotNode = this.findEmptySlot()
		foodNode.parent = slotNode
		foodNode.setPosition(new Vec3(0, 0))

		return food
	}

	addFood(block: Block) {
		const foodName = block.data.name
		const index = this.foodList.findIndex((item) => item.name === foodName)
		if (index > -1) {
			const food = this.foodList[index].component
			food.count++
			food.showCount()
		} else {
			const food = this.createFood(block)
			this.foodList.push({ name: foodName, component: food })
		}
	}

	removeFood(foodName: string) {
		const food = this.foodList.find((item) => item.name === foodName)
		if (food) {
			if (food.component.count > 1) {
				food.component.count--
			} else {
				this.foodList = this.foodList.filter((item) => item.name !== foodName)
			}
		}
	}

	findEmptySlot(): Node {
		return this.slots.find((slot) => slot.children.length === 0)
	}

	private getTouchFood(
		position: Vec3 // world position
	): Item {
		for (let i = 0; i < this.slots.length; i++) {
			const slotNode = this.slots[i] // slot node
			const food = slotNode.children[0]?.getComponent(Item)
			if (!food) continue

			// trans touch position (world position) to node space position (local position)
			const posInSlot = slotNode
				.getComponent(UITransform)
				.convertToNodeSpaceAR(position)
			const foodRect = food.getBoundingBox()

			// if food's bounds contains localPosition, return block
			if (foodRect.contains(new Vec2(posInSlot.x, posInSlot.y))) {
				return food
			}
		}
		return null
	}

	onTouchStart(event: EventTouch) {
		console.log("on touch start")
		const touch = event.getUILocation()
		const food = (this.touchingFood = this.getTouchFood(
			new Vec3(touch.x, touch.y)
		))
		console.log("on touch start", food)
		if (food) {
			food.playScale(true)
		}
	}

	onTouchEnd(event: EventTouch) {
		if (!this.touchingFood) return
		console.log("on touch end")
		this.touchingFood.playScale(false)
		// find current selected cooking tool
		const tool = State.currentTool
		// move food to cooking	tool area
		if (tool) {
			tool.moveFoodFromStorage(this.touchingFood, this)
		} else {
			Notify("请先选中一个烹饪工具")
			console.error("choose a cooking tool first")
		}

		this.touchingFood = null
	}

	onTouchCancel(event: EventTouch) {
		if (this.touchingFood) {
			this.touchingFood.playScale(false)
			this.touchingFood = null
		}
	}

	/**
	 * animation
	 */
	moveToResetOrder() {
		// 1. iterate the list
		this.foodList.forEach((foodItem, i) => {
			const food = foodItem.component
			// 2. set food to the same index slot's position in the slot list
			const slotNode = this.slots[i]
			const slotWorldPosition = slotNode.getWorldPosition()
			const position = food.node.parent
				.getComponent(UITransform)
				.convertToNodeSpaceAR(slotWorldPosition)
			// 3. move old food node to the new slot position
			tween(food.node)
				.to(0.1, { position }, { easing: "smooth" })
				.call(() => {
					food.node.setParent(slotNode)
					food.node.setPosition(new Vec3(0, 0))
				})
				.start()
		})
	}
}
