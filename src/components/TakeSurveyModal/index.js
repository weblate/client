import {useCallback, useState, useMemo, useRef, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';

import {MdClose} from 'react-icons/md';
import {BsArrowLeft, BsArrowRight, BsCheck} from 'react-icons/bs';
import {RiSkipBackLine, RiSkipForwardLine} from 'react-icons/ri';
import {IoIosArrowDropright, IoIosArrowDropleft} from 'react-icons/io';

import Button from 'components/Button';
import Modal from '@ra/components/Modal';
import List from '@ra/components/List';
import {Localize} from '@ra/components/I18n';
import withVisibleCheck from '@ra/components/WithVisibleCheck';

import {_} from 'services/i18n';

import useRequest from 'hooks/useRequest';
import CompletedTaskImage from 'assets/images/completed-task.svg';
import NoSurveyImage from 'assets/images/no-survey.svg';

import cs from '@ra/cs';
import {getErrorMessage} from '@ra/utils/error';
import {calculateSurveyResults} from 'utils/calculation';
import {initDraftAnswers} from 'utils/dispatch';
import {AVAILABLE_SURVEY_MODULES} from 'utils/config';

import Api from 'services/api';
import Toast from 'services/toast';
import * as questionActions from 'store/actions/question';
import * as draftActions from 'store/actions/draft';

import Question from './Question';
import InitSurvey from './InitSurvey';
import styles from './styles.scss';

const keyExtractor = item => item.id;

const QuestionGroupItem = props => {
    const {
        item,
        index,
        onItemClick,
        activeGroupId,
        incompleteQuestionGroups,
        isTouched,
    } = props;

    const handleItemClick = useCallback(() => {
        if(isTouched) {
            onItemClick && onItemClick(index);
        }
    }, [index, onItemClick, isTouched]);

    return (
        <p className={cs(styles.groupItem, {
            [styles.groupItemIncomplete]: isTouched && incompleteQuestionGroups.some(grp => grp.id === item.id),
            [styles.groupItemActive]: item.id===activeGroupId,
            [styles.groupItemActiveIncomplete]: item.id === activeGroupId && incompleteQuestionGroups.some(grp => grp.id === item.id),
            [styles.groupItemUntouched]: !isTouched,
        })} onClick={handleItemClick}>
            {item.title}
        </p>
    );
}; 

const GroupContent = props => {
    const {answers} = useSelector(state => state.question);

    const {
        activeGroup,
        questions,
        onPreviousClick,
        onNextClick,
        showPrevious,
        showNext,
        showRequired,
        editable
    } = props;

    const questionsRef = useRef(new Array(questions.length));

    const handleNextClick = useCallback(() => {
        const quesIdx = questions.findIndex(que =>
            que.isRequired &&
            answers &&
            !answers?.some(ans => ans.question === que.id));
        if(quesIdx!==-1) {
            const scrollTop = questionsRef.current.slice(0, quesIdx).reduce((acc, cur) => {
                return acc + cur.offsetHeight;
            }, 1);
            return onNextClick(scrollTop);
        }
        onNextClick();
    }, [onNextClick, answers, questions]);

    const renderQuestion = useCallback(listProps => {
        return (
            <Question 
                ref={el => questionsRef.current[listProps.index] = el}
                editable={editable} 
                showRequired={showRequired} 
                {...listProps} 
            />
        );
    }, [showRequired, editable]);

    return (
        <>
            <div className={styles.languageSelect}>English</div>
            <h3 className={styles.contentTitle}>{activeGroup?.title}</h3>
            <List
                data={questions}
                renderItem={renderQuestion}
                keyExtractor={keyExtractor}
                
            />
            <div className={styles.buttons}>
                {showPrevious && (
                    <Button
                        secondary 
                        className={styles.button} 
                        onClick={onPreviousClick}
                    >
                        <BsArrowLeft size={22} className={styles.buttonIconLeft} />
                        <Localize>Previous</Localize>
                    </Button>
                )}
                {showNext && (
                    <Button 
                        className={cs(styles.button, styles.buttonNext)} 
                        onClick={handleNextClick}
                    >
                        <Localize>Next</Localize>
                        <BsArrowRight size={22} className={styles.buttonIconRight} />
                    </Button>
                )}
            </div>
        </> 
    );
};

const TakeSurveyModal = (props) => {
    const contentRef = useRef();

    const dispatch = useDispatch();
    const {activeSurvey} = useSelector(state => state.survey);
    const {
        title: surveyTitle, 
        projectId: draftProjectId,
        moduleCode: draftCode,
        surveyId: draftSurveyId,
    } = useSelector(state => state.draft);

    const {
        isVisible, 
        onClose, 
        editable = true, 
        clone,
        code,
    } = props;

    const params = useParams();

    const {
        questionGroups: allQuestionGroups, 
        questions, 
        status, 
        answers
    } = useSelector(state => state.question);

    const moduleCode = useMemo(() => !editable ? code : draftCode ?? code, [editable, draftCode, code]);

    useEffect(() => {
        if(!surveyTitle && moduleCode!=='sens') {
            dispatch(draftActions.setTitle(activeSurvey?.title));
        }
    }, [activeSurvey, dispatch, moduleCode, isVisible, surveyTitle]);

    const [{loading}, createSurvey] = useRequest(
        `/project/${draftProjectId}/create_survey/`, 
        {method: 'POST'}
    );
    const [{loading: addingAnswers}, addSurveyAnswers] = useRequest(
        `/survey/${draftSurveyId}/add_answers/`,
        {method: 'POST'}
    );
    const [{loading: addingResults}, addSurveyResults] = useRequest(
        `/survey/${draftSurveyId}/add_results/`,
        {method: 'POST'}
    );

    const questionGroups = useMemo(() => {
        return allQuestionGroups.filter(group => {
            return questions[moduleCode]?.some(que => que.group === group.id);
        });
    }, [moduleCode, allQuestionGroups, questions]);

    const [activeGroupIndex, setActiveGroupIndex] = useState(0);
    const [showRequired, setShowRequired] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed]);

    const [error, setError] = useState(null);

    const activeGroup = questionGroups[activeGroupIndex];
    const activeQuestions = useMemo(() => questions[moduleCode]?.filter(ques => 
        ques.group === activeGroup?.id
    ) || [], [questions, activeGroup, moduleCode]);

    const handlePreviousClick = useCallback(() => 
        setActiveGroupIndex(activeGroupIndex - 1), 
    [activeGroupIndex]
    );
    const handleNextClick = useCallback((scrollTop) => {
        if(editable && activeQuestions.some(ques => 
            ques.isRequired && 
            answers && 
            !answers?.some(ans => ans.question === ques.id))
        ) {
            if(scrollTop) {
                contentRef.current.scrollTo({top: scrollTop, behavior: 'smooth'});
            }
            setShowRequired(true);
        }
        if(!clone && editable) {
            dispatch(draftActions.setDraftAnswers(answers));
        }
        setActiveGroupIndex(activeGroupIndex + 1);
        contentRef.current.scrollTo({top: 0, behavior: 'smooth'});
    }, [
        activeGroupIndex, 
        activeQuestions, 
        answers, 
        editable, 
        dispatch,
        clone,
    ]);

    const isFormIncomplete = useMemo(() => {
        if(!editable) {
            return false;
        }
        return questions[moduleCode]?.some(ques =>
            ques.isRequired &&
            answers &&
            !answers?.some(ans => ans.question === ques.id));
    }, [questions, answers, editable, moduleCode]);

    const handleFirstIndex = useCallback(() => setActiveGroupIndex(0), []);
    const handleLastIndex = useCallback(() => 
        setActiveGroupIndex(questionGroups.length),
    [questionGroups]
    );

    const handleQuestionGroupClick = useCallback((idx) => {
        if(editable && idx > activeGroupIndex) {
            setShowRequired(true);
        }
        setActiveGroupIndex(idx);
        contentRef.current.scrollTo({top: 0, behavior: 'smooth'});
    }, [activeGroupIndex, editable]);

    const handleClose = useCallback(() => {
        if(editable) {
            dispatch(draftActions.setDraftAnswers(answers));
        }
        dispatch(questionActions.setAnswers([]));
        onClose && onClose();
    }, [onClose, editable, dispatch, answers]);

    const handleValidate = useCallback(async () => {
        setError(null);
        try {
            const results = calculateSurveyResults(answers, moduleCode);
            const project = draftProjectId;
            const submissionAnswers = answers.map(ans => {
                if(ans.formattedAnswer) {
                    delete ans.formattedAnswer;
                }
                return ans;
            }, []);
            if(moduleCode==='sens') {
                const response  = await createSurvey({
                    title: surveyTitle,
                    answers: submissionAnswers,
                    project,
                    results,
                });
                Toast.show(response?.detail || _('Survey complete!'), Toast.SUCCESS);
            } else {
                await addSurveyAnswers(answers);
                const response = await addSurveyResults(results);
                Toast.show(response?.detail || _('Survey complete!'), Toast.SUCCESS);
            }
            dispatch(questionActions.setAnswers([]));
            initDraftAnswers(null);
            handleClose();
            Api.getSurveys();
            if(+params.projectId === draftProjectId) {
                Api.getSurveyDetails(draftProjectId);
            }
        } catch(err) {
            setError(err);
            console.log(err);
        }
    }, [
        answers, 
        createSurvey, 
        handleClose, 
        dispatch,
        draftProjectId,
        surveyTitle,
        params,
        moduleCode,
        addSurveyAnswers,
        addSurveyResults,
    ]);

    const incompleteQuestionGroups = useMemo(() => {
        if(!editable) {
            return [];
        }
        return questionGroups.filter(grp => {
            return questions[moduleCode]?.some(ques => ques && ques.group === grp.id && ques.isRequired && answers &&
                !answers?.some(ans => ans.question === ques.id));
        });
    }, [answers, moduleCode, questionGroups, questions, editable]);

    const answeredGroups = useMemo(() => {
        if(!editable) {
            return questionGroups;
        }
        return questionGroups.filter(grp => {
            return questions[moduleCode]?.some(ques => ques && ques.group === grp.id && answers?.some(ans => ans.question === ques.id));
        });
    }, [editable, answers, moduleCode, questions, questionGroups]);

    const maxTouchedGroupIndex = useMemo(() => {
        const answeredGroupIds = answeredGroups.map(item => item.id);
        if(answeredGroupIds.length > 0) {
            const maxAnsweredGroupId = Math.max(...answeredGroupIds);
            return questionGroups.findIndex(grp => grp.id === maxAnsweredGroupId);
        }
        return 0;
    }, [answeredGroups, questionGroups]);

    const touchedGroupIndexes = useRef([...Array(maxTouchedGroupIndex + 1).keys()]);

    useEffect(() => {
        if(activeGroupIndex && !touchedGroupIndexes.current.some(el => el === activeGroupIndex)) {
            touchedGroupIndexes.current.push(activeGroupIndex);
        }
    }, [activeGroupIndex]);

    const renderQuestionGroupItem = useCallback(listProps => (
        <QuestionGroupItem 
            {...listProps}
            activeGroupId={activeGroup?.id}
            incompleteQuestionGroups={incompleteQuestionGroups}
            onItemClick={handleQuestionGroupClick}
            isTouched={touchedGroupIndexes.current?.some(grpIdx => grpIdx === listProps.index)}
            showRequiredError={listProps.index !== maxTouchedGroupIndex}
        />
    ), [activeGroup, incompleteQuestionGroups, handleQuestionGroupClick, maxTouchedGroupIndex]);

    if(!surveyTitle && editable && moduleCode==='sens') {
        return (
            <InitSurvey 
                clone={clone}
                questionsStatus={status}
                isVisible={!surveyTitle} 
                onClose={onClose} 
            />
        );
    }

    return (
        <Modal className={styles.modal}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    {editable ? surveyTitle : activeSurvey?.title}
                </h2>
                <div className={styles.closeContainer} onClick={handleClose}>
                    <MdClose size={20} className={styles.closeIcon} />
                </div>
            </div>
            <div className={styles.progressContainer}>
                <div 
                    className={styles.progress} 
                    style={{
                        width: activeGroupIndex / questionGroups.length * 100 + '%',
                    }} 
                />
            </div>
            <div className={styles.contentContainer}>
                {collapsed && (
                    <IoIosArrowDropright onClick={toggleCollapsed} size={22} className={styles.expandIcon} />
                )}
                <div className={cs(styles.groupList, {
                    [styles.groupListCollapsed]: collapsed
                })}>
                    <List
                        data={questionGroups}
                        keyExtractor={item => item.id}
                        renderItem={renderQuestionGroupItem}
                        HeaderComponent={!collapsed && (
                            <div className={styles.groupHeader}>
                                <div className={styles.groupTitle}>
                                    <Localize>QUESTION GROUPS</Localize>
                                </div>
                                <IoIosArrowDropleft onClick={toggleCollapsed} size={22} className={styles.collapseIcon} />
                            </div>
                        )}
                    />
                </div>
                <div ref={contentRef} className={styles.content}>
                    {activeGroupIndex === questionGroups?.length ? (
                        <>
                            <div className={styles.contentMessage}>
                                <div className={styles.contentTextContainer}>
                                    <img 
                                        src={isFormIncomplete ? NoSurveyImage : CompletedTaskImage} 
                                        alt={isFormIncomplete ? _('Task Incomplete')  : _('Task Complete')}
                                        className={styles.completeImage} 
                                    />
                                    <p className={styles.completeText}>
                                        {isFormIncomplete 
                                            ? _('You have not filled in all the required fields in the form.')
                                            : _('You have now completed all modules and sub-modules that you previously selected in the initial NEAT+ survey page.')
                                        } 
                                    </p>
                                    <p className={cs(styles.completeText, {
                                        [styles.completeTextWarning]: isFormIncomplete,
                                    })}>
                                        {isFormIncomplete 
                                            ? _('Please go back and complete the form in order to continue.')
                                            : _('Please follow the provided instructions for how to download and analyse this information.')
                                        }
                                    </p>
                                </div>
                            </div>
                            {!!error && (
                                <span className={styles.errorMessage}>
                                    {getErrorMessage(error)}
                                </span>
                            )}
                            <div className={styles.buttons}>
                                <Button
                                    secondary 
                                    className={styles.button} 
                                    onClick={handlePreviousClick}
                                >
                                    <BsArrowLeft size={22} className={styles.buttonIconLeft} />
                                    <Localize>Previous</Localize>
                                </Button>
                                {editable && (
                                    <Button 
                                        disabled={
                                            isFormIncomplete 
                                                || !questionGroups?.length 
                                                || !AVAILABLE_SURVEY_MODULES.includes(moduleCode)
                                        }
                                        loading={loading || addingAnswers || addingResults}
                                        className={cs(styles.button, styles.buttonNext)} 
                                        onClick={handleValidate}
                                    >
                                        <BsCheck size={22} className={styles.buttonIconLeft} />

                                        <Localize>Calculate</Localize>
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <GroupContent 
                            editable={editable}
                            activeGroup={activeGroup} 
                            questions={activeQuestions}
                            onPreviousClick={handlePreviousClick}
                            onNextClick={handleNextClick}
                            showPrevious={activeGroupIndex!==0}
                            showNext={activeGroupIndex!==questionGroups.length}
                            showRequired={showRequired}
                        />
                    )}
                </div>

            </div>
            <div className={styles.footer}>
                <div className={styles.footerLink} onClick={handleFirstIndex}>
                    <RiSkipBackLine size={20} className={styles.footerLinkIconLeft} />
                    <Localize>Back to the beginning</Localize>
                </div>
                {questionGroups?.length <= touchedGroupIndexes.current.length && (
                    <div className={styles.footerLink} onClick={handleLastIndex}>
                        <Localize>Go to the end</Localize>
                        <RiSkipForwardLine size={20} className={styles.footerLinkIconRight} />
                    </div>
                )}
            </div> 
        </Modal>
    );
};

export default withVisibleCheck(TakeSurveyModal);
