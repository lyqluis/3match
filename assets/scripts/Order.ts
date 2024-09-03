import {
	_decorator,
	Component,
	Label,
	Node,
	Rect,
	tween,
	UITransform,
	Vec3,
} from "cc"
import { OrdersController } from "./OrdersController"
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
	position = null
	person = null
	cuisines: Cuisine[] = null
	time: number = null
	data = {
		cuisine: [],
		time: 60,
	}

	setNum(n: number) {
		this.node.getChildByName("number").getComponent(Label).string = n.toString()
	}

	getBoundingBox(): Rect {
		return this.node.getComponent(UITransform).getBoundingBox()
	}

	removeOrder() {
		const orders = this.node.parent.getComponent(OrdersController).orders
		orders.splice(orders.indexOf(this), 1)

		this.node.destroy()
	}

	start() {}

	update(deltaTime: number) {}

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
				controller.refreshOrders(() => {
					// todo create a new order, this should be called after resfreshing the orders
					controller.createOrder()
				})
			})
			.start()
	}
}
