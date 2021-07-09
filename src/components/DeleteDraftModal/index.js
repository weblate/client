import {useCallback} from 'react';
import {useSelector} from 'react-redux';

import {MdClose} from 'react-icons/md';

import Button from 'components/Button';
import Modal from '@ra/components/Modal';
import trash from 'assets/images/trash.png';

import {initDraftAnswers} from 'utils/dispatch';

import styles from './styles.scss';

const DeleteSurveyModal = (props) => {
    const {isVisible, onClose, onDelete} = props;

    const {title} = useSelector(state => state.draft);

    const handleDeleteDraft = useCallback(async () => {
        initDraftAnswers();
        onClose && onClose();
        onDelete && onDelete();
    }, [onClose, onDelete]);

    if (!isVisible) {
        return null;
    }

    return (
        <Modal className={styles.modal}>
            <div className={styles.header}>
                <h2 className={styles.title}>Delete Draft</h2>
                <div className={styles.closeContainer} onClick={onClose}>
                    <MdClose size={20} className={styles.closeIcon} />
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.deleteContent}>
                    <img
                        className={styles.deleteImage}
                        src={trash}
                        alt='trash bin'
                    />
                    <p className={styles.deleteText}>
                        This will delete your draft of the survey - {title}
                    </p>
                </div>
                <div className={styles.buttons}>
                    <Button onClick={onClose} type='button' secondary>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteDraft}>
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteSurveyModal;