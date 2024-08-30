import { _decorator, Component, Label, Node, tween, Vec3 } from "cc"
import { EventDispatcher } from "./EventDispatcher"
const { ccclass, property } = _decorator

@ccclass("Notification")
export class Notification extends Component {
	@property({ type: Label })
	message: Label = null

	start() {
		this.node.setPosition(0, -2000)
		EventDispatcher.getTarget().on(
			EventDispatcher.SHOW_NOTIFICATION,
			this.show,
			this
		)
	}

	show(message: string) {
		this.message.string = message
		// animation
		this.node.setPosition(0, 0) // 先到当前目标位置
		tween(this.node)
			.to(0.8, { position: new Vec3(0, 50) }) // 动画开始执行，移动到目标位置
			.to(0.3, { position: new Vec3(0, 2000) }) // 动画加速上移，移出屏幕
			.call(() => {
				// callback, 默认回到初始位置
				this.node.setPosition(0, -2000)
			})
			.start()
	}
}
