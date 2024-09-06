import {
	_decorator,
	Component,
	Input,
	Node,
	ProgressBar,
	tween,
	Vec3,
} from "cc"
import { State } from "./state"
import { EventDispatcher } from "./EventDispatcher"
const { ccclass, property } = _decorator

@ccclass("CookingTool")
export class CookingTool extends Component {
	shadow: Node = null
	materials = [] // 食材列表
	tool = null
	cookingTime: number = 5 // s
	timer: number = 0
	progressBarNode: Node = null
	progressBar: ProgressBar = null
	isWorking: boolean = false
	isSelected: boolean = false

	startBtn: Node = null

	start() {
		this.shadow = this.node.getChildByName("shadow")
		this.progressBarNode = this.node.getChildByName("ProgressBar")
		this.progressBar = this.progressBarNode.getComponent(ProgressBar)
		this.startBtn = this.node.getChildByName("start-button")
		this.setActive(true)
		this.progressBarNode.active = false
		this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
		EventDispatcher.getTarget().on(
			EventDispatcher.UPDATE_COOKING_TOOL,
			this.updateSelected,
			this
		)
	}

	update(deltaTime: number) {
		if (this.isWorking) {
			this.updateTimer(deltaTime)
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
	}

	startCooking() {
		console.log("on click", this.startBtn)
		if (this.isWorking || !this.isSelected) return

		// button animation
		tween(this.startBtn)
			.to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: "smooth" })
			.to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: "smooth" })
			.call(() => {
				this.resetTimer()
				this.isWorking = true
				this.setActive(false)
				this.progressBarNode.active = true
				EventDispatcher.getTarget().emit(
					EventDispatcher.UPDATE_COOKING_TOOL,
					null
				)
			})
			.to(0.1, { scale: new Vec3(1, 1, 1) })
			.call(() => {
				this.resetTimer()
				this.isWorking = true
				this.setActive(false)
				this.progressBarNode.active = true
				EventDispatcher.getTarget().emit(
					EventDispatcher.UPDATE_COOKING_TOOL,
					null
				)
			})
			.start()
	}

	finishCooking() {
		this.isWorking = false
		this.setActive(true)
		this.progressBarNode.active = false
		this.resetTimer()

		console.log("finish cooking", this.startBtn)
		// todo: finish cooking
		// delete foods
		// create cuisine
	}

	onTouchEnd() {
		if (State.currentTool !== this) {
			State.currentTool = this
			this.isSelected = true
		}
		EventDispatcher.getTarget().emit(EventDispatcher.UPDATE_COOKING_TOOL, this)
		console.log("select tool", State.currentTool)
	}

	/**
	 * animation
	 */
	updateSelected(newCookingTool: CookingTool) {
		const isSelected = (this.isSelected = newCookingTool === this)
		const scale = isSelected ? new Vec3(1.2, 1.2, 1.2) : new Vec3(1, 1, 1)
		tween(this.node).to(0.1, { scale: scale }, { easing: "linear" }).start()
	}
}
