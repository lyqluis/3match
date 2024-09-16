import { _decorator, Component, Node } from "cc"
import { State } from "./state"
import { EditorLayout } from "./editorLayout"
import { MatchController } from "./MatchController"
import { Price } from "./Price"
import { FoodStorage } from "./FoodStorage"
import { OrdersController } from "./OrdersController"
import { EventDispatcher } from "./EventDispatcher"
import { Notify } from "./Notification"
const { ccclass, property } = _decorator

@ccclass("main")
export class Main extends Component {
	@property({ type: Node })
	editorNode: Node = null
	@property({ type: MatchController })
	matchController: MatchController = null
	@property({ type: Price })
	price: Price = null
	@property({ type: FoodStorage })
	foodStorage: FoodStorage = null
	@property({ type: OrdersController })
	orderController: OrdersController = null

	protected onLoad(): void {
		EventDispatcher.getTarget().on(
			EventDispatcher.PASS_LEVEL,
			this.nextLevel,
			this
		)
	}

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

	// TODO
	startGame() {
		Notify(`第 ${State.currentLevel} 关`)
		this.matchController.startGame()
		this.foodStorage.reset()
		this.orderController.reset()
		this.price.init()
	}

	nextLevel() {
		State.currentLevel++
		this.startGame()
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

	// test
	preLevel() {
		State.currentLevel--
		this.startGame()
	}
}
