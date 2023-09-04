import axios from 'axios';
import encapsulationAxios from './encapsulationAxios';

axios.defaults.preventRepeat = true;

encapsulationAxios(axios);
