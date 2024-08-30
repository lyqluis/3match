import { _decorator, Component, Node } from "cc"
const { ccclass, property } = _decorator

export class gState {}

export const State = {
	mode: 1, // 1: game mode, 0: editor mode
	row: 7, // num in row
	col: 8, // num in col
	editorMode: 1,
	blockBoundingOffset: 10, // use in intersection check of block's inner bounding box
	currentLevel: 1,
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
		limit: 3, // 限制的花色数，including `include`
		includes: ["pan"], // include specific imgs & count
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
		includes: ["spot", "rice"], // include specific imgs & count
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
]

export const getLevelConfig = (level: number) => {
	return LevelConfigs.find((item) => item.level === level)
}

export const getMaxLevelConfig = () => {
	return LevelConfigs[LevelConfigs.length - 1]
}
