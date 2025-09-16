import ChangEmailForm from './components/ChangeEmail'
import ChangePasswordForm from './components/ChangePassword'

const Account = () => {
    return (
        <div style={{  margin: '0 auto', padding: '20px' }}>
            <ChangEmailForm />
            <ChangePasswordForm />
        </div>
    )
}

export default Account
