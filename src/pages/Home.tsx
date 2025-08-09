import {Navigate} from 'react-router'
import {Head} from '@/components/Head'

export function Home() {
	return (
		<>
			<Head title='Sorcerify' />
			<Navigate replace={true} to='/daily' />
		</>
	)
}
