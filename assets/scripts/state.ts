import { _decorator, Component, Node } from "cc"
const { ccclass, property } = _decorator

export class gState {}

export const Config = {
	row: 7, // num in row
	col: 7, // num in col
	editorMode: 1,
	blockBoundingOffset: 10, // use in intersection check of block's inner bounding box
	orderInterval: 3, // create a new order after 5s of removing old one
}

export const State = {
	mode: 1, // 1: game mode, 0: editor mode
	currentLevel: 1,
	currentTool: null,
}

export const EDITOR_MODES = {
	1: "add block",
	2: "delete block",
	3: "add grid",
	4: "delete grid",
}

/**
 * level config
 */
export const LevelConfigs = [
	{
		level: 1, // level name
		limit: 2, // 限制的花色数，including `include`
		includes: ["pan", "rice"], // include specific imgs & count
		orders: [{ cuisine: "riceball", duration: [10, 15] }],
		goal: 15,
		value: [
			{ x: -200, y: 175 },
			{ x: -200, y: 125 },
			{ x: 0, y: 175 },
			{ x: 0, y: 125 },
			{ x: 201, y: 175 },
			{ x: 201, y: 125 },
			{ x: 0, y: -25 },
			{ x: 0, y: -75 },
			{ x: 201, y: -25 },
			{ x: 201, y: -75 },
			{ x: -200, y: -25 },
			{ x: -200, y: -75 },
			{ x: -200, y: -225 },
			{ x: -200, y: -275 },
			{ x: 0, y: -225 },
			{ x: 0, y: -275 },
			{ x: 201, y: -225 },
			{ x: 201, y: -275 },
		], // 坐标数组
	},
	{
		level: 2, // level name
		limit: 4, // 限制的花色数，including `include`
		includes: ["pot", "rice"], // include specific imgs & count
		orders: [{ cuisine: "riceball", duration: [10, 15] }],
		goal: 15,
		value: [
			{ x: -300, y: 298 },
			{ x: -300, y: 248 },
			{ x: -300, y: 198 },
			{ x: -300, y: 148 },
			{ x: -300, y: 98 },
			{ x: -200, y: 298 },
			{ x: -200, y: 248 },
			{ x: -200, y: 198 },
			{ x: -100, y: 298 },
			{ x: -100, y: 248 },
			{ x: -100, y: 198 },
			{ x: -100, y: 148 },
			{ x: -100, y: 98 },
			{ x: -100, y: 48 },
			{ x: -100, y: -2 },
			{ x: -100, y: -52 },
			{ x: 0, y: 298 },
			{ x: 0, y: 248 },
			{ x: 0, y: 198 },
			{ x: 0, y: 148 },
			{ x: 0, y: 98 },
			{ x: 0, y: 48 },
			{ x: 0, y: -2 },
			{ x: 0, y: -52 },
			{ x: 101, y: 298 },
			{ x: 101, y: 248 },
			{ x: 101, y: 198 },
			{ x: 101, y: 148 },
			{ x: 101, y: 98 },
			{ x: 101, y: 48 },
			{ x: 101, y: -2 },
			{ x: 101, y: -52 },
			{ x: 201, y: 298 },
			{ x: 201, y: 248 },
			{ x: 201, y: 198 },
			{ x: 201, y: 148 },
			{ x: 201, y: 98 },
			{ x: 201, y: 48 },
			{ x: 201, y: -2 },
			{ x: 201, y: -52 },
			{ x: 301, y: 298 },
			{ x: 301, y: 248 },
			{ x: 301, y: 198 },
			{ x: 301, y: 148 },
			{ x: 301, y: 98 },
			{ x: 301, y: 48 },
			{ x: 301, y: -2 },
			{ x: 301, y: -52 },
			{ x: -300, y: 98 },
			{ x: -300, y: 48 },
			{ x: -300, y: -2 },
			{ x: -300, y: -52 },
			{ x: -200, y: 198 },
			{ x: -200, y: 148 },
			{ x: -200, y: 98 },
			{ x: -200, y: 48 },
			{ x: -200, y: -2 },
			{ x: -200, y: -52 },
			{ x: -300, y: -152 },
			{ x: -250, y: -152 },
			{ x: -200, y: -152 },
			{ x: -150, y: -152 },
			{ x: -100, y: -152 },
			{ x: -50, y: -152 },
			{ x: 301, y: -152 },
			{ x: 251, y: -152 },
			{ x: 201, y: -152 },
			{ x: 151, y: -152 },
			{ x: 101, y: -152 },
			{ x: 50, y: -152 },
			{ x: -300, y: -252 },
			{ x: 301, y: -252 },
		],
	},
	{
		level: 3, // level name
		limit: 5, // 限制的花色数，including `include`
		includes: ["drinkmachine", "watermelon", "apple"], // include specific imgs & count
		value: [
			{ x: -300, y: 298 },
			{ x: -300, y: 248 },
			{ x: -300, y: 198 },
			{ x: -300, y: 148 },
			{ x: -300, y: 98 },
			{ x: -200, y: 298 },
			{ x: -200, y: 248 },
			{ x: -200, y: 198 },
			{ x: -100, y: 298 },
			{ x: -100, y: 248 },
			{ x: -100, y: 198 },
			{ x: -100, y: 148 },
			{ x: -100, y: 98 },
			{ x: -100, y: 48 },
			{ x: -100, y: -2 },
			{ x: -100, y: -52 },
			{ x: 0, y: 298 },
			{ x: 0, y: 248 },
			{ x: 0, y: 198 },
			{ x: 0, y: 148 },
			{ x: 0, y: 98 },
			{ x: 0, y: 48 },
			{ x: 0, y: -2 },
			{ x: 0, y: -52 },
			{ x: 101, y: 298 },
			{ x: 101, y: 248 },
			{ x: 101, y: 198 },
			{ x: 101, y: 148 },
			{ x: 101, y: 98 },
			{ x: 101, y: 48 },
			{ x: 101, y: -2 },
			{ x: 101, y: -52 },
			{ x: 201, y: 298 },
			{ x: 201, y: 248 },
			{ x: 201, y: 198 },
			{ x: 201, y: 148 },
			{ x: 201, y: 98 },
			{ x: 201, y: 48 },
			{ x: 201, y: -2 },
			{ x: 201, y: -52 },
			{ x: 301, y: 298 },
			{ x: 301, y: 248 },
			{ x: 301, y: 198 },
			{ x: 301, y: 148 },
			{ x: 301, y: 98 },
			{ x: 301, y: 48 },
			{ x: 301, y: -2 },
			{ x: 301, y: -52 },
			{ x: -300, y: 98 },
			{ x: -300, y: 48 },
			{ x: -300, y: -2 },
			{ x: -300, y: -52 },
			{ x: -200, y: 198 },
			{ x: -200, y: 148 },
			{ x: -200, y: 98 },
			{ x: -200, y: 48 },
			{ x: -200, y: -2 },
			{ x: -200, y: -52 },
			{ x: -300, y: -152 },
			{ x: -250, y: -152 },
			{ x: -200, y: -152 },
			{ x: -150, y: -152 },
			{ x: -100, y: -152 },
			{ x: -50, y: -152 },
			{ x: 301, y: -152 },
			{ x: 251, y: -152 },
			{ x: 201, y: -152 },
			{ x: 151, y: -152 },
			{ x: 101, y: -152 },
			{ x: 50, y: -152 },
			{ x: -300, y: -252 },
			{ x: 301, y: -252 },
		],
	},
]

export const getLevelConfig = (level: number) => {
	return LevelConfigs.find((item) => item.level === level)
}

export const getMaxLevelConfig = () => {
	return LevelConfigs[LevelConfigs.length - 1]
}
