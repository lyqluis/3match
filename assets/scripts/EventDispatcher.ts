import { _decorator, Component, Node, EventTarget } from "cc"
const { ccclass, property } = _decorator
// AI
// export class EventDispatcher {
// 	private static _instance: EventDispatcher = null
// 	private _eventMap: Map<string, Array<Function>> = new Map()

// 	public static get instance(): EventDispatcher {
// 		if (this._instance == null) {
// 			this._instance = new EventDispatcher()
// 		}
// 		return this._instance
// 	}

// 	public addEventListener(event: string, callback: Function) {
// 		if (this._eventMap.has(event)) {
// 			let callbacks = this._eventMap.get(event)
// 			callbacks.push(callback)
// 		} else {
// 			this._eventMap.set(event, [callback])
// 		}
// 	}

// 	public removeEventListener(event: string, callback: Function) {
// 		if (this._eventMap.has(event)) {
// 			let callbacks = this._eventMap.get(event)
// 			let index = callbacks.indexOf(callback)
// 			if (index >= 0) {
// 				callbacks.splice(index, 1)
// 			}
// 		}
// 	}

// 	public dispatchEvent(event: string, ...args: any[]) {
// 		if (this._eventMap.has(event)) {
// 			let callbacks = this._eventMap.get(event)
// 			for (let callback of callbacks) {
// 				callback(...args)
// 			}
// 		}
// 	}

// 	public clear() {
// 		this._eventMap.clear()
// 	}
// }

// from video
// on: EventDispatcher.getTarget().on(EventDispatcher.UPDATE_BLOCK_COUNT, this.updateBlockCount, this)
// emit: EventDispatcher.getTarget().emit(EventDispatcher.SHOW_NOTIFICATION, "Created blocks successfully!")

const eventTarget = new EventTarget()
export class EventDispatcher {
	private static data: EventDispatcher

	public static UPDATE_BLOCK_COUNT = "UPDATE_BLOCK_COUNT"
	public static SHOW_NOTIFICATION = "SHOW_NOTIFICATION"
	public static UPDATE_COOKING_TOOL = "UPDATE_COOKING_TOOL"

	static getTarget() {
		if (!EventDispatcher.data) {
			EventDispatcher.data = new EventDispatcher()
		}
		return EventDispatcher.data.getEventTarget()
	}

	private getEventTarget() {
		return eventTarget
	}
}
