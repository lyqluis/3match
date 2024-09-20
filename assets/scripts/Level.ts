import { _decorator, Component, Label, Node } from "cc"
import { EventDispatcher } from "./EventDispatcher"
const { ccclass, property } = _decorator

@ccclass("Level")
export class Level extends Component {
	protected onLoad(): void {
		EventDispatcher.getTarget().on(
			EventDispatcher.UPDATE_LEVEL,
			this.updateLevel,
			this
		)
	}

	updateLevel(level: number) {
		this.node
			.getChildByName("label")
			.getComponent(Label).string = `第 ${level} 关`
	}
}
