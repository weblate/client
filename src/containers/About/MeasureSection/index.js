import measure from 'assets/images/measure.webp';

import styles from './styles.scss';

const MeasureSection = () => {
    return (
        <div className={styles.measureContainer}>
            <div className={styles.measureInfo}>
                <h2 className={styles.measureTitle}>
                        What does the NEAT+ measure? 
                </h2>
                <p className={styles.measureDesc}>
                        The NEAT+ assists in flagging environmental issues of high, medium, and low concern based on project-level information, and provides subsequent mitigation tips for addressing these issues. It is not a carbon footprint tool and does not replace the need for a full project environmental impact assessment. 
                </p>
            </div>
            <div className={styles.measureImageWrapper}>
                <img className={styles.measureImage} src={measure} alt="measure" />
            </div>
        </div>  
    );
};

export default MeasureSection;
