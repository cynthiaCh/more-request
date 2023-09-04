import globalAxios from 'axios';
import encapsulationAxios from './encapsulationAxios';

const axios = globalAxios.create({
  preventRepeat: true,
  repeatCacheTime: 500,
});

export default encapsulationAxios(axios);
