import React from 'react';

import {MdClose} from 'react-icons/md';

import Modal from '@ra/components/Modal';

import styles from './styles.scss';

const CountryWorkModal = (props) => {
    const {isVisible, onClose, title, image, description} = props;

    if (!isVisible) {
        return null;
    }

    return (
        <Modal className={styles.modal}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <button className={styles.closeContainer} onClick={onClose}>
                    <MdClose className={styles.closeIcon} />
                </button>
            </div>
            <div className={styles.content}>
                <img src={image} alt={title} className={styles.image} />
                <p className={styles.description}>{description}</p>
            </div>
        </Modal>
    );
};

export default CountryWorkModal;
