import {useCallback} from 'react';
import {Link} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {FaGithub, FaLinkedin, FaTwitter, FaYoutube} from 'react-icons/fa';

import Container from 'components/Container';
import {Localize} from '@ra/components/I18n';

import List from '@ra/components/List';

import logo from 'assets/images/logo-light.svg';

import styles from './styles.scss';

const keyExtractor = item => item.id;

const Footer = () => {
    const {legislations} = useSelector((state) => state.legislation);
    const renderLink = useCallback(({item}) => {
        return (
            <Link
                className={styles.policyLink}
                to={{
                    pathname: '/legal-document', 
                    title: item?.documentType
                }}
            >
                {item?.documentType.split('-').join(' ')}
            </Link>
        );
    }, []);
    return (
        <section className={styles.footerContainer}>
            <Container>
                <footer className={styles.footer}>
                    <div className={styles.footerHead}>
                        <img className={styles.footerLogo} src={logo} alt="neat-logo" />
                        <div className={styles.socialIconWrapper}>
                            <a href="https://www.linkedin.com/in/joint-environment-unit-jeu-a073646a/" target="_blank" rel="noreferrer">
                                <FaLinkedin className={styles.socialIcon} />
                            </a>
                            <a href="https://twitter.com/EnvironmentOcha/" target="_blank" rel="noreferrer">
                                <FaTwitter className={styles.socialIcon} />
                            </a>
                            <a href="https://www.youtube.com/channel/UCfAAS7C2HdQ13WmA9rhupPQ" target="_blank" rel="noreferrer">
                                <FaYoutube className={styles.socialIcon} />
                            </a>
                            <a href="https://github.com/NeatPlus/" target="_blank" rel="noreferrer">
                                <FaGithub className={styles.socialIcon} />
                            </a>
                        </div>
                    </div>
                    <hr className={styles.seperator} />
                    <div className={styles.footerNav}>
                        <div className={styles.footerNavList}>
                            <h4 className={styles.footerNavTitle}><Localize>ABOUT</Localize></h4>
                            <div className={styles.footerNavItem}>
                                <Link className={styles.footerNavLink} to="/about">
                                    <Localize>Why Environmental Assessments in Humanitarian Operations?</Localize>
                                </Link>
                            </div>
                            <div className={styles.footerNavItem}>
                                <Link className={styles.footerNavLink} to="/about">
                                    <Localize>About NEAT+</Localize>
                                </Link>
                            </div>
                            <div className={styles.footerNavItem}>
                                <Link className={styles.footerNavLink} to="/access">
                                    <Localize>Rural and Urban NEAT+</Localize>
                                </Link>
                            </div>
                            <div className={styles.footerNavItem}>
                                <Link className={styles.footerNavLink} to="/about">
                                    <Localize>History of the NEAT+</Localize>
                                </Link>
                            </div>
                        </div>
                        <div className={styles.footerNavList}>
                            <h4 className={styles.footerNavTitle}><Localize>ACCESS THE NEAT+</Localize></h4>
                            <div className={styles.footerNavItem}>
                                <Link className={styles.footerNavLink} to="/access">
                                    <Localize>Urban NEAT+</Localize>
                                </Link>
                            </div>
                            <div className={styles.footerNavItem}>
                                <Link className={styles.footerNavLink} to="/access">
                                    <Localize>Rural NEAT+</Localize>
                                </Link>
                            </div>
                        </div>
                        <div className={styles.footerNavList}>
                            <h4 className={styles.footerNavTitle}><Localize>NEAT+ IN ACTION</Localize></h4>
                            <div className={styles.footerNavItem}>
                                <Link className={styles.footerNavLink} to="/action">
                                    <Localize>Scoping Videos and Reports</Localize>
                                </Link>
                            </div>
                        </div>
                        <div className={styles.footerNavList}>
                            <h4 className={styles.footerNavTitle}><Localize>RESOURCE AND SUPPORT</Localize></h4>
                            <div className={styles.footerNavItem}>
                                <Link className={styles.footerNavLink} to="/resource">
                                    <Localize>Videos and Guidance</Localize>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <hr className={styles.seperator} />
                    <div className={styles.footerCred}>
                        <div className={styles.rightInfo}>
                            &copy; NEAT+,{new Date().getFullYear()}
                        </div>
                        {legislations.length > 0 && (
                            <List
                                className={styles.rightContent}
                                data={legislations}
                                renderItem={renderLink}
                                keyExtractor={keyExtractor}
                            />
                        )}
                    </div>
                </footer>
            </Container>
        </section>
    );
};

export default Footer;
