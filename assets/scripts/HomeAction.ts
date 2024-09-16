import { _decorator, Component, director, Label, Node, tween, Vec3 } from "cc"
const { ccclass, property } = _decorator

@ccclass("HomeAction")
export class HomeAction extends Component {
	@property(Node)
	startBtn: Node = null

	clickStart() {
		this.playScale()
		// this.scheduleOnce(() => {
		director.loadScene("main")
		// }, 1)
	}

	playScale() {
		tween(this.startBtn)
			.to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) })
			.to(0.1, { scale: new Vec3(1, 1, 1) })
			.call(() => {
				this.startBtn.getChildByName("Label").getComponent(Label).string =
					"loading"
			})
			.start()
	}
}
