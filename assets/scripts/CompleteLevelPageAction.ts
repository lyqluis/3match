import { _decorator, Component, Label, Node, tween, Vec3 } from "cc"
const { ccclass, property } = _decorator

@ccclass("CompleteLevelPageAction")
export class CompleteLevelPageAction extends Component {
	@property(Node)
	nextLevelBtn: Node = null

	setActive(active?) {
		this.node.active = !!active
	}

	clickBtn(callback?) {
		tween(this.nextLevelBtn)
			.to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) })
			.to(0.1, { scale: new Vec3(1, 1, 1) })
			.call(() => {
				this.nextLevelBtn.getChildByName("Label").getComponent(Label).string =
					"loading"
				this.setActive(false)
				callback && callback()
			})
			.start()
	}
}
