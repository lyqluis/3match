import { _decorator, Component, Label, Node } from "cc"
import { getLevelConfig, State } from "./state"
import { EventDispatcher } from "./EventDispatcher"
import { Notify } from "./Notification"
const { ccclass, property } = _decorator

@ccclass("Price")
export class Price extends Component {
	@property(Node)
	completeLevelPage: Node = null

	money: number = 0
	goal: number = 0

	start() {
		this.init()
	}

	update(deltaTime: number) {}

	init() {
		this.money = 0
		const config = getLevelConfig(State.currentLevel)
		const { goal } = config
		this.goal = goal
		this.updateMoneyLabel()
		this.node.getChildByName("goal").getComponent(Label).string = goal + ""
	}

	addMoney(n: number) {
		this.money += n
		this.updateMoneyLabel()
		if (this.money >= this.goal) {
			// pass level
			this.scheduleOnce(() => {
				// TODO: complete level page
				this.completeLevelPage.active = true
				// this.scheduleOnce(() => {
				// 	this.completeLevelPage.active = false
				// 	EventDispatcher.getTarget().emit(EventDispatcher.PASS_LEVEL)
				// }, 3)
			}, 1)
		}
	}

	updateMoneyLabel() {
		this.node.getChildByName("label").getComponent(Label).string =
			this.money + ""
	}
}
