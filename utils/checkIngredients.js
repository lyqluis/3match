// genrate BlockMap
const fs = require("fs")
const path = require("path")

/**
 * @func:
 * @param {string} filePath
 * @return {string[]}
 */
function readAndParseTSFile(filePath) {
	const tsContent = fs.readFileSync(filePath, "utf-8")
	// 使用正则表达式提取 state 对象
	const stateRegex = /ingredients: (\[.*\])\,/g
	const stateMatch = tsContent.matchAll(stateRegex)

	const arr = []
	// console.log(stateMatch)
	for (const match of stateMatch) {
		// console.log(match)
		const stateString = match[1]
		const state = JSON.parse(stateString)
		arr.push(...state)
	}

	const res = [...new Set(arr)]
	// console.log(res)
	return res
}

// 获取目录中的所有 PNG 文件
function getAllPngFiles(dirPath) {
	return fs
		.readdirSync(dirPath)
		.filter((file) => path.extname(file).toLowerCase() === ".png")
}

// 主函数
function main() {
	const tsFilePath = path.resolve(__dirname, "../assets/scripts/stateMap.ts")
	const pngDirPath = path.resolve(__dirname, "../assets/resources/imgs/food")

	// 读取并解析 a.ts 文件
	// 提取所有 ingredients 属性并合并成一个数组
	const ingredientsArray = readAndParseTSFile(tsFilePath)

	// 读取目录中的所有 PNG 文件
	const pngFiles = getAllPngFiles(pngDirPath)

	// 核对字符串与 PNG 文件
	const missingFiles = ingredientsArray.filter(
		(ingredient) => !pngFiles.includes(`${ingredient}.png`)
	)

	if (missingFiles.length > 0) {
		console.log("以下文件在目录中缺失：", missingFiles)
	} else {
		console.log("所有文件都存在。")
	}
}

main()
