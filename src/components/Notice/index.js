import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {IoClose} from 'react-icons/io5';
import {MdClose} from 'react-icons/md';

import Container from 'components/Container';

import Modal from '@ra/components/Modal';
import {Localize} from '@ra/components/I18n';

import Api from 'services/api';
import usePromise from '@ra/hooks/usePromise';
import cs from '@ra/cs';

import styles from './styles.scss';

const Notice = () => {
    const [{result}, getNotice] = usePromise(Api.getNotice);

    useEffect(() => {
        getNotice();
    }, [getNotice]);

    const notice = useMemo(() => result?.results?.find(el => el.isActive), [result]);

    const [showNotice, setShowNotice] = useState(true);
    const [showNoticeModal, setShowNoticeModal] = useState(false);

    const handleCloseClick = useCallback(() => setShowNotice(false), []);

    const handleToggleModal = useCallback(() => {
        setShowNoticeModal(!showNoticeModal);
    }, [showNoticeModal]);

    if(!notice) {
        return null;
    }

    return (
        <section className={cs(styles.noticeContainer, 'no-print')}>
            <Container primary>
                {showNotice && (
                    <div className={styles.topBar}>
                        <span>{notice.title}</span>
                        <div 
                            onClick={handleToggleModal} 
                            className={styles.moreLink}
                        >
                            <Localize>Learn more</Localize>
                        </div>
                        <div className={styles.closeIconContainer}>
                            <IoClose 
                                onClick={handleCloseClick} 
                                className={styles.closeIcon} 
                            />
                        </div>
                    </div>
                )}
            </Container>
            {showNoticeModal && (
                <Modal className={styles.modal}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{notice.title}</h2>
                        <button className={styles.closeContainer} onClick={handleToggleModal}>
                            <MdClose className={styles.modalCloseIcon} />
                        </button>
                    </div>
                    <div className={styles.content}>
                        <p className={styles.description}>{notice.description}</p>
                    </div>
                </Modal>
            )}
        </section>
    );
};

export default Notice;
