import {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import ReactMapGL, {NavigationControl, Marker} from 'react-map-gl';
import WebMercatorViewport from '@math.gl/web-mercator';
import {FaMapMarkerAlt} from 'react-icons/fa';
import { maxBy, minBy } from 'lodash';

import cs from '@ra/cs';

import MarkerPin from './Marker';
import SurveyMarker from './SurveyMarker';
import Popup from './Popup';
import styles from './styles.scss';
import 'mapbox-gl/dist/mapbox-gl.css';

const navControlStyle = {
    position: 'absolute',
    right: 10,
    top: 10,
};

const getMinOrMax = (markers, minOrMax, idx) => {
    if (minOrMax === 'max') {
        return (maxBy(markers, value => value.coordinates[idx])).coordinates[idx];
    } else {
        return (minBy(markers, value => value.coordinates[idx])).coordinates[idx];
    }
};

const getBounds = (markers) => {
    const maxLat = getMinOrMax(markers, 'max', 1);
    const minLat = getMinOrMax(markers, 'min', 1);
    const maxLng = getMinOrMax(markers, 'max', 0);
    const minLng = getMinOrMax(markers, 'min', 0);

    const southWest = [minLng, minLat];
    const northEast = [maxLng, maxLat];
    return [southWest, northEast];
};


function Picker(props) {
    const {isActive, setActive} = props;

    const handlePickerClick = useCallback(() => setActive(!isActive), [isActive, setActive]);

    return (
        <div
            className={cs(styles.pickerControl, {
                [styles.pickerControlActive]: isActive,
            })}
            onClick={handlePickerClick}
        >
            <FaMapMarkerAlt className={styles.pickerIcon} />
        </div>
    );
}


const Map = ({
    showPopup,
    project,
    surveyLocation,
    showPicker,
    onLocationPick,
    width,
    height,
    activeFeature,
    features,
}) => {
    const mapRef = useRef();

    const [viewport, setViewport] = useState({
        style: {
            width: width || '100%',
            height: height || '100%'
        },
        latitude: 0.0236,
        longitude: 37.9062,
        zoom: 3,
        mapboxAccessToken: ''
    });

    const goToActiveFeature = useCallback(() => {
        if(!activeFeature) {
            return;
        }
        const [longitude, latitude] = activeFeature[
            activeFeature.type === 'Point' ? 'coordinates' : 'center'
        ];
        const zoom = 10;
        setViewport({
            ...viewport,
            longitude,
            latitude,
            zoom,
        });
        mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom,
            duration: 1000
        });
    }, [viewport, activeFeature]);

    const resetZoom = useCallback(() => {
        setViewport({
            ...viewport,
            zoom: 3,
        });
        mapRef.current?.flyTo({
            center: [viewport.longitude, viewport.latitude],
            zoom: 3
        });
    }, [viewport]);

    useEffect(() => {
        if(activeFeature) {
            goToActiveFeature();
        } else {
            resetZoom();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFeature]);

    const [isPickerActive, setPickerActive] = useState(null);

    const handleMapClick = useCallback(ptrEvent => {
        if(!isPickerActive) {
            return ptrEvent.preventDefault();
        }
        setPickerActive(false);
        onLocationPick && onLocationPick(ptrEvent.lngLat);
    }, [isPickerActive, onLocationPick]);

    const surveyFeature = useMemo(() => {
        if(surveyLocation && typeof surveyLocation === 'string') {
            return JSON.parse(surveyLocation);
        }
        if(features?.length === 1) {
            return features[0];
        }
        return surveyLocation;
    }, [surveyLocation, features]);

    useEffect(() => {
        if(surveyFeature) {
            setViewport({
                ...viewport,
                longitude: surveyFeature.coordinates[0],
                latitude: surveyFeature.coordinates[1],
                zoom: 5,
            });
            mapRef.current?.flyTo({
                center: [surveyFeature.coordinates[0], surveyFeature.coordinates[1]],
                zoom: 5,
                duration: 1000
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [surveyFeature]);

    useEffect(() => {
        if(features?.length > 1) {
            const MARKERS_BOUNDS = getBounds(features);
            setViewport((viewport) => {
                const {width, height} = viewport.style;
                const NEXT_VIEWPORT = new WebMercatorViewport({
                    ...viewport,
                    width: width,
                    height: height
                }).fitBounds(MARKERS_BOUNDS, {
                    padding: {
                        top: 100,
                        left: 100,
                        right: 100,
                        bottom: 220,
                    }
                });
                mapRef.current?.flyTo({
                    center: [NEXT_VIEWPORT.longitude, NEXT_VIEWPORT.latitude],
                    zoom: NEXT_VIEWPORT.zoom,
                    duration: 1000
                });
                return {...viewport, ...NEXT_VIEWPORT};
            });
        }
    }, [features]);

    return (
        <ReactMapGL
            {...viewport}
            ref={mapRef}
            onMove={evt => setViewport(prev => ({...prev, ...evt.viewState}))}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_API_TOKEN}
            mapStyle="mapbox://styles/mapbox/light-v9"
            attributionControl={false}
            logoPosition={showPopup ? 'top-left' : 'bottom-left'}
            onClick={handleMapClick}
        >
            <NavigationControl style={navControlStyle} showCompass={false} />
            {showPopup && <Popup project={project} className={styles.popup} />}
            {showPicker && (
                <Picker
                    isActive={isPickerActive}
                    setActive={setPickerActive}
                />
            )}
            {activeFeature?.type === 'Point' && (
                <Marker
                    latitude={activeFeature.coordinates[1]}
                    longitude={activeFeature?.coordinates[0]}
                >
                    <MarkerPin />
                </Marker>
            )}
            {(activeFeature?.type !== 'Point' && activeFeature?.center) && (
                <Marker
                    latitude={activeFeature.center[1]}
                    longitude={activeFeature.center[0]}
                >
                    <MarkerPin />
                </Marker>
            )}
            {!!surveyFeature && (
                <Marker
                    latitude={surveyFeature.coordinates[1]}
                    longitude={surveyFeature.coordinates[0]}
                >
                    <SurveyMarker />
                </Marker>
            )}
            {features?.length > 1 && features.map((feature, idx) => (
                <Marker
                    key={idx}
                    latitude={feature.coordinates[1]}
                    longitude={feature.coordinates[0]}
                >
                    <SurveyMarker />
                </Marker>
            ))}
        </ReactMapGL>
    );
};

export default Map;
