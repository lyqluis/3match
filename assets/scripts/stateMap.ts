export const CuisineMap = {
	steak: {
		name: "steak",
		title: "牛排",
		ingredients: ["beef"],
		tool: "pan",
		duration: 10,
		price: 20,
	},
	riceball: {
		name: "riceball",
		title: "饭团",
		ingredients: ["rice"],
		tool: "pan",
		duration: 5,
		price: 5,
	},
	fries: {
		name: "fries",
		title: "薯条",
		ingredients: ["potato"],
		tool: "pot",
		duration: 7,
		price: 10,
	},
	salad: {
		name: "salad",
		title: "沙拉",
		ingredients: ["cabbage", "onion"], // 食材
		tool: "pan",
		duration: 7,
		price: 20,
	},
	skewer: {
		name: "skewer",
		title: "烤肉串",
		ingredients: ["beef", "onion"],
		tool: "pan",
		duration: 10,
		price: 30,
	},
	chaomian: {
		name: "chaomian",
		title: "炒面",
		ingredients: ["noodle", "onion"],
		tool: "pan",
		duration: 8,
		price: 15,
	},
	lamian: {
		name: "lamian",
		title: "拉面",
		ingredients: ["noodle", "egg"],
		tool: "pot",
		duration: 10,
		price: 25,
	},
	steakandchiken: {
		name: "steakandchiken",
		title: "混合烤肉",
		ingredients: ["chiken", "beef", "onion"],
		tool: "pan",
		duration: 15,
		price: 50,
	},
	rubbish: {
		name: "rubbish",
		title: "黑暗料理",
		ingredients: [],
		tool: "",
		duration: 7,
		price: 0,
	},
}

const createEncodeMap = (cuisineMap = CuisineMap) => {
	for (const key in cuisineMap) {
		const cuisine = cuisineMap[key]
		const id = cuisine.tool + cuisine.ingredients.sort().join("")
		cuisine.id = id
		cuisine.type = "cuisine"
	}
	return cuisineMap
}

export const cuisineMap = createEncodeMap()

export const findCuisineById = (id: string) => {
	for (const key in cuisineMap) {
		if (cuisineMap[key].id === id) {
			return cuisineMap[key]
		}
	}
	return cuisineMap.rubbish
}
