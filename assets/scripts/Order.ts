import {
	_decorator,
	Color,
	Component,
	Input,
	Label,
	Node,
	ProgressBar,
	Rect,
	Sprite,
	tween,
	UITransform,
	Vec3,
} from "cc"
import { OrdersController } from "./OrdersController"
import { Config, getLevelConfig, State } from "./state"
import {
	changeImageSize,
	loadImage,
	randomNum,
	setImageToNode,
	setParentInPosition,
} from "./utils"
import { cuisineMap } from "./stateMap"
import { Item } from "./Item"
const { ccclass, property } = _decorator

// test
const OrderData = {
	person: null,
	cuisines: null,
	time: null,
	data: null,
}

@ccclass("Order")
export class Order extends Component {
	@property(Node)
	// test
	number: Node = null

	private moveDistance = 500
	private progressBar: ProgressBar = null
	private timer: number = 0
	private timerRunning: boolean = false

	position = null
	person = null
	cuisines: Cuisine[] = []
	time: number = null
	cuisineNodes: Node[] = []
	data = {
		cuisines: [], // ['riceball', 'riceball']
		time: 10,
	}

	protected onLoad(): void {
		this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
	}

	setNum(n: number) {
		this.node.getChildByName("number").getComponent(Label).string = n.toString()
	}

	getBoundingBox(): Rect {
		return this.node.getComponent(UITransform).getBoundingBox()
	}

	private removeOrder() {
		const orders = this.node.parent.getComponent(OrdersController).orders
		orders.splice(orders.indexOf(this), 1)

		this.node.destroy()
	}

	// TODO: order's price data
	private generateOrderDate() {
		// get current level's config's order list
		const levelConfig = getLevelConfig(State.currentLevel ?? 1)
		const cuisineList = levelConfig.orders
		// get random cuisine count
		const cuisineCount = randomNum(1, 2)
		// get random cuisines with count
		const randomCuisines = []
		for (let i = 0; i < cuisineCount; i++) {
			const cuisine = cuisineList[randomNum(0, cuisineList.length - 1)]
			randomCuisines.push(cuisine)
		}
		// generate random waiting time
		const waitingTime = randomCuisines.reduce(
			(acc, val) => acc + randomNum(val.duration[0], val.duration[1]),
			0
		)
		return {
			cuisines: randomCuisines.map((c) => c.cuisine),
			time: waitingTime,
		}
	}

	private async setRandomAvatar() {
		const avatars = [1, 2, 3, 4]
		const i = randomNum(0, avatars.length - 1)
		const avatarName = avatars[i] + ""
		const node = this.node.getChildByName("person")
		await setImageToNode(node, "person", avatarName)
		changeImageSize(node, { maxHeight: 85 })
	}

	init(id?: number) {
		// set cuisin data
		this.data = this.generateOrderDate()
		// set cuisine image
		this.data.cuisines.map(async (c, i) => {
			const cuisine = cuisineMap[c]
			const node = this.node.getChildByName("cuisines-wrapper").children[i]
			this.cuisineNodes.push(node)
			// set img & label
			const imgNode = node.getChildByName("img")
			await setImageToNode(imgNode, "cuisine", c)
			changeImageSize(imgNode, { maxHeight: 85 })
			const labelNode = node.getChildByName("name")
			labelNode.getComponent(Label).string = cuisine.title
		})
		this.setRandomAvatar()
		// set id
		id && this.setNum(id)
	}

	start() {
		this.initProgressBar()
	}

	update(deltaTime: number) {
		if (!this.timerRunning) return

		this.timer -= deltaTime
		this.progressBar.progress = this.timer / this.time
		if (this.timer <= 0) {
			this.timerRunning = false
			this.scheduleOnce(() => this.moveDownToRemove(), 1)
		}
	}

	private initProgressBar() {
		this.timer = this.time = this.data.time // s
		const progressBar = (this.progressBar = this.node
			.getChildByName("progressBar")
			.getComponent(ProgressBar))
		progressBar.progress = 0
	}

	onTouchEnd() {
		this.playScale()
		const { currentTool } = State
		if (currentTool) {
			// match cuisine
			const cuisine = currentTool.materials[0]
			const matchedIndex = this.checkCuisine(cuisine)

			if (matchedIndex > -1) {
				this.data.cuisines.splice(matchedIndex, 1, null)
				const orderCuisineNode = this.cuisineNodes[matchedIndex]
				const orderCuisineImgNode = orderCuisineNode.getChildByName("img")

				this.moveCuisineToOrder(cuisine.node, orderCuisineImgNode, () => {
					orderCuisineImgNode.getComponent(Sprite).color = new Color(68, 68, 68)
					cuisine.node.destroy()
					currentTool.clearMaterials()

					const finished = this.checkOrderFinished()
					if (finished) {
						// TODO: order finished
						// stop timer
						this.timerRunning = false
						// todo: add coins
						// move down to delete order
						this.scheduleOnce(this.moveDownToRemove, 1)
					}
				})
			}
		}
	}

	moveCuisineToOrder(node: Node, target: Node, callback?) {
		// trans traget's world position to node's local position
		const position = target.getWorldPosition()
		const targetLocalPosition = node.parent
			.getComponent(UITransform)
			.convertToNodeSpaceAR(position)
		tween(node)
			.to(0.3, { position: targetLocalPosition }, { easing: "smooth" })
			.call(callback)
			.start()
	}

	checkCuisine(cuisine: Item) {
		return this.data.cuisines.findIndex((c) => c === cuisine.data.name)
	}

	checkOrderFinished() {
		return this.data.cuisines.every((c) => c === null)
	}

	/**
	 * animation
	 */
	moveUpToShow(x, y) {
		const initPosition = new Vec3(x, y - this.moveDistance)
		this.node.setPosition(initPosition)

		const position = new Vec3(x, y)
		tween(this.node)
			.to(0.5, { position })
			.call(() => {
				this.timerRunning = true
			})
			.start()
	}

	moveDownToRemove() {
		const position = this.node.getPosition()
		const newPosition = new Vec3(position.x, position.y - this.moveDistance)
		tween(this.node)
			.to(0.35, { position: newPosition })
			.call(() => {
				this.removeOrder()
				const controller = this.node.parent.getComponent(OrdersController)
				controller.refreshOrders()
			})
			.start()
	}

	playScale() {
		tween(this.node)
			.to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) })
			.to(0.1, { scale: new Vec3(1, 1, 1) })
			.start()
	}
}
