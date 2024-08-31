// genrate BlockMap
const fs = require("fs")
const path = require("path")

// 定义一个函数来生成映射对象
const generateMap = () => {
	// 定义一个对象来存储结果
	const map = {}

	// 定义子目录名称
	const subDirs = ["food", "tool", "cuisine"]

	// 遍历每个子目录
	subDirs.forEach((subDir) => {
		// 获取子目录的路径
		const dirPath = path.join(__dirname, "assets/src/imgs", subDir)

		// 读取目录中的所有文件
		const files = fs.readdirSync(dirPath)

		try {
			// 遍历文件并构建映射
			files.forEach((file) => {
				// 获取文件的扩展名
				const ext = path.extname(file).toLowerCase()
				// 检查文件是否为图片（这里假设图片文件以.jpg, .png 等结尾）
				if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(ext)) {
					// 从文件名中移除扩展名
					const name = path.basename(file, ext)
					// 将图片名和类型添加到映射对象中
					map[name] = { name, type: subDir }
				}
			})
		} catch (err) {
			console.error("读取目录失败：", err)
		}
	})

	console.log(map)

	// 将 map 对象转换为字符串
	const mapString = `export const BlockMap = ${JSON.stringify(map, null, 2)};`

	// 定义新文件的路径
	const outputFilePath = path.join(__dirname, "BlockMap.ts")

	try {
		// 将 map 字符串写入文件
		fs.writeFileSync(outputFilePath, mapString)
		console.log(`文件已写入：${outputFilePath}`)
	} catch (err) {
		console.error("写入文件失败：", err)
	}

	// 所有文件读取完毕后返回映射对象
	return map
}

generateMap()
