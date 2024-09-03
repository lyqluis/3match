import { _decorator, Component, Node } from "cc"
import { State } from "./state"
import { EditorLayout } from "./editorLayout"
import { MatchController } from "./MatchController"
const { ccclass, property } = _decorator

@ccclass("main")
export class Main extends Component {
	@property({ type: Node })
	editorNode: Node = null

	@property({ type: MatchController })
	matchController: MatchController = null

	start() {
		// todo this.init_bg_sound()
		if (State.mode !== 0) {
			// game mode
			this.editorNode.active = false
			this.startGame()
		} else {
			// editor mode
			this.editorNode.active = true
			// ?? trigger editor's method
			this.editorNode
				.getChildByName("editor-grid-layout")
				.getComponent(EditorLayout)
				.startEditor()
		}
	}

	startGame() {
		// get matchController's component
		this.matchController.startGame()
	}

	// test
	changeMode() {
		if (State.mode === 0) {
			State.mode = 1
		} else {
			State.mode = 0
		}
		this.start()
	}

}
