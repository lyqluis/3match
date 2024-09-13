import {
	_decorator,
	Component,
	Label,
	Node,
	ProgressBar,
	Rect,
	tween,
	UITransform,
	Vec3,
} from "cc"
import { OrdersController } from "./OrdersController"
import { Config, getLevelConfig, State } from "./state"
import { changeImageSize, loadImage, randomNum, setImageToNode } from "./utils"
import { cuisineMap } from "./stateMap"
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

	position = null
	person = null
	cuisines: Cuisine[] = null
	time: number = null
	data = {
		cuisines: [],
		time: 10,
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
		// console.log("order start")
		this.timer = this.time = this.data.time // s
		const progressBar = (this.progressBar = this.node
			.getChildByName("progressBar")
			.getComponent(ProgressBar))
		progressBar.progress = 0
	}

	update(deltaTime: number) {
		return // todo
		this.timer -= deltaTime
		this.progressBar.progress = this.timer / this.time
		if (this.timer <= 0) {
			this.scheduleOnce(this.moveDownToRemove, 1)
		}
	}

	/**
	 * animation
	 */
	moveUpToShow(x, y) {
		const initPosition = new Vec3(x, y - this.moveDistance)
		this.node.setPosition(initPosition)

		const position = new Vec3(x, y)
		tween(this.node).to(0.5, { position }).start()
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
}
