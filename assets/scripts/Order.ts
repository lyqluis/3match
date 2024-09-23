import {
	_decorator,
	Color,
	Component,
	Input,
	Label,
	Node,
	NodeEventType,
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
import { Notify } from "./Notification"
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
	// test
	number: Node = null

	private moveDistance = 500
	private progressBar: ProgressBar = null
	private timer: number = 0
	private timerRunning: boolean = false

	position = null
	person = null
	// cuisines: Cuisine[] = []
	cuisineCount: number = null
	time: number = null
	cuisineNodes: Node[] = []
	data = {
		cuisines: [], // ['riceball', 'riceball']
		time: 10,
	}
	price: number = 0

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

	private generateOrderData(cuisineCount?: number) {
		// get current level's config's order list
		const levelConfig = getLevelConfig(State.currentLevel ?? 1)
		const cuisineList = levelConfig.orders
		if (!cuisineList?.length) {
			console.error("no cuisine config")
		}
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
	private async setPrice(n: number = this.price) {
		const node = this.node.getChildByPath("price/label")
		node.getComponent(Label).string = n.toString()
	}

	init(cuisineCount: number = 1, id?: number) {
		// set cuisin data
		this.data = this.generateOrderData(cuisineCount)
		if (!this.data) return
		this.cuisineCount = cuisineCount
		// set cuisine image
		this.data.cuisines.map(async (c, i) => {
			const cuisineData = cuisineMap[c]
			const node = this.node.getChildByName("cuisines-wrapper").children[i]
			this.cuisineNodes.push(node)
			// set img & label
			const imgNode = node.getChildByName("img")
			await setImageToNode(imgNode, "cuisine", c)
			changeImageSize(imgNode, { maxHeight: 85 })
			const labelNode = node.getChildByName("name")
			labelNode.getComponent(Label).string = cuisineData.title
			// set pirce
			this.price += cuisineData.price
			if (i == this.data.cuisines.length - 1) {
				this.setPrice()
			}
		})
		this.setRandomAvatar()
		// set id
		id && this.setNum(id)
		// set adaptive width
		this.initOrderSize()
		this.initProgressBar()
	}

	start() {
		console.log("order start")
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
		console.log("init progress bar")

		this.timer = this.time = this.data.time // s
		const progressBar = (this.progressBar = this.node
			.getChildByName("progressBar")
			.getComponent(ProgressBar))
		progressBar.totalLength = this.node.getComponent(UITransform).width
		progressBar.progress = 0
	}

	// adaptive width based on cuisine number
	private initOrderSize() {
		if (this.cuisineCount < 2) {
			// remove extra cuisine node
			const extraNode = this.node.getChildByName("cuisines-wrapper").children[1]
			const extraWidth = extraNode
				.getComponent(UITransform)
				.getBoundingBox().width
			extraNode.destroy()
			const uiTransform = this.node.getComponent(UITransform)
			uiTransform.width = uiTransform.width - extraWidth
		}
	}

	onTouchEnd() {
		this.playScale()
		const { currentTool } = State
		if (currentTool) {
			// match cuisine
			const cuisine = currentTool.materials[0]

			// if last click occurs error, click event will disappear
			if (!cuisine) {
				Notify("没有料理可以提供")
				return
			}

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
						// order finished
						// stop timer
						this.timerRunning = false
						// add coins
						const coinsNode = this.node.getChildByPath("price/coins")
						const coinsPriceNode = this.node.getChildByPath("price/label")
						const controller = this.node.parent.getComponent(OrdersController)
						controller.moveMoneyToCoins(coinsNode)
						controller.addMoneyToAccount(this.timer / this.time, this.price)
						// move down to delete order
						this.scheduleOnce(this.moveDownToRemove, 1)
					}
				})
			}
		}
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
}
