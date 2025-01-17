export const SET_STATUS = 'SET_STATUS';
export const SET_SURVEYS = 'SET_SURVEYS';
export const SET_SURVEY_ANSWERS = 'SET_SURVEY_ANSWERS';
export const SET_ACTIVE_SURVEY = 'SET_ACTIVE_SURVEY';
export const SET_SURVEY_RESULTS = 'SET_SURVEY_RESULTS';

export function setStatus(status) {
    return {type: SET_STATUS, status};
}

export function setSurveys(surveys) {
    return {type: SET_SURVEYS, surveys};
}

export function setActiveSurvey(survey) {
    return {type: SET_ACTIVE_SURVEY, survey};
}

export function setSurveyAnswers(answers) {
    return {type: SET_SURVEY_ANSWERS, answers};
}

export function setSurveyResults(results) {
    return {type: SET_SURVEY_RESULTS, results};
}
