import { _decorator, Component, Node } from "cc"
import { State } from "./state"
import { CookingTool } from "./CookingTool"
import { Notify } from "./Notification"
const { ccclass, property } = _decorator

@ccclass("CookingController")
export class CookingController extends Component {
	tashNode: Node = null

	protected onLoad(): void {
		this.tashNode = this.node.getChildByName("trash")
	}
}
