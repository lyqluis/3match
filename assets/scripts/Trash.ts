import { _decorator, Component, tween, Vec3 } from "cc"
import { CookingTool } from "./CookingTool"
import { State } from "./state"
import { Notify } from "./Notification"
import { setParentInPosition } from "./utils"
const { ccclass } = _decorator

@ccclass("Trash")
export class Trash extends Component {
	removeAllMaterials() {
		this.playScale()
		const currentTool: CookingTool = State.currentTool
		if (currentTool) {
			const materials = currentTool.materials
			materials.forEach((item) => {
				// move item node to trash node
				setParentInPosition(item.node, this.node)
				tween(item.node)
					.to(0.2, { position: new Vec3(0, 0) }, { easing: "smooth" })
					.call(() => {
						currentTool.clearMaterials()
					})
					.start()
			})
		} else {
			Notify("请先选中一个烹饪工具")
		}
	}
	/**
	 * animation
	 */
	playScale() {
		tween(this.node)
			.to(0.2, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: "smooth" })
			.to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: "smooth" })
			.start()
	}
}
