import CSButton from '~/components/CSButton'
import Nav from '~/components/Nav'

import Intro from './components/Intro'


const IndexPage = () => {
    return (
        <div className='relative'>
            <Nav />
            <Intro className='pt-16' />
            <CSButton />
        </div>
    )
}

export default IndexPage
