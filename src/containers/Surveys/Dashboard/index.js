import {useState, useCallback, useMemo} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {BiChevronLeft, BiEditAlt} from 'react-icons/bi';
import {BsArrowCounterclockwise} from 'react-icons/bs';
import {FiFilter} from 'react-icons/fi';
import {MdClose} from 'react-icons/md';

import Button from 'components/Button';
import RestoreItemsModal from 'components/RestoreItemsModal';
import List from '@ra/components/List';
import CheckboxInput from '@ra/components/Form/CheckboxInput';
import {Localize} from '@ra/components/I18n';
import {_} from 'services/i18n';

import cs from '@ra/cs';
import usePromise from '@ra/hooks/usePromise';
import {getErrorMessage} from '@ra/utils/error';

import useInitActiveProject from 'hooks/useInitActiveProject';
import useInitActiveSurvey from 'hooks/useInitActiveSurvey';

import Api from 'services/api';
import Toast from 'services/toast';
import {setEditMode, applyRemoveItems, setFilters} from 'store/actions/dashboard';

import SurveyTabs from './SurveyTabs';

import styles from './styles.scss';

const keyExtractor = item => item.id;

const IssuesBox = ({showIssues, onClose}) => {
    const dispatch = useDispatch();

    const {
        statementTagGroups, 
        statementTags
    } = useSelector(state => state.statement);
    const {filters} = useSelector(state => state.dashboard);

    const [selectedIssues, setSelectedIssues] = useState(filters);

    const handleChangeIssue = useCallback(({checked, id}) => {
        const issueId = +id?.split('-')?.[1];
        if(checked && issueId) {
            setSelectedIssues([...selectedIssues, issueId]);
        } else {
            setSelectedIssues(selectedIssues.filter(el => el !== issueId));
        }
    }, [selectedIssues]);
    
    const handleApplyFilter = useCallback(() => {
        dispatch(setFilters(selectedIssues));
        onClose && onClose();
    }, [dispatch, selectedIssues, onClose]);

    const renderIssueItem = useCallback(({item}) => {
        const issueId = `issue-${item.id}`;

        return (
            <div className={styles.issueItem}>
                <CheckboxInput
                    checked={selectedIssues.some(el => item.id===el)}
                    onChange={handleChangeIssue}
                    size={18}
                    id={issueId} 
                    className={styles.checkbox} 
                />
                <label htmlFor={issueId}>{item.title}</label>
            </div>
        );
    }, [handleChangeIssue, selectedIssues]);

    // TODO: Handle multiple tag groups
    const tagGroup = useMemo(() => statementTagGroups[0], [statementTagGroups]);
    const tags = useMemo(() => 
        statementTags?.filter(el => tagGroup && el.group === tagGroup?.id) || [], 
    [statementTags, tagGroup]);

    const handleToggleAll = useCallback(() => {
        if(selectedIssues.length===tags.length) {
            return setSelectedIssues([]);
        }
        setSelectedIssues(tags.map(el => el.id));
    }, [tags, selectedIssues]);

    if(!showIssues) {
        return null;
    }

    return (
        <div className={styles.issuesContainer}>
            <div className={styles.issuesHeader}>
                <p className={styles.title}>{tagGroup?.title}</p>
                <div className={styles.closeContainer} onClick={onClose}>
                    <MdClose size={20} className={styles.closeIcon} />
                </div>
            </div>
            <List
                className={styles.issues}
                data={tags}
                keyExtractor={keyExtractor}
                renderItem={renderIssueItem}
            />
            <div className={styles.issuesFooter}>
                <Button className={styles.button} onClick={handleApplyFilter}>
                    <Localize>Apply</Localize>
                </Button>
                <div className={styles.allControl} onClick={handleToggleAll}>
                    {selectedIssues.length===tags.length ? _('Clear') : _('Select All')}
                </div>
            </div>
        </div>
    );
};

const SurveyDashboard = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    useInitActiveProject();
    useInitActiveSurvey();

    const {
        isEditMode, 
        itemsToRemove,
        removedItems,
        filters,
    } = useSelector(state => state.dashboard);

    const activateEditMode = useCallback(() => dispatch(setEditMode(true)), [dispatch]);
    const deactivateEditMode = useCallback(() => dispatch(setEditMode(false)), [dispatch]);

    const [{loading}, saveSurveyConfig] = usePromise(Api.patchSurvey);

    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showIssues, setShowIssues] = useState(false);

    const handleTabChange = useCallback(payload => {
        history.push(`#${payload.activeTab}`);
        deactivateEditMode();
    }, [deactivateEditMode, history]);

    const {activeProject} = useSelector(state => state.project);
    const {activeSurvey} = useSelector(state => state.survey);

    const activeTab = useMemo(() => {
        if(!window.location.hash) {
            return 'overview';
        }
        return window.location.hash.replace('#', '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.location.hash]);

    const toggleRestoreModal = useCallback(() => 
        setShowRestoreModal(!showRestoreModal), 
    [showRestoreModal]);

    const toggleIssues = useCallback(() =>
        setShowIssues(!showIssues),
    [showIssues]);

    const handleSaveClick = useCallback(async () => {
        try {
            const newRemovedItems = [...removedItems, ...itemsToRemove];
            await saveSurveyConfig(activeSurvey.id, {
                config: JSON.stringify({removedItems: newRemovedItems}),
            });
            dispatch(applyRemoveItems(newRemovedItems));

        } catch (error) {
            Toast.show(getErrorMessage(error), Toast.DANGER);
            console.log(error);
        }
    }, [dispatch, removedItems, itemsToRemove, saveSurveyConfig, activeSurvey]);

    const handleClearFilters = useCallback(() => dispatch(setFilters([])), [dispatch]);

    const renderHeaderControls = useCallback(tabHeaderProps => {
        if(activeTab === 'overview') {
            return null;
        }

        if(isEditMode) {
            return (
                <div className={styles.headerControls}>
                    <Button 
                        className={styles.controlButton} 
                        onClick={toggleRestoreModal}
                    >
                        <BsArrowCounterclockwise size={20} className={styles.controlIcon} />
                        <Localize>Restore</Localize>
                    </Button>
                    <Button
                        loading={loading}
                        disabled={!itemsToRemove.length}
                        onClick={handleSaveClick}
                        className={styles.saveButton}
                    >
                        <Localize>Save</Localize>
                    </Button>
                </div>
            );
        }

        return (
            <div className={styles.headerControls}>
                <Button className={styles.controlButton} onClick={activateEditMode}>
                    <BiEditAlt size={20} className={styles.controlIcon} />
                    <Localize>Edit</Localize>
                </Button>
                <Button 
                    className={cs(styles.controlButton, {
                        [styles.controlButtonActive]: filters?.length
                    })} 
                    onClick={toggleIssues}
                >
                    {filters?.length ? (
                        <div className={styles.filterCount}>
                            {filters.length}
                        </div>
                    ) : (
                        <FiFilter size={18} className={styles.controlIcon} />
                    )}
                    <Localize>Filters</Localize>
                </Button>
                <IssuesBox onClose={toggleIssues} showIssues={showIssues} />
                {filters?.length > 0 && (
                    <div className={styles.clearText} onClick={handleClearFilters}>
                        <Localize>Clear All</Localize>
                    </div>
                )}
            </div>
        );
    }, [
        activeTab, 
        activateEditMode, 
        toggleRestoreModal, 
        isEditMode, 
        handleSaveClick,
        itemsToRemove,
        showIssues,
        toggleIssues,
        filters,
        handleClearFilters,
        loading,
    ]);

    return (
        <div className={styles.container}>
            {isEditMode ? (
                <div onClick={deactivateEditMode} className={styles.backLink}>
                    <div className={styles.closeIconContainer}>
                        <MdClose size={18} className={styles.closeIcon} />
                    </div>
                    <Localize>Close Edit Mode</Localize>
                </div>
            ) : activeProject ? (
                <Link 
                    to={`/projects/${activeProject.id}/surveys/`} 
                    className={cs(styles.backLink, 'no-print')}
                >
                    <BiChevronLeft 
                        size={22} 
                        className={styles.backIcon} 
                    /> <Localize>Back to Surveys</Localize>
                </Link>
            ) : null}
            <SurveyTabs 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                renderHeaderControls={renderHeaderControls}
            />
            <RestoreItemsModal 
                isVisible={showRestoreModal} 
                onClose={toggleRestoreModal} 
            />
        </div>
    ); 
};

export default SurveyDashboard;
