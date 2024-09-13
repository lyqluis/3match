import {
	_decorator,
	Color,
	Component,
	Input,
	instantiate,
	Node,
	ProgressBar,
	Sprite,
	tween,
	UITransform,
	Vec3,
} from "cc"
import { State } from "./state"
import { EventDispatcher } from "./EventDispatcher"
import { Item } from "./Item"
import { Notify } from "./Notification"
import { loadImage, setParentInPosition } from "./utils"
import { findCuisineById } from "./stateMap"
const { ccclass, property } = _decorator

@ccclass("CookingTool")
export class CookingTool extends Component {
	shadow: Node = null
	materials: Item[] = [] // 食材列表
	slots: Node[] = [] // 存放食材的格子
	data = null
	tool: Node = null
	cookingTime: number = 5 // s
	timer: number = 0
	progressBarNode: Node = null
	progressBar: ProgressBar = null
	isWorking: boolean = false
	isSelected: boolean = false

	startBtn: Node = null

	protected onLoad(): void {
		this.shadow = this.node.getChildByName("shadow")
		this.progressBarNode = this.node.getChildByName("ProgressBar")
		this.progressBar = this.progressBarNode.getComponent(ProgressBar)
		this.startBtn = this.node.getChildByName("start-button")
		this.slots = this.node.getChildByName("container").children
		this.progressBarNode.active = false
		this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
		EventDispatcher.getTarget().on(
			EventDispatcher.UPDATE_COOKING_TOOL,
			this.updateSelected,
			this
		)
		this.setActive(false)
	}

	start() {}

	update(deltaTime: number) {
		if (this.isWorking) {
			this.updateTimer(deltaTime)
		}
	}

	async activate(data) {
		this.data = data
		// set tool sprite frame
		try {
			const spriteFrame: any = await loadImage(
				`imgs/${data.type}/${data.name}/spriteFrame`
			)
			const toolSpriteNode = (this.tool =
				this.node.getChildByPath("start-button/tool"))
			toolSpriteNode.getComponent(Sprite).spriteFrame = spriteFrame
			this.setActive(true)
			// set tool img into shadow node
			const shadowToolNodeSprite = this.shadow
				.getChildByPath("cook-tool-wrapper/tool")
				.getComponent(Sprite)
			shadowToolNodeSprite.spriteFrame = spriteFrame
			shadowToolNodeSprite.color = new Color(68, 68, 68)
		} catch (err) {
			console.error("load img error", err)
		}
	}

	private updateTimer(deltaTime: number) {
		this.timer -= deltaTime
		this.progressBar.progress = this.timer / this.cookingTime
		if (this.timer <= 0) {
			this.finishCooking()
		}
	}

	private resetTimer() {
		this.timer = this.cookingTime
	}

	setActive(active: boolean) {
		this.shadow.active = !active
		const color = active ? new Color(255, 255, 255) : new Color(68, 68, 68)
		this.materials.forEach((food) => {
			food.node.getComponent(Sprite).color = color
		})
	}

	getEmptySlot() {
		const i = this.materials.length
		if (i >= this.slots.length) console.error("food is more than empty slot")
		return this.slots[i]
	}

	startCooking() {
		console.log("on click", this.startBtn)
		if (!this.isSelected) {
			Notify("请先选中一个烹饪工具")
			console.error("choose a cooking tool first")
			return
		}
		if (this.isWorking) return

		// button animation
		this.buttonScale(() => {
			this.resetTimer()
			this.isWorking = true
			this.setActive(false)
			this.progressBarNode.active = true
			EventDispatcher.getTarget().emit(
				EventDispatcher.UPDATE_COOKING_TOOL,
				null
			)
			State.currentTool = null
		})
	}

	finishCooking() {
		this.isWorking = false
		this.setActive(true)
		this.progressBarNode.active = false
		this.resetTimer()

		console.log("finish cooking")

		// TODO: finish cooking
		// create cuisine
		const foods = this.materials.map((food) => food.data.name)
		const cuisineId = this.data.name + foods.sort().join("")
		const cuisineData = findCuisineById(cuisineId)
		const cuisine = this.materials[0]
		cuisine.init(cuisineData)
		if (cuisine.data.name === "rubbish") {
			Notify(`烹饪失败！得到 ${cuisine.data.title}`)
		} else {
			Notify(`${cuisine.data.title} 烹饪成功！`)
		}
		// delete foods
		this.materials.forEach((food, i) => i > 0 && food.node.destroy())
	}

	onTouchEnd() {
		if (this.isWorking || this.isSelected) return

		if (State.currentTool !== this) {
			State.currentTool = this
			this.isSelected = true
		}
		EventDispatcher.getTarget().emit(EventDispatcher.UPDATE_COOKING_TOOL, this)
		console.log("select tool", State.currentTool)
	}

	// add food node & food to materials
	addFood(food: Item) {
		// set node
		const localPosition = this.node
			.getComponent(UITransform)
			.convertToNodeSpaceAR(food.node.getWorldPosition())
		food.node.setParent(this.node)
		food.node.setPosition(localPosition)
		// set food
		this.materials.push(food)
	}

	clearMaterials() {
		this.materials.forEach((food) => food.node.destroy())
		this.materials = []
	}

	/**
	 * animation
	 */
	buttonScale(callback: Function) {
		tween(this.startBtn)
			.to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: "smooth" })
			.to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: "smooth" })
			.call(callback)
			.start()
	}

	updateSelected(newCookingTool: CookingTool) {
		const isSelected = (this.isSelected = newCookingTool === this)
		const scale = isSelected ? new Vec3(1.2, 1.2, 1.2) : new Vec3(1, 1, 1)
		tween(this.node).to(0.1, { scale: scale }, { easing: "linear" }).start()
	}

	async moveFoodFromStorage(food: Item, foodStorage) {
		if (this.materials.length >= this.slots.length) return
		console.log("move food", food)
		// 1. move food node into the tool node
		if (food.count > 1) {
			// clone a food
			const clonedFood = await food.clone(this.node)
			food.count--
			food.showCount()
			food = clonedFood
		} else {
			// food.count === 1
			setParentInPosition(food.node, this.node)
		}
		// 2. get Tool's empty slot position
		const slot = this.getEmptySlot()
		const slotLocalPosition = slot.getPosition()
		// 3. move the food node with animation
		tween(food.node)
			.to(0.2, { position: slotLocalPosition }, { easing: "smooth" })
			.call(() => {
				!food.origin && foodStorage.removeFood(food.data.name)
				this.addFood(food)
				foodStorage.moveToResetOrder()
			})
			.start()
	}
}
