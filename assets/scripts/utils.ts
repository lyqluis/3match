import { Node, Prefab, resources, SpriteFrame, UITransform } from "cc"

export const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		// 随机生成一个小于 i 的整数 j
		const j = Math.floor(Math.random() * (i + 1))
		// 交换元素 array[i] 和 array[j]
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

type getTouchItemConfig = {
	parent: Node
	items: Node[]
	component?: UITransform
}
export const getTouchItem = (touchPosition, config: getTouchItemConfig) => {
	const { parent, items, component } = config
	// trans touch position (world position) to node space position (local position)
	const position = parent
		.getComponent(UITransform)
		.convertToNodeSpaceAR(touchPosition)
	// must loop in reverse order, because when deleting the upper blocks is first deleted
	for (let i = items.length - 1; i >= 0; i--) {
		const node = items[i]
		// block node is not active or is shadowed, continue
		// if (options.active && !node.active) continue
		const block = node.getComponent(component)
		// if (options.noShadow && !block.canTouch()) continue
		// if block's bounds contains localPosition, return block
		if (block.getBoundingBox().contains(new Vec2(pos.x, pos.y))) {
			return block
		}
	}
	return null
}

export const loadImage = async (path: string) => {
	return new Promise((resolve, reject) => {
		resources.load(path, SpriteFrame, (err, spriteFrame) => {
			if (err) reject(err)
			spriteFrame.reset({
				// @ts-ignore
				originalSize: {
					...spriteFrame.originalSize,
					width: spriteFrame.rect.width,
					height: spriteFrame.rect.height,
				},
			})
			console.log("load image finished", spriteFrame)
			resolve(spriteFrame)
		})
	})
}

export const loadPrefab = async (path: string) => {
	return new Promise((resolve, reject) => {
		resources.load(path, Prefab, (err, prefab) => {
			if (err) reject(err)
			console.log("load prefab finished", prefab)
			resolve(prefab)
		})
	})
}

// 原地变更父元素
export const setParentInPosition = (node: Node, newParent: Node) => {
	// const pos = node.getWorldPosition()
	// const newPos = newParent.getComponent(UITransform).convertToNodeSpaceAR(pos)
	// node.setParent(newParent)
	// node.setPosition(newPos)
	// or
	const pos = node.getWorldPosition()
	node.setParent(newParent)
	node.setWorldPosition(pos)
}
