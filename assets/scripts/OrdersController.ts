import {
	_decorator,
	Component,
	instantiate,
	Label,
	Layout,
	Node,
	Prefab,
	tween,
	Vec3,
} from "cc"
import { Order } from "./Order"
import { Notify } from "./Notification"
import { Config } from "./state"
const { ccclass, property } = _decorator

@ccclass("OrdersController")
export class OrdersController extends Component {
	@property(Prefab)
	preOrder: Prefab = null

	orderCount = 2
	orderId = 0
	layout: Layout = null // ?
	orders = []

	start() {
		// todo auto
		// this.scheduleOnce(this.startOrder, 20)
	}

	startOrder() {
		Notify("客人要来咯")
		this.createOrder()
		this.scheduleOnce(this.createOrder, 10)
	}

	createOrder() {
		if (this.orders.length >= 2) return // max 2 orders

		const lastOrder = this.orders[this.orders.length - 1]
		const spacingX = 20
		let newX = 0
		let newY = 0
		if (lastOrder) {
			const lastRect = lastOrder.getBoundingBox()
			console.log("last order rect", lastRect)
			newX = lastRect.x + lastRect.width + spacingX
			newY = lastRect.y
		}
		console.log("new xy", newX, newY)

		this.orderId++
		// instantiate order node
		const orderNode = instantiate(this.preOrder)
		orderNode.setParent(this.node)
		this.node.addChild(orderNode)

		const order = orderNode.getComponent(Order)
		// ? is necessary
		order.init(this.orderId) // ?init random order by level config
		this.orders.push(order)
		// animate to show up
		order.moveUpToShow(newX, newY)
	}

	clearOrders() {
		this.orders.map((order) => {
			order.node.destroy()
		})
		this.orders = []
	}

	// reset position of orders after some order node removed
	refreshOrders(callback?) {
		this.orders.reduce((lastOrderRect, order) => {
			const x = lastOrderRect ? lastOrderRect.x + lastOrderRect.width + 20 : 0
			const y = lastOrderRect ? lastOrderRect.y : 0
			// order.setPosition({ x, y })
			tween(order.node)
				.to(0.2, { position: new Vec3(x, y) })
				.call(() => {
					callback && callback()
				})
				.start()
			return { ...order.getBoundingBox(), x, y }
		}, null)
		// create new order, this should be called after resfreshing the orders
		this.scheduleOnce(this.createOrder, Config.orderInterval)
	}
}
