import {useCallback} from 'react';
import {MdClose} from 'react-icons/md';

import Button from 'components/Button';

import SecureTextInput from '@ra/components/Form/SecureTextInput';
import Form, {InputField} from '@ra/components/Form';
import Modal from '@ra/components/Modal';
import withVisibleCheck from '@ra/components/WithVisibleCheck';
import {Localize} from '@ra/components/I18n';
import {_} from 'services/i18n';

import Toast from 'services/toast';
import {getErrorMessage} from '@ra/utils/error';

import styles from './styles.scss';

const ConfirmPasswordModal = props => {
    const {onClose, loading, onSubmit} = props;

    const handleSubmit = useCallback(async ({password}) => {
        try {
            await onSubmit(password);
        } catch(error) {
            if(error.password?.[0]) {
                return Toast.show(error.password[0], Toast.DANGER);
            }
            Toast.show(getErrorMessage(error), Toast.DANGER);
        }
    }, [onSubmit]);

    return (
        <Modal className={styles.modal}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <Localize>Confirm your password</Localize>
                </h2>
                <div className={styles.closeContainer} onClick={onClose}>
                    <MdClose size={20} className={styles.closeIcon} />
                </div>
            </div>
            <Form onSubmit={handleSubmit} className={styles.content}>
                <InputField 
                    name="password"
                    required
                    component={SecureTextInput}
                    className={styles.input}
                    label={_('Password')}
                    labelClassName={styles.inputLabel}
                    containerClassName={styles.inputGroup}
                />
                <div className={styles.buttons}>
                    <Button 
                        type="button" 
                        secondary 
                        className={styles.button} 
                        onClick={onClose}
                    >
                        <Localize>Cancel</Localize>
                    </Button>
                    <Button 
                        loading={loading} 
                        className={styles.button}
                    >
                        <Localize>Continue</Localize>
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default withVisibleCheck(ConfirmPasswordModal);
