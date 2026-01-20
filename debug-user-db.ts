import { DataSource } from 'typeorm'
import { User } from './backend/src/user/user.entity'
import * as path from 'path'

const AppDataSource = new DataSource({
	type: 'sqlite',
	database: path.resolve(__dirname, 'backend/travel.sqlite'),
	entities: [User],
	synchronize: false,
})

async function checkUser() {
	await AppDataSource.initialize()
	const repo = AppDataSource.getRepository(User)

	// Find the user seen in logs
	const user = await repo.findOne({
		where: { email: '23131313213@qq.com' },
	})

	console.log('--- DB RECORD ---')
	if (user) {
		console.log('User ID:', user.id)
		console.log('Nickname:', user.nickname)
		console.log('Preferences:', JSON.stringify(user.preferences, null, 2))
	} else {
		console.log('User not found!')
	}

	await AppDataSource.destroy()
}

checkUser().catch(console.error)
