import { Node, Prefab, resources, Sprite, SpriteFrame, UITransform } from "cc"

export const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		// 随机生成一个小于 i 的整数 j
		const j = Math.floor(Math.random() * (i + 1))
		// 交换元素 array[i] 和 array[j]
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

export const loadImage = async (path: string): Promise<SpriteFrame> =>
	new Promise((resolve, reject) => {
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

export const preloadDirImages = (path: string) => {
	console.log("preload images", path)
	resources.preload(path, SpriteFrame)
}

export const loadDirImages = async (path: string): Promise<SpriteFrame[]> =>
	new Promise((resolve, reject) => {
		console.log("start load resources dir")
		resources.loadDir(path, SpriteFrame, function (err, assets) {
			if (err) reject(err)
			console.log("load images finished", path, assets)
			resolve(assets)
		})
	})

export const loadPrefab = async (path: string): Promise<Prefab> =>
	new Promise((resolve, reject) => {
		resources.load(path, Prefab, (err, prefab) => {
			if (err) reject(err)
			console.log("load prefab finished", prefab)
			resolve(prefab)
		})
	})

// 原地变更父元素
export const setParentInPosition = (node: Node, newParent: Node) => {
	const pos = node.getWorldPosition()
	node.setParent(newParent)
	node.setWorldPosition(pos)
}

export const randomNum = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min

export const setImageToNode = async (
	node: Node,
	type: string,
	name: string
) => {
	try {
		const spriteFrame = await loadImage(`imgs/${type}/${name}/spriteFrame`)
		node.getComponent(Sprite).spriteFrame = spriteFrame
	} catch (err) {
		console.error("load img error", err)
	}
}

export const changeImageSize = (
	node: Node,
	options: { max?: number; maxHeight?: number; maxWidth?: number }
) => {
	// find the bigger one in width or height
	const uiTransform = node.getComponent(UITransform)
	const { width, height } = uiTransform
	const k = options.maxHeight
		? options.maxHeight / height
		: options.maxWidth
		? options.maxWidth / width
		: options.max
		? options.max / Math.max(width, height)
		: 1

	uiTransform.setContentSize(width * k, height * k)
	// uiTransform.width = width * k
	// uiTransform.height = height * k
}
export const formateNumber = (n: number) => (n >= 1000 ? n / 1000 + "k" : n)
