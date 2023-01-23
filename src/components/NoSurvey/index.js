import {useMemo} from 'react';
import {Link} from 'react-router-dom';
import {useSelector} from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';

import {BsPlus} from 'react-icons/bs';
import {BiChevronLeft} from 'react-icons/bi';

import {NeatLoader} from 'components/Loader';
import Button from 'components/Button';
import SurveyModals from 'components/SurveyModals';
import {Localize} from '@ra/components/I18n';

import {_} from 'services/i18n';
import useInitActiveProject from 'hooks/useInitActiveProject';
import useSurveyModals from 'hooks/useSurveyModals';
import {checkEditAccess} from 'utils/permission';
    
import noSurveyImage from 'assets/images/no-survey.svg';

import styles from './styles.scss';

const NoSurveys = () => {
    const surveyModalsConfig = useSurveyModals('sens');

    const {activeProject} = useSelector(state => state.project);

    const hasEditAccess = useMemo(() => checkEditAccess(activeProject?.accessLevel), [activeProject]);

    return (
        <div className={styles.container}>
            <Link to="/projects" className={styles.backLink}>
                <BiChevronLeft size={22} className={styles.backIcon} /> <Localize>Back to Projects</Localize>
            </Link>
            <main className={styles.content}>
                <div className={styles.takeSurveyBox}>
                    <img src={noSurveyImage} alt={_('No Surveys')} className={styles.infoImage} />
                    <p className={styles.infoText}><Localize>No surveys found</Localize></p>
                    {hasEditAccess && (
                        <Button 
                            className={styles.button} 
                            onClick={surveyModalsConfig.handleShowDeleteDraft}
                        >
                            <BsPlus size={24} className={styles.buttonIcon} /><Localize>Take Survey</Localize>
                        </Button>
                    )}
                </div>
            </main>
            <SurveyModals {...surveyModalsConfig} />
        </div>
    );
};

export default NoSurveys;

export const withNoSurvey = WrappedComponent => {
    const WithNoSurvey = (props) => {
        useInitActiveProject();

        const {activeProject} = useSelector(state => state.project);
        const {status, surveys} = useSelector(state => state.survey);

        if(activeProject && surveys.some(sur => sur.project === activeProject.id)) {
            return <WrappedComponent {...props} />;
        }
        if(status !== 'complete') {
            return <NeatLoader containerClassName={styles.loaderContainer} />;
        }
        return <NoSurveys />;
    };
    return hoistNonReactStatics(WithNoSurvey, WrappedComponent);
};
