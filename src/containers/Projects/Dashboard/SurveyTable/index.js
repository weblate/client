import {useCallback} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {BsPlus, BsArrowRight} from 'react-icons/bs';

import Button from 'components/Button';
import OptionsDropdown from 'components/OptionsDropdown';
import Table from '@ra/components/Table';

import styles from './styles.scss';

const surveyColumns = [
    {
        Header: 'Name',
        accessor: 'title',
    }, 
    {
        Header: 'Created on',
        accessor: 'createdAt',
    },
    {
        Header: 'Options',
        accessor: '',
    },
];

const HeaderItem = ({column}) => {
    if(column.Header==='Options') {
        return '';
    }
    return column.Header;
};

export const DataItem = ({item, column}) => {
    const handleEditClick = useCallback(() => {
        //TODO: Edit Survey Functionality
    }, []);

    const handleDeleteClick = useCallback(() => {
        // TODO: Delete Survey Functionality
    }, []);

    const stopEventBubbling = useCallback(e => e.stopPropagation(), []);

    if(column.Header==='Name') {
        return <div className={styles.nameItem}>{item[column.accessor]}</div>;
    }
    if(column.Header==='Created on') {
        const date = new Date(item[column.accessor]);
        return date.toLocaleDateString();
    }
    if(column.Header==='Options') {
        return (
            <div onClick={stopEventBubbling}>
                <OptionsDropdown 
                    onEdit={handleEditClick} 
                    onDelete={handleDeleteClick} 
                />
            </div>
        );
    }
    return item[column.accessor];
};

const SurveyTable = ({onTakeSurveyClick}) => {
    const {projectId} = useParams();

    const history = useHistory();

    const {surveys} = useSelector(state => state.survey);
    const surveyData = surveys.filter(el => el.project === +projectId);

    const handleMoreClick = useCallback(() => history.push('surveys/'), [history]);
    const handleSurveyClick = useCallback(survey => {
        history.push(`surveys/${survey.id}`);
    }, [history]);

    return (
        <div className={styles.surveys}>
            <div className={styles.surveyHeader}>
                <h3 className={styles.surveyTitle}>Surveys</h3>
                <Button outline onClick={onTakeSurveyClick} className={styles.button}>
                    <BsPlus size={20} className={styles.buttonIcon} /> Take Survey
                </Button>
            </div>
            <p className={styles.subTitle}>{surveyData.length} surveys</p>
            <div className={styles.surveyTable}>
                <Table 
                    className={styles.table} 
                    data={surveyData} 
                    columns={surveyColumns} 
                    maxRows={10}
                    renderHeaderItem={HeaderItem}
                    renderDataItem={DataItem}
                    headerClassName={styles.tableHeader}
                    headerRowClassName={styles.headerRow}
                    bodyClassName={styles.tableBody}
                    bodyRowClassName={styles.bodyRow}
                    onRowClick={handleSurveyClick}
                /> 
            </div>
            <Button className={styles.buttonBottom} secondary outline onClick={handleMoreClick}>
                More Details <BsArrowRight size={20} className={styles.buttonBottomIcon} />
            </Button>
        </div> 
    );
};

export default SurveyTable;
