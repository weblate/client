import React, {useCallback, useMemo} from 'react';
import {FiUpload, FiChevronRight} from 'react-icons/fi';

import cs from '@ra/cs';
import {sleep} from '@ra/utils';

import StatementAccordion from 'components/StatementAccordion';
import ConcernCounter from 'components/Concerns/Chart/counter';

import List from '@ra/components/List';

import {getSeverityCounts} from 'utils/severity';

import styles from './styles.scss';

const keyExtractor = item => item.id;

const ConcernItem = (props) => {
    const {item, total} = props;
    return (
        <div className={styles.concernsItem}>
            <ConcernCounter dataItem={item} totalCount={total} />
            <div className={styles.concernInfo}>
                <p className={styles.concernNumber}>{item.count}</p>
                <p className={styles.concernLabel}>{item.severity} Concerns</p>
            </div>
        </div>
    );
};

const StatementsContent = ({statementData, index, topic, toggleExpand, expanded}) => {
    const severityCounts = useMemo(() => getSeverityCounts(statementData), [statementData]);

    const renderConcernItem = useCallback(listProps => {
        const total = severityCounts.reduce((acc, cur) => acc + cur.count, 0);
        return (
            <ConcernItem {...listProps} total={total} />
        );
    }, [severityCounts]);

    const renderStatementAccordion = useCallback(listProps => {
        return (
            <StatementAccordion 
                {...listProps} 
                isExpanded={expanded} 
            />
        );
    }, [expanded]);

    const handleExportPDF = useCallback(async () => {
        if(!expanded) {
            toggleExpand();
        }
        await sleep(200); //Allow all remaining renders to complete
        window.print();
    }, [toggleExpand, expanded]);

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.title}>{topic.title}</h3>
                {index === 0 && (
                    <div onClick={handleExportPDF} className={cs(styles.exports, 'no-print')}>
                        <FiUpload />
                        <span className={styles.exportsTitle}>Export PDF</span>
                    </div>
                )}
            </div>
            <div className={styles.infoWrapper}>
                <p className={styles.infoDesc}>
                    {topic.description}
                </p>
                <List
                    data={severityCounts}
                    className={styles.concerns}
                    keyExtractor={item => item.severity}
                    renderItem={renderConcernItem}
                />
            </div>
            <div className={styles.statementWrapper}>
                <div className={styles.statementHeader}>
                    <h4 className={styles.statementTitle}>statements</h4>
                    {index === 0 && (
                        <div onClick={toggleExpand} className={cs(styles.expandWrapper, 'no-print')}>
                            <span>{expanded ? 'Collapse' : 'Expand'} All</span>
                            <FiChevronRight />
                        </div>
                    )}
                </div>
                <List
                    data={statementData}
                    renderItem={renderStatementAccordion}
                    keyExtractor={keyExtractor}
                />
            </div>
        </section>
    );
};

export default StatementsContent;
