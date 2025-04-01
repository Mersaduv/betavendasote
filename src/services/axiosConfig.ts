import axios, { AxiosInstance } from 'axios'

// const baseURLOrg = 'https://apivendamode.liara.run'
// const baseURLOrg = 'https://localhost:7004'
const baseURLOrg = 'https://45.159.150.230'
// const baseURL = 'http://localhost:5244'
const instance: AxiosInstance = axios.create({
  baseURL: baseURLOrg,

});
export default instance
