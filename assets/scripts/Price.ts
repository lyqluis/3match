import { _decorator, Component, Label, Node } from "cc"
import { LevelConfigs, State } from "./state"
const { ccclass, property } = _decorator

@ccclass("Price")
export class Price extends Component {
	money: number = 0
	goal: number = 0

	start() {
		this.init()
	}

	update(deltaTime: number) {}

	init() {
		this.money = 0
		const config = LevelConfigs[State.currentLevel ?? 1]
		const { goal } = config
		this.goal = goal
		this.updateMoneyLabel()
		this.node.getChildByName("goal").getComponent(Label).string = goal + ""
	}

	addMoney(n: number) {
		this.money += n
		this.updateMoneyLabel()
		if (this.money >= this.goal) {
      // TODO: pass level
			// State.passLevel()
		}
	}

	updateMoneyLabel() {
		this.node.getChildByName("label").getComponent(Label).string =
			this.money + ""
	}
}
