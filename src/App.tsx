import {Suspense} from 'react'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'
import {Route, Routes} from 'react-router'
import {LoadingOrError} from '@/components/LoadingOrError'
import {Daily} from '@/pages/Daily'
import {Home} from '@/pages/Home'
import {Practice} from '@/pages/Practice'

function renderError({error}: FallbackProps) {
	return <LoadingOrError error={error} />
}

export function App() {
	return (
		<ErrorBoundary fallbackRender={renderError}>
			<Suspense fallback={<LoadingOrError />}>
				<Routes>
					<Route element={<Home />} index={true} />
					<Route element={<Daily />} path='/daily' />
					<Route element={<Practice />} path='/practice' />
				</Routes>
			</Suspense>
		</ErrorBoundary>
	)
}
