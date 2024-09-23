import { _decorator, Button, Component, Node, Sprite } from "cc"
const { ccclass, property } = _decorator

@ccclass("FailedLevelPageAction")
export class FailedLevelPageAction extends Component {
	@property({ type: Node })
	continueBtn: Node = null

	start() {
		this.setBtnActive(this.continueBtn, true)
	}

	setActive(active?: boolean) {
		this.node.active = active
	}

	private setBtnActive(btn: Node, active: boolean) {
		if (active) {
			btn.getComponent(Sprite).grayscale = false
			btn.getComponent(Button).interactable = true
		} else {
			btn.getComponent(Sprite).grayscale = true
			btn.getComponent(Button).interactable = false
		}
	}

	setContinueBtnActive(active: boolean) {
		this.setBtnActive(this.continueBtn, active)
	}
}
