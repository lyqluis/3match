type BlockType = "food" | "meat" | "tool" | "vegetable" | "drink"

type Food = {
	type: BlockType
	name: string
	price: number
	fresh?: number // 新鲜度
}

type Cuisine = {
	name: string
	price: number
	foods: Food[]
	tool?: Tool
	time: number // 烹饪时间 s
	quality?: number // 品质
}

type Tool = {
	name: string
	type: "tool"
}

type BlockData = Tool | Food | Cuisine

type BlockRect = {
	x: number
	y: number
}

type Order = {
	time: number	// 倒计时时间 s
	cuisines: Cuisine[]	// 最多 2 个
	
}