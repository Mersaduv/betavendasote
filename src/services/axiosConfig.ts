import axios, { AxiosInstance } from 'axios'

// const baseURLOrg = 'https://apivendamode.liara.run'
const baseURLOrg = 'https://103.75.199.190'
// const baseURL = 'http://localhost:5244'
const instance: AxiosInstance = axios.create({
  baseURL: baseURLOrg,
  httpsAgent: new (require('https').Agent)({  
    rejectUnauthorized: false 
  })
});
export default instance
