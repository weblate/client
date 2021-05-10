import {Link} from 'react-router-dom';

import styles from './styles.scss';

import Button from 'components/Button';

const Home = () => {
    return (
        <div className={styles.containerHome}>
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
            <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                Learn React
            </a>
            <Link to="/login">
                <Button className={styles.button}>Go to Login</Button>
            </Link>
            <Link to="/projects">
                <Button className={styles.button}>Go to projects</Button>
            </Link>
            <Link to="/surveys">
                <Button className={styles.button}>Go to surveys</Button>
            </Link>
        </div>
    );
};

export default Home;
